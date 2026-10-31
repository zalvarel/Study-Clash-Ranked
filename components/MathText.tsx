'use client';

import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

type MathSegment = { type: 'text' | 'inline' | 'block'; content: string };

const MATH_FUNCS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'log', 'ln', 'lim', 'det', 'gcd', 'lcm', 'mod'
]);

function hasNormalWords(str: string): boolean {
  // Abaikan perintah backslash LaTeX agar kata dalam macro tidak terhitung kata bahasa alami
  const stripped = str.replace(/\\[a-zA-Z]+(?:\s*\{[^{}]*\}|\s*\[[^\]]*\])*/g, '');
  const words = stripped.match(/\b[a-zA-Z]{2,}\b/g) || [];
  return words.some(w => !MATH_FUNCS.has(w.toLowerCase()));
}

function parseUnmarkedText(text: string, segments: MathSegment[]) {
  if (!text) return;

  // Pisahkan kata sambung Indonesia seperti "atau", "dan", "saja"
  const connectiveRegex = /\b(atau|dan|saja)\b/gi;
  if (connectiveRegex.test(text)) {
    let lastIdx = 0;
    let cMatch: RegExpExecArray | null;
    connectiveRegex.lastIndex = 0;
    while ((cMatch = connectiveRegex.exec(text)) !== null) {
      if (cMatch.index > lastIdx) {
        parseUnmarkedText(text.slice(lastIdx, cMatch.index), segments);
      }
      segments.push({ type: 'text', content: ` ${cMatch[0]} ` });
      lastIdx = connectiveRegex.lastIndex;
    }
    if (lastIdx < text.length) {
      parseUnmarkedText(text.slice(lastIdx), segments);
    }
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    segments.push({ type: 'text', content: text });
    return;
  }

  // Deteksi macro LaTeX seperti \frac{...}{...}, \sqrt{...}, \pm, \times, dll.
  const latexPattern = /(\\[a-zA-Z]+(?:\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\s*\[[^\]]*\])*)/g;
  if (latexPattern.test(trimmed)) {
    if (!hasNormalWords(trimmed)) {
      segments.push({ type: 'inline', content: trimmed });
      return;
    }
    let lastLIdx = 0;
    let lMatch: RegExpExecArray | null;
    latexPattern.lastIndex = 0;
    while ((lMatch = latexPattern.exec(trimmed)) !== null) {
      if (lMatch.index > lastLIdx) {
        segments.push({ type: 'text', content: trimmed.slice(lastLIdx, lMatch.index) });
      }
      segments.push({ type: 'inline', content: lMatch[0] });
      lastLIdx = latexPattern.lastIndex;
    }
    if (lastLIdx < trimmed.length) {
      segments.push({ type: 'text', content: trimmed.slice(lastLIdx) });
    }
    return;
  }

  // Deteksi pangkat dengan caret ^ (contoh: x^2 - 2, 3x^2, (x-3)^2)
  if (/\^/.test(trimmed) && !hasNormalWords(trimmed)) {
    segments.push({ type: 'inline', content: trimmed });
    return;
  }

  // Deteksi ekspresi aljabar tanpa kata bahasa alami (contoh: x - 2, x + 2, x > 5, 2n + 3 = 9, ±6)
  if (
    !hasNormalWords(trimmed) &&
    (/[\+\-\*\/\=\<\>\(\)\±\×\÷\^]|\d+[a-zA-Z]|[a-zA-Z]\d+|^[a-zA-Z]$/.test(trimmed))
  ) {
    segments.push({ type: 'inline', content: trimmed });
    return;
  }

  segments.push({ type: 'text', content: text });
}

export function MathText({ text, className }: MathTextProps) {
  const segments = React.useMemo(() => {
    if (!text) return [];

    const parts: MathSegment[] = [];
    const dollarRegex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let hasDollar = false;

    while ((match = dollarRegex.exec(text)) !== null) {
      hasDollar = true;
      if (match.index > lastIndex) {
        parseUnmarkedText(text.slice(lastIndex, match.index), parts);
      }
      if (match[1] !== undefined) {
        parts.push({ type: 'block', content: match[1] });
      } else if (match[2] !== undefined) {
        parts.push({ type: 'inline', content: match[2] });
      }
      lastIndex = dollarRegex.lastIndex;
    }

    if (hasDollar) {
      if (lastIndex < text.length) {
        parseUnmarkedText(text.slice(lastIndex), parts);
      }
      return parts;
    }

    parseUnmarkedText(text, parts);
    return parts;
  }, [text]);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.content}</span>;
        }

        try {
          const html = katex.renderToString(seg.content, {
            displayMode: seg.type === 'block',
            throwOnError: false,
          });
          return (
            <span
              key={i}
              className={seg.type === 'block' ? 'block my-2 text-center' : 'inline-block mx-0.5 align-middle'}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={i}>{seg.content}</span>;
        }
      })}
    </span>
  );
}

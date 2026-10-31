'use client';

import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export function MathText({ text, className }: MathTextProps) {
  const segments = React.useMemo(() => {
    const parts: Array<{ type: 'text' | 'inline' | 'block'; content: string }> = [];
    const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      if (match[1] !== undefined) {
        parts.push({ type: 'block', content: match[1] });
      } else if (match[2] !== undefined) {
        parts.push({ type: 'inline', content: match[2] });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }
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
              className={seg.type === 'block' ? 'block my-2 text-center' : 'inline-block mx-0.5'}
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

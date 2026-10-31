'use client';

import React from 'react';

interface TimerProps {
  deadlineAt: string;
  onExpire?: () => void;
}

export function Timer({ deadlineAt, onExpire }: TimerProps) {
  const [remaining, setRemaining] = React.useState<number>(30);
  const onExpireRef = React.useRef(onExpire);
  onExpireRef.current = onExpire;

  React.useEffect(() => {
    const update = () => {
      const now = Date.now();
      const deadline = new Date(deadlineAt).getTime();
      const diff = Math.max(0, Math.ceil((deadline - now) / 1000));
      setRemaining(diff);

      if (diff === 0) {
        onExpireRef.current?.();
      }
    };

    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [deadlineAt]);

  const pct = Math.min(100, Math.max(0, (remaining / 30) * 100));
  const isUrgent = remaining <= 10;

  return (
    <div className="w-full flex flex-col items-center gap-1.5">
      <div
        className={`text-4xl font-black tabular-nums transition-colors ${
          isUrgent ? 'text-red-400 animate-pulse' : 'text-white'
        }`}
      >
        {remaining}s
      </div>
      <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-200 ${
            isUrgent ? 'bg-red-500' : 'bg-primary-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

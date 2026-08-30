import React from 'react';

type Props = {
  step: number;
  total: number;
};

export function ProgressRail({ step, total }: Props) {
  return (
    <div className="flex flex-1 items-center gap-1.5 max-w-[200px] px-2">
      {Array.from({ length: total }).map((_, index) => {
        const isCurrent = index + 1 === step;
        const isCompleted = index + 1 < step;

        return (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              isCurrent
                ? 'bg-[var(--accent)]'
                : isCompleted
                ? 'bg-[var(--silver)] opacity-80'
                : 'bg-[var(--border)]'
            }`}
          />
        );
      })}
    </div>
  );
}

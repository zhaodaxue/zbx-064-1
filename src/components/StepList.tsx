import { Check } from 'lucide-react';
import { useDisassemblyStore } from '../store/useDisassemblyStore';
import { STEPS } from '../data/steps';
import type { StepIndex } from '../types';
import { clsx } from 'clsx';

export function StepList() {
  const currentStep = useDisassemblyStore((s) => s.currentStep);
  const goTo = useDisassemblyStore((s) => s.goTo);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-200 mb-1" style={{ fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif' }}>
          拆解步骤
        </h2>
        <p className="text-sm text-amber-200/60">按顺序逐步拆解斗拱构件</p>
      </div>

      <div className="flex-1 relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-600/40 via-amber-700/30 to-amber-900/20" />

        <ol className="space-y-3 relative">
          {STEPS.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isClickable = index <= currentStep + 1 || isCompleted || isCurrent;

            return (
              <li key={step.id}>
                <button
                  onClick={() => isClickable && goTo(step.id as StepIndex)}
                  disabled={!isClickable}
                  className={clsx(
                    'w-full flex items-start gap-4 p-3 rounded-xl text-left transition-all duration-300',
                    isClickable && 'cursor-pointer hover:bg-amber-900/30',
                    !isClickable && 'cursor-not-allowed opacity-50',
                    isCurrent && 'bg-gradient-to-r from-amber-900/60 to-amber-800/30 ring-1 ring-amber-500/40 shadow-lg shadow-amber-950/40'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={clsx(
                        'relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                        isCurrent && 'scale-110 bg-amber-500 shadow-lg shadow-amber-500/50 ring-4 ring-amber-500/20',
                        isCompleted && !isCurrent && 'bg-amber-700/80',
                        !isCurrent && !isCompleted && 'bg-amber-950/60 ring-1 ring-amber-800/50'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-amber-100" strokeWidth={3} />
                      ) : (
                        <span
                          className={clsx(
                            'text-sm font-bold',
                            isCurrent ? 'text-amber-950' : 'text-amber-300'
                          )}
                        >
                          {step.id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <h3
                      className={clsx(
                        'font-semibold text-base leading-tight mb-0.5 transition-colors',
                        isCurrent ? 'text-amber-100' : 'text-amber-200/80'
                      )}
                    >
                      {step.title}
                    </h3>
                    {step.partName && (
                      <span className={clsx(
                        'inline-block text-xs px-2 py-0.5 rounded-full',
                        isCurrent ? 'bg-amber-500/30 text-amber-200' : 'bg-amber-900/40 text-amber-400/80'
                      )}>
                        构件：{step.partName}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 pt-4 border-t border-amber-900/30">
        <div className="flex items-center justify-between text-xs text-amber-300/70 mb-2">
          <span>进度</span>
          <span className="font-mono text-amber-200">{currentStep} / 3</span>
        </div>
        <div className="h-1.5 rounded-full bg-amber-950/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

import { useDisassemblyStore } from '../store/useDisassemblyStore';
import { STEPS } from '../data/steps';
import { BookOpen, Hammer, ArrowRight } from 'lucide-react';

export function InfoPanel() {
  const currentStep = useDisassemblyStore((s) => s.currentStep);
  const next = useDisassemblyStore((s) => s.next);
  const totalSteps = useDisassemblyStore((s) => s.totalSteps);

  const step = STEPS.find((s) => s.id === currentStep) ?? STEPS[0];
  const hasNext = currentStep < totalSteps;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <BookOpen className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-amber-200" style={{ fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif' }}>
            工艺说明
          </h2>
          <p className="text-xs text-amber-300/50">当前步骤详解</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <article
          key={step.id}
          className="animate-fadeIn"
        >
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/20 text-amber-300 text-xs font-medium mb-3">
              <Hammer className="w-3.5 h-3.5" />
              步骤 {step.id} / {totalSteps}
            </div>
            <h3 className="text-2xl font-bold text-amber-100 leading-tight mb-3" style={{ fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif' }}>
              {step.title}
            </h3>
            {step.partName && (
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <span className="px-2 py-0.5 rounded bg-amber-900/50 border border-amber-700/40">
                  本次操作构件
                </span>
                <span className="font-semibold text-amber-200">{step.partName}</span>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-amber-500 to-amber-800" />
            <div className="pl-5">
              <p className="text-amber-200/85 leading-[1.9] text-[15px]">
                {step.description}
              </p>
            </div>
          </div>
        </article>
      </div>

      {hasNext && (
        <div className="mt-5 pt-4 border-t border-amber-900/30">
          <button
            onClick={next}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-amber-950 font-semibold text-sm transition-all duration-200 shadow-lg shadow-amber-900/40 hover:shadow-amber-700/40 active:scale-[0.98]"
          >
            <span>进行下一步</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {!hasNext && (
        <div className="mt-5 pt-4 border-t border-amber-900/30">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-600/30">
            <p className="text-amber-200 text-sm font-medium text-center">
              ✦ 拆解演示已完成 ✦
            </p>
            <p className="text-amber-400/80 text-xs text-center mt-1">
              点击「上一步」可查看装配复原过程
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

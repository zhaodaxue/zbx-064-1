import { ChevronLeft, ChevronRight, RotateCcw, MousePointer2, Loader2 } from 'lucide-react';
import { useDisassemblyStore } from '../store/useDisassemblyStore';
import { clsx } from 'clsx';

export function ControlBar() {
  const currentStep = useDisassemblyStore((s) => s.currentStep);
  const totalSteps = useDisassemblyStore((s) => s.totalSteps);
  const next = useDisassemblyStore((s) => s.next);
  const prev = useDisassemblyStore((s) => s.prev);
  const reset = useDisassemblyStore((s) => s.reset);
  const isAnimating = useDisassemblyStore((s) => s.isAnimating);
  const isTransitioning = useDisassemblyStore((s) => s.isTransitioning);
  const canControl = useDisassemblyStore((s) => s.canControlSteps());

  const canPrev = currentStep > 0 && canControl;
  const canNext = currentStep < totalSteps && canControl;
  const canReset = currentStep > 0 && canControl;

  const isLocked = isAnimating || isTransitioning;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 relative">
      <div className="flex items-center gap-2 text-amber-300/60 text-xs">
        <MousePointer2 className="w-3.5 h-3.5" />
        <span>拖拽旋转 · 滚轮缩放 · 双击/按 R 重置视角 · 点击构件查看详情</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          disabled={!canReset}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all duration-200',
            canReset
              ? 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/70 hover:text-amber-200 border-amber-800/40'
              : 'bg-amber-950/30 text-amber-700/60 border-amber-900/30 cursor-not-allowed'
          )}
          title="重置为完整状态"
        >
          <RotateCcw className={clsx('w-4 h-4', isLocked && 'animate-spin')} />
          <span>{isLocked ? '动画中' : '重置'}</span>
        </button>

        <div className="h-6 w-px bg-amber-800/40" />

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={!canPrev}
            className={clsx(
              'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 border',
              canPrev
                ? 'bg-amber-800/60 border-amber-600/50 text-amber-100 hover:bg-amber-700/70 hover:border-amber-500/60 shadow-md shadow-amber-950/40 active:scale-95'
                : 'bg-amber-950/40 border-amber-900/40 text-amber-700/60 cursor-not-allowed'
            )}
            title="上一步"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-800/40 min-w-[80px] text-center relative">
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-amber-950/80 rounded-lg">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              </div>
            )}
            <span className="font-mono text-amber-200 text-sm font-bold">
              {currentStep}
            </span>
            <span className="text-amber-500/80 text-sm mx-1">/</span>
            <span className="font-mono text-amber-500/80 text-sm">
              {totalSteps}
            </span>
          </div>

          <button
            onClick={next}
            disabled={!canNext}
            className={clsx(
              'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 border',
              canNext
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400/60 text-amber-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-600/40 active:scale-95'
                : 'bg-amber-950/40 border-amber-900/40 text-amber-700/60 cursor-not-allowed'
            )}
            title="下一步"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-[200px] text-right">
        {isTransitioning && (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            正在播放过渡动画...
          </span>
        )}
      </div>
    </div>
  );
}

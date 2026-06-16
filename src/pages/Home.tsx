import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { StepList } from '../components/StepList';
import { InfoPanel } from '../components/InfoPanel';
import { ControlBar } from '../components/ControlBar';
import { SceneSetup } from '../three/SceneSetup';
import { OrbitCamera } from '../three/OrbitCamera';
import { DougongMesh } from '../three/DougongMesh';
import { useDisassemblyStore } from '../store/useDisassemblyStore';
import { Palmtree, Eye, Loader2 } from 'lucide-react';
import { PARTS_DATA } from '../data/parts';
import type { PartId } from '../types';

export default function Home() {
  const next = useDisassemblyStore((s) => s.next);
  const prev = useDisassemblyStore((s) => s.prev);
  const canControlSteps = useDisassemblyStore((s) => s.canControlSteps());
  const selectedPart = useDisassemblyStore((s) => s.selectedPart);
  const isAnimating = useDisassemblyStore((s) => s.isAnimating);
  const isTransitioning = useDisassemblyStore((s) => s.isTransitioning);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (canControlSteps) next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (canControlSteps) prev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev, canControlSteps]);

  const getStatusIndicator = () => {
    if (isTransitioning) {
      return (
        <>
          <Loader2 className="w-2 h-2 text-amber-400 animate-spin" />
          <span className="text-xs text-amber-200/80">正在播放过渡动画...</span>
        </>
      );
    }
    if (isAnimating) {
      return (
        <>
          <Loader2 className="w-2 h-2 text-amber-400 animate-spin" />
          <span className="text-xs text-amber-200/80">构件动画中...</span>
        </>
      );
    }
    if (selectedPart) {
      const part = PARTS_DATA[selectedPart as PartId];
      return (
        <>
          <Eye className="w-2 h-2 text-sky-400 animate-pulse" />
          <span className="text-xs text-sky-200/80">正在指认「{part.name}」</span>
        </>
      );
    }
    return (
      <>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-amber-200/80">三维场景已就绪</span>
      </>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1a0f08]">
      <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#2c1810] via-[#3e2723] to-[#2c1810] border-b border-amber-900/40 shadow-lg shadow-black/30 z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-900/50">
            <Palmtree className="w-5 h-5 text-amber-50" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-amber-100 tracking-wide" style={{ fontFamily: '"Noto Serif SC", serif' }}>
              斗拱拆解演示系统
            </h1>
            <p className="text-[11px] text-amber-400/70">古建修缮技艺培训 · 三维交互演示</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-amber-400/60">
          <span className="hidden sm:inline">快捷键：← → 切换步骤 · R 重置视角</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 shrink-0 bg-gradient-to-b from-[#2c1810] to-[#1f140c] border-r border-amber-900/40 p-5 overflow-y-auto">
          <StepList />
        </aside>

        <main className="flex-1 relative min-w-0">
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [5.5, 4, 7], fov: 45 }}
            gl={{ antialias: true, alpha: false }}
          >
            <SceneSetup />
            <OrbitCamera />
            <DougongMesh />
          </Canvas>

          <div className={`absolute left-4 top-4 flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border ${
            selectedPart
              ? 'bg-sky-900/40 border-sky-700/30'
              : isTransitioning || isAnimating
              ? 'bg-amber-900/40 border-amber-700/30'
              : 'bg-black/40 border-amber-800/30'
          }`}>
            {getStatusIndicator()}
          </div>
        </main>

        <aside className="w-80 shrink-0 bg-gradient-to-b from-[#2c1810] to-[#1f140c] border-l border-amber-900/40 p-5 overflow-y-auto">
          <InfoPanel />
        </aside>
      </div>

      <footer className="shrink-0 bg-gradient-to-r from-[#2c1810] via-[#3e2723] to-[#2c1810] border-t border-amber-900/40">
        <ControlBar />
      </footer>
    </div>
  );
}

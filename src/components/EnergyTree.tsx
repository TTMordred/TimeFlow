import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface EnergyTreeProps {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const EnergyTree: React.FC<EnergyTreeProps> = ({
  progress,
  size = 'md',
  animated = true
}) => {
  const [treeProgress, setTreeProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      // Animate the progress change
      const timer = setTimeout(() => {
        setTreeProgress(progress);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setTreeProgress(progress);
    }
  }, [progress, animated]);

  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-40 h-60',
  };

  const getTreeStage = (progress: number) => {
    if (progress < 20) return 'seed';
    if (progress < 40) return 'sprout';
    if (progress < 60) return 'sapling';
    if (progress < 80) return 'young';
    return 'mature';
  };

  const stage = getTreeStage(treeProgress);

  const getTrunkHeight = () => {
    switch (stage) {
      case 'seed': return 'h-6';
      case 'sprout': return 'h-10';
      case 'sapling': return 'h-14';
      case 'young': return 'h-16';
      case 'mature': return 'h-20';
    }
  };

  const getFoliageSize = () => {
    switch (stage) {
      case 'seed': return 'w-8 h-8';
      case 'sprout': return 'w-12 h-16';
      case 'sapling': return 'w-16 h-24';
      case 'young': return 'w-20 h-28';
      case 'mature': return 'w-24 h-32';
    }
  };

  const getFoliageShape = () => {
    switch (stage) {
      case 'seed': return 'rounded-full scale-50';
      case 'sprout': return 'rounded-full scale-75';
      case 'sapling': return 'rounded-[70%]';
      case 'young': return 'rounded-[60%]';
      case 'mature': return 'rounded-[50%]';
    }
  };

  return (
    <div className={cn('relative flex flex-col items-center', sizeClasses[size])}>
      <div className="relative h-full flex items-end mb-2">
        {/* Tree trunk */}
        <div
          className={cn(
            "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 bg-[#854d0e] rounded-full z-10 transition-all duration-1000",
            getTrunkHeight()
          )}
        />
        
        {/* Tree container with clipping mask */}
        <div className={cn(
          "absolute left-1/2 transform -translate-x-1/2 overflow-hidden z-0 transition-all duration-1000",
          getFoliageSize(),
          stage === 'seed' ? 'bottom-8' : 'bottom-16'
        )}>
        {/* Tree foliage container */}
        <div className="absolute bottom-0 left-0 w-full h-full">
          {/* Tree foliage background (empty) */}
          <div
            className={cn(
              "absolute bottom-0 left-0 w-full h-full opacity-20 bg-[#dcfce7] transition-all duration-1000",
              getFoliageShape()
            )}
          />
          
          {/* Tree foliage filled based on progress */}
          <div
            className={cn(
              "absolute bottom-0 left-0 w-full bg-gradient-to-t transition-all duration-1000",
              stage === 'seed' ? 'from-[#15803d] to-[#22c55e]' :
              stage === 'sprout' ? 'from-[#16a34a] to-[#4ade80]' :
              'from-[#22c55e] to-[#86efac]',
              getFoliageShape(),
              animated && treeProgress > 0 && "animate-grow-tree"
            )}
            style={{
              height: animated ? (treeProgress > 0 ? '100%' : '0%') : `${treeProgress}%`
            }}
          />
        </div>
       </div>
     </div>

     {/* Progress text */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative w-24 h-2 bg-background/20 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] transition-all duration-1000 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"
            style={{ width: `${treeProgress}%` }}
          />
        </div>
        <span className="mt-2 text-sm font-medium text-foreground/90">
          {Math.round(treeProgress)}% Growth
        </span>
      </div>
    </div>
  );
};

export default EnergyTree;

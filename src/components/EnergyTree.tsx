
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

  return (
    <div className={cn('relative flex flex-col items-center justify-end', sizeClasses[size])}>
      {/* Tree trunk */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-20 bg-timeflow-bark rounded-full z-10" />
      
      {/* Tree container with clipping mask */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-32 overflow-hidden z-0">
        {/* Tree foliage container */}
        <div className="absolute bottom-0 left-0 w-full h-full">
          {/* Tree foliage background (empty) */}
          <div 
            className="absolute bottom-0 left-0 w-full h-full rounded-full opacity-20 bg-timeflow-green-100"
          />
          
          {/* Tree foliage filled based on progress */}
          <div 
            className={cn(
              "absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-timeflow-green-500 to-timeflow-green-300 transition-all duration-1000",
              animated && treeProgress > 0 && "animate-grow-tree"
            )}
            style={{ 
              height: animated ? (treeProgress > 0 ? '100%' : '0%') : `${treeProgress}%` 
            }}
          />
        </div>
      </div>
      
      {/* Progress text */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground">
        {Math.round(treeProgress)}%
      </div>
    </div>
  );
};

export default EnergyTree;

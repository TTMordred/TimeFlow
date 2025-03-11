
import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  maxStreak: number;
  animate?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ 
  currentStreak, 
  maxStreak, 
  animate = true 
}) => {
  return (
    <div className="glass rounded-xl p-4 flex flex-col items-center justify-center">
      <div className="flex items-center mb-2">
        <Flame 
          className={cn(
            "w-6 h-6 mr-2 text-orange-500",
            animate && currentStreak > 0 && "animate-pulse-slow"
          )}
          fill={currentStreak > 0 ? "#f97316" : "none"}
        />
        <h3 className="text-lg font-medium">Current Streak</h3>
      </div>
      
      <div className={cn(
        "text-4xl font-bold mb-1",
        animate && currentStreak > 0 && "animate-scale-in"
      )}>
        {currentStreak}
      </div>
      
      <div className="text-xs text-muted-foreground">
        Max Streak: {maxStreak}
      </div>
    </div>
  );
};

export default StreakCounter;

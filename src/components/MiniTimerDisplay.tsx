
import React from 'react';
import { useTimer } from '@/components/context/TimerContext';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const MiniTimerDisplay = () => {
  const { isActive, isPaused, secondsLeft, progress } = useTimer();

  // Only show if timer is active
  if (!isActive) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "flex items-center space-x-2 bg-primary/10 rounded-full px-3 py-1",
      isPaused ? "opacity-60" : "animate-pulse-slow"
    )}>
      <Clock className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{formatTime(secondsLeft)}</span>
      <div className="w-16 bg-secondary rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default MiniTimerDisplay;

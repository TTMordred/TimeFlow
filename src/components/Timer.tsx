
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimer } from '@/components/context/TimerContext';
import { useTimerSounds } from '@/hooks/useTimerSounds';

interface TimerProps {
  onProgress?: (progress: number) => void;
}

const Timer: React.FC<TimerProps> = ({ onProgress }) => {
  const { 
    isActive,
    isPaused,
    secondsLeft,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    sessionDuration
  } = useTimer();
  
  const { playSound, muted, toggleMute } = useTimerSounds();
  const prevSecondsRef = useRef(secondsLeft);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play tick sound on certain intervals
  useEffect(() => {
    if (isActive && !isPaused && secondsLeft !== prevSecondsRef.current) {
      // Play tick sound every minute or when there's 5, 4, 3, 2, 1 seconds left
      if (secondsLeft % 60 === 0 || (secondsLeft <= 5 && secondsLeft > 0)) {
        playSound('tick');
      }
      
      // Session completed
      if (prevSecondsRef.current > 0 && secondsLeft === 0) {
        playSound('complete');
      }
      
      prevSecondsRef.current = secondsLeft;
    }
  }, [isActive, isPaused, secondsLeft, playSound]);

  // Update parent component with progress
  useEffect(() => {
    if (onProgress) {
      onProgress(progress);
    }
  }, [progress, onProgress]);
  
  // Timer control handlers with sound
  const handleStart = () => {
    startTimer(sessionDuration);
    playSound('start');
  };
  
  const handlePause = () => {
    pauseTimer();
    playSound('pause');
  };
  
  const handleResume = () => {
    resumeTimer();
    playSound('resume');
  };
  
  const handleReset = () => {
    resetTimer();
    playSound('pause');
  };

  return (
    <div className="flex flex-col items-center glass p-8 rounded-2xl">
      <div className="text-5xl font-light mb-8 tracking-tight">
        {formatTime(secondsLeft)}
      </div>
      
      <div className="flex space-x-4">
        {!isActive ? (
          <Button 
            onClick={handleStart}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
        ) : (
          <>
            {!isPaused ? (
              <Button 
                onClick={handlePause}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button 
                onClick={handleResume}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
          </>
        )}
        
        <Button 
          onClick={handleReset}
          variant="outline"
          className="border-muted-foreground text-muted-foreground hover:bg-muted/50"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="w-full mt-8 bg-secondary rounded-full h-2 overflow-hidden">
        <div 
          className={cn(
            "h-full bg-primary transition-all duration-1000",
            isActive && !isPaused && "animate-pulse-slow"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;

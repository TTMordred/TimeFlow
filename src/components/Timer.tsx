
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimerProps {
  duration: number; // in minutes
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

const Timer: React.FC<TimerProps> = ({ 
  duration, 
  onComplete, 
  onProgress 
}) => {
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const totalSeconds = duration * 60;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = useCallback(
    () => ((totalSeconds - secondsLeft) / totalSeconds) * 100,
    [secondsLeft, totalSeconds]
  );

  const start = () => {
    setIsActive(true);
    setIsPaused(false);
    toast("Session started", {
      description: `Your ${duration} minute session has begun!`,
    });
  };

  const pause = () => {
    setIsPaused(true);
    toast("Session paused", {
      description: "You can resume your session at any time.",
    });
  };

  const resume = () => {
    setIsPaused(false);
    toast("Session resumed", {
      description: "Keep going! You're doing great.",
    });
  };

  const reset = () => {
    setIsActive(false);
    setIsPaused(false);
    setSecondsLeft(duration * 60);
    onProgress && onProgress(0);
    toast("Session reset", {
      description: "Your session has been reset.",
    });
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => {
          if (seconds <= 1) {
            clearInterval(interval!);
            setIsActive(false);
            onComplete && onComplete();
            toast("Session completed!", {
              description: "Congratulations on completing your session!",
            });
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, onComplete]);

  useEffect(() => {
    if (onProgress) {
      onProgress(calculateProgress());
    }
  }, [secondsLeft, onProgress, calculateProgress]);

  // Update the timer if the duration prop changes
  useEffect(() => {
    setSecondsLeft(duration * 60);
    if (isActive) {
      reset();
    }
  }, [duration]);

  return (
    <div className="flex flex-col items-center glass p-8 rounded-2xl">
      <div className="text-5xl font-light mb-8 tracking-tight">
        {formatTime(secondsLeft)}
      </div>
      
      <div className="flex space-x-4">
        {!isActive ? (
          <Button 
            onClick={start}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
        ) : (
          <>
            {!isPaused ? (
              <Button 
                onClick={pause}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button 
                onClick={resume}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
          </>
        )}
        
        <Button 
          onClick={reset}
          variant="outline"
          className="border-muted-foreground text-muted-foreground hover:bg-muted/50"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
      
      <div className="w-full mt-8 bg-secondary rounded-full h-2 overflow-hidden">
        <div 
          className={cn(
            "h-full bg-primary transition-all duration-1000",
            isActive && !isPaused && "animate-pulse-slow"
          )}
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;

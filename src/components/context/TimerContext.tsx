
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { timerService } from '@/services/timerService';

interface TimerContextType {
  isActive: boolean;
  isPaused: boolean;
  sessionDuration: number;
  secondsLeft: number;
  progress: number;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  updateSessionDuration: (duration: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(sessionDuration * 60);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const calculateProgress = (): number => {
    const totalSeconds = sessionDuration * 60;
    return ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  };

  // Save timer state to localStorage
  useEffect(() => {
    const saveState = () => {
      if (isActive) {
        localStorage.setItem('timerState', JSON.stringify({
          isActive,
          isPaused,
          sessionDuration,
          secondsLeft,
          startTime: startTime?.toISOString(),
          accumulatedTime,
          lastUpdateTime: new Date().toISOString(),
        }));
      } else {
        localStorage.removeItem('timerState');
      }
    };

    saveState();
    
    // Save state when tab/window is about to close
    const handleBeforeUnload = () => {
      saveState();
      if (isActive && !isPaused) {
        recordPartialSession();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive, isPaused, sessionDuration, secondsLeft, startTime, accumulatedTime]);

  // Restore timer state from localStorage on mount
  useEffect(() => {
    const storedState = localStorage.getItem('timerState');
    if (storedState) {
      try {
        const { 
          isActive: storedIsActive, 
          isPaused: storedIsPaused, 
          sessionDuration: storedDuration, 
          secondsLeft: storedSecondsLeft,
          startTime: storedStartTime,
          accumulatedTime: storedAccumulatedTime,
          lastUpdateTime: storedLastUpdateTime
        } = JSON.parse(storedState);
        
        setIsActive(storedIsActive);
        setIsPaused(storedIsPaused);
        setSessionDuration(storedDuration);
        setSecondsLeft(storedSecondsLeft);
        setStartTime(storedStartTime ? new Date(storedStartTime) : null);
        setAccumulatedTime(storedAccumulatedTime);
        setLastUpdateTime(storedLastUpdateTime ? new Date(storedLastUpdateTime) : null);
        
        // Check if time has passed since last update (e.g., if browser was closed)
        if (storedIsActive && !storedIsPaused && storedLastUpdateTime) {
          const now = new Date();
          const lastUpdate = new Date(storedLastUpdateTime);
          const secondsElapsed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
          
          if (secondsElapsed > 0) {
            // Adjust the timer for time that passed while away
            const newSecondsLeft = Math.max(0, storedSecondsLeft - secondsElapsed);
            setSecondsLeft(newSecondsLeft);
            
            // If timer would have completed, handle completion
            if (newSecondsLeft === 0) {
              completeSession();
            }
          }
        }
      } catch (error) {
        console.error("Error restoring timer state:", error);
        localStorage.removeItem('timerState');
      }
    }
  }, []);

  // Timer tick effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => {
          if (seconds <= 1) {
            clearInterval(interval!);
            completeSession();
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
  }, [isActive, isPaused]);

  // Record partial session to Supabase
  const recordPartialSession = async () => {
    if (!user || !isActive) return;
    
    // Calculate minutes completed in this partial session
    const now = new Date();
    const elapsedSeconds = isPaused ? 0 : Math.floor((now.getTime() - (lastUpdateTime?.getTime() || now.getTime())) / 1000);
    const totalElapsedSeconds = accumulatedTime + elapsedSeconds;
    
    // Only record if at least 1 minute has passed
    if (totalElapsedSeconds < 60) return;
    
    const minutesCompleted = Math.floor(totalElapsedSeconds / 60);
    
    const success = await timerService.recordPartialSession(
      user.id,
      minutesCompleted,
      false,
      'default',
      'Partial session'
    );
    
    if (success) {
      // Update accumulated time
      setAccumulatedTime(totalElapsedSeconds % 60);
      setLastUpdateTime(now);
    }
  };

  // Handle complete session
  const completeSession = async () => {
    if (!user) return;
    
    setIsActive(false);
    setIsPaused(false);
    
    // Calculate total duration including accumulated time
    const totalMinutes = sessionDuration;
    
    const success = await timerService.recordPartialSession(
      user.id,
      totalMinutes,
      true,
      'default',
      'Completed session'
    );
    
    if (success) {
      // Clear accumulated time
      setAccumulatedTime(0);
      setLastUpdateTime(null);
      
      // Update daily progress
      const updatedProgress = await timerService.updateDailyProgress(user.id, totalMinutes);
      
      toast("Session complete!", {
        description: `You've added ${totalMinutes} minutes to your progress.`,
      });
      
      // Reset timer state in localStorage
      localStorage.removeItem('timerState');
    } else {
      toast.error("Error completing session", {
        description: "There was a problem saving your session. Please try again.",
      });
    }
  };

  // Timer controls
  const startTimer = (duration: number) => {
    setSessionDuration(duration);
    setSecondsLeft(duration * 60);
    setIsActive(true);
    setIsPaused(false);
    setStartTime(new Date());
    setLastUpdateTime(new Date());
    setAccumulatedTime(0);
    
    toast("Session started", {
      description: `Your ${duration} minute session has begun!`,
    });
  };

  const pauseTimer = async () => {
    setIsPaused(true);
    
    // Record partial session when pausing
    await recordPartialSession();
    
    toast("Session paused", {
      description: "You can resume your session at any time.",
    });
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setLastUpdateTime(new Date());
    
    toast("Session resumed", {
      description: "Keep going! You're doing great.",
    });
  };

  const resetTimer = async () => {
    // Record partial session before resetting
    if (isActive) {
      await recordPartialSession();
    }
    
    setIsActive(false);
    setIsPaused(false);
    setSecondsLeft(sessionDuration * 60);
    setStartTime(null);
    setAccumulatedTime(0);
    setLastUpdateTime(null);
    
    // Clear timer state in localStorage
    localStorage.removeItem('timerState');
    
    toast("Session reset", {
      description: "Your session has been reset.",
    });
  };

  const updateSessionDuration = (duration: number) => {
    if (!isActive) {
      setSessionDuration(duration);
      setSecondsLeft(duration * 60);
    }
  };

  const value = {
    isActive,
    isPaused,
    sessionDuration,
    secondsLeft,
    progress: calculateProgress(),
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    updateSessionDuration,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};


import React from 'react';
import { useTimer } from '@/components/context/TimerContext';
import { Play, Pause, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MiniTimer: React.FC = () => {
  const { isActive, isPaused, secondsLeft, pauseTimer, resumeTimer } = useTimer();
  
  if (!isActive) return null;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center space-x-2 bg-secondary/50 p-2 rounded-md ml-4">
      <Clock className="h-4 w-4 text-primary" />
      <span className="font-medium">{formatTime(secondsLeft)}</span>
      
      {isPaused ? (
        <Button 
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={resumeTimer}
        >
          <Play className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button 
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={pauseTimer}
        >
          <Pause className="h-3.5 w-3.5" />
        </Button>
      )}
      
      <Link to="/sessions" className="text-xs text-primary hover:underline">View</Link>
    </div>
  );
};

export default MiniTimer;

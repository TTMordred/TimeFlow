
import React, { useState, useEffect } from 'react';
import Timer from '@/components/Timer';
import EnergyTree from '@/components/EnergyTree';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';

const Sessions: React.FC = () => {
  const [sessionDuration, setSessionDuration] = useState(25);
  const [progress, setProgress] = useState(0);
  
  const handleDurationChange = (amount: number) => {
    const newDuration = Math.max(5, Math.min(120, sessionDuration + amount));
    setSessionDuration(newDuration);
  };
  
  const handleTimerProgress = (timerProgress: number) => {
    setProgress(timerProgress);
  };
  
  const handleSessionComplete = () => {
    // Get current data from localStorage
    const storageData = localStorage.getItem('timeflowData');
    let data = storageData ? JSON.parse(storageData) : {
      currentStreak: 0,
      maxStreak: 0,
      dailyGoalMinutes: 60,
      todayMinutes: 0,
      totalMinutes: 0,
      completedSessions: 0,
      lastActiveDate: null,
    };
    
    // Update session data
    const today = new Date().toISOString();
    data.todayMinutes += sessionDuration;
    data.totalMinutes += sessionDuration;
    data.completedSessions += 1;
    data.lastActiveDate = today;
    
    // Check if daily goal is met for the first time today
    const wasGoalMet = data.todayMinutes - sessionDuration >= data.dailyGoalMinutes;
    const isGoalMet = data.todayMinutes >= data.dailyGoalMinutes;
    
    if (isGoalMet && !wasGoalMet) {
      // Daily goal just achieved
      data.currentStreak += 1;
      data.maxStreak = Math.max(data.currentStreak, data.maxStreak);
      
      toast("Daily goal achieved!", {
        description: `You've maintained a streak of ${data.currentStreak} days. Keep it up!`,
      });
    }
    
    // Save updated data
    localStorage.setItem('timeflowData', JSON.stringify(data));
    
    toast("Session complete!", {
      description: `You've added ${sessionDuration} minutes to your progress.`,
    });
  };
  
  return (
    <div className="container mx-auto max-w-4xl animate-fade-in">
      <h1 className="text-3xl font-semibold mb-8 text-center">Focus Session</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <div className="glass rounded-xl p-6 w-full mb-6">
            <h2 className="text-xl font-medium mb-4">Session Duration</h2>
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDurationChange(-5)}
                disabled={sessionDuration <= 5}
              >
                <MinusCircle className="h-5 w-5" />
              </Button>
              
              <span className="mx-6 text-3xl font-light">{sessionDuration} min</span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDurationChange(5)}
                disabled={sessionDuration >= 120}
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Timer 
            duration={sessionDuration} 
            onComplete={handleSessionComplete} 
            onProgress={handleTimerProgress}
          />
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <div className="glass rounded-xl p-8 flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-medium mb-6">Your Energy Tree</h2>
            <EnergyTree progress={progress} size="lg" />
            <p className="text-sm text-muted-foreground mt-6 text-center">
              Complete your session to grow your energy tree and track your daily progress.
            </p>
          </div>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6 mt-8">
        <h2 className="text-xl font-medium mb-4">Session Tips</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2" />
            <span>Find a quiet space free from distractions</span>
          </li>
          <li className="flex items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2" />
            <span>Take short breaks between multiple sessions</span>
          </li>
          <li className="flex items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2" />
            <span>Stay hydrated and maintain proper posture</span>
          </li>
          <li className="flex items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2" />
            <span>Consider the Pomodoro technique: 25 minutes of focus followed by a 5 minute break</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sessions;

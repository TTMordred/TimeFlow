
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/context/AuthContext';
import Timer from '@/components/Timer';
import EnergyTree from '@/components/EnergyTree';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sessionDuration, setSessionDuration] = useState(25);
  const [progress, setProgress] = useState(0);
  
  const handleDurationChange = (amount: number) => {
    const newDuration = Math.max(5, Math.min(120, sessionDuration + amount));
    setSessionDuration(newDuration);
  };
  
  const handleTimerProgress = (timerProgress: number) => {
    setProgress(timerProgress);
  };
  
  // Mutation for completing a session
  const sessionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Create the session
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          duration: sessionDuration,
          completed: true,
          category: 'default'
        });
      
      if (sessionError) throw sessionError;
      
      // 2. Update daily progress
      // First get current daily progress
      const { data: dailyData, error: dailyFetchError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      
      if (dailyFetchError) throw dailyFetchError;
      
      // If no daily progress yet, create it
      if (!dailyData) {
        const { error } = await supabase
          .from('daily_progress')
          .insert({
            user_id: user.id,
            date: today,
            minutes_completed: sessionDuration,
            goal_minutes: 60,
            goal_completed: sessionDuration >= 60
          });
          
        if (error) throw error;
      } else {
        // Update existing daily progress
        const newMinutesCompleted = dailyData.minutes_completed + sessionDuration;
        const goalCompleted = newMinutesCompleted >= dailyData.goal_minutes;
        
        const { error } = await supabase
          .from('daily_progress')
          .update({
            minutes_completed: newMinutesCompleted,
            goal_completed: goalCompleted
          })
          .eq('id', dailyData.id);
          
        if (error) throw error;
        
        // 3. Check if daily goal was just met for the first time today
        if (goalCompleted && !dailyData.goal_completed) {
          // Get streak data
          const { data: streakData, error: streakError } = await supabase
            .from('streaks')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (streakError) throw streakError;
          
          if (streakData) {
            // Update streak
            const newStreak = streakData.current_streak + 1;
            const newMaxStreak = Math.max(streakData.max_streak, newStreak);
            
            const { error } = await supabase
              .from('streaks')
              .update({
                current_streak: newStreak,
                max_streak: newMaxStreak,
                last_active_date: today
              })
              .eq('id', streakData.id);
              
            if (error) throw error;
            
            // Show streak notification
            toast("Daily goal achieved!", {
              description: `You've maintained a streak of ${newStreak} days. Keep it up!`,
            });
          }
        }
      }
      
      // 4. Update achievements
      // This would check for completed achievements and update them
      // Will be implemented in a separate function
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['user-data'] });
      
      toast("Session complete!", {
        description: `You've added ${sessionDuration} minutes to your progress.`,
      });
    },
    onError: (error) => {
      console.error("Session completion error:", error);
      toast("Error completing session", {
        description: "There was a problem saving your session. Please try again.",
      });
    }
  });
  
  const handleSessionComplete = () => {
    sessionMutation.mutate();
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

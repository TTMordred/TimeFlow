
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useTimer } from '@/components/context/TimerContext';
import Timer from '@/components/Timer';
import EnergyTree from '@/components/EnergyTree';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    sessionDuration, 
    progress, 
    updateSessionDuration 
  } = useTimer();
  
  const handleDurationChange = (amount: number) => {
    const newDuration = Math.max(5, Math.min(120, sessionDuration + amount));
    updateSessionDuration(newDuration);
  };
  
  const handleTimerProgress = (timerProgress: number) => {
    // This is handled by the Timer component already
  };

  // Fetch recent sessions
  const { data: recentSessions, isLoading } = useQuery({
    queryKey: ['recentSessions'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });
  
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
          
          <Timer onProgress={handleTimerProgress} />
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <div className="glass rounded-xl p-8 flex flex-col items-center justify-center w-full">
            <h2 className="text-xl font-medium mb-6">Your Energy Tree</h2>
            <EnergyTree progress={progress} size="lg" />
            <p className="text-sm text-muted-foreground mt-6 text-center">
              Complete your session to grow your energy tree and track your daily progress.
            </p>
          </div>
          
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Your latest focus sessions</CardDescription>
              <Separator />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentSessions && recentSessions.length > 0 ? (
                <ul className="space-y-2">
                  {recentSessions.map((session) => (
                    <li key={session.id} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${session.completed ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        <span>{session.duration} minutes</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(session.created_at), 'MMM d, h:mm a')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No sessions recorded yet
                </div>
              )}
            </CardContent>
          </Card>
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

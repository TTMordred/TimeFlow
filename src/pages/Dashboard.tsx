
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import EnergyTree from '@/components/EnergyTree';
import StreakCounter from '@/components/StreakCounter';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchUserData } from '@/utils/dataUtils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dailyProgress, setDailyProgress] = useState(0);
  
  // Fetch user data with React Query for automatic caching and refetching
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return fetchUserData(user.id);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Update daily progress percentage
  useEffect(() => {
    if (userData?.dailyData) {
      const progress = Math.min(100, (userData.dailyData.minutes_completed / userData.dailyData.goal_minutes) * 100);
      setDailyProgress(progress);
    }
  }, [userData]);
  
  // Show error toast if data fetching fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data", {
        description: "Please refresh the page or try again later.",
      });
      console.error("Dashboard data fetch error:", error);
    }
  }, [error]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const completedForToday = dailyProgress >= 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      <div className="glass rounded-xl p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold mb-2">Welcome to TimeFlow</h1>
        <p className="text-muted-foreground text-center mb-6">
          Track your time, grow your green energy tree, and build productive habits
        </p>
        
        <div className="flex flex-col items-center mb-6">
          <EnergyTree progress={dailyProgress} size="lg" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedForToday 
              ? "Today's goal completed! Great job!" 
              : `${Math.round(dailyProgress)}% of daily goal completed`}
          </p>
        </div>
        
        <Link to="/sessions">
          <Button className="bg-primary hover:bg-primary/90">
            <Clock className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col gap-8">
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-medium mb-4">Today's Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Time Today</p>
              <p className="text-2xl font-medium">
                {Math.floor(userData?.dailyData?.minutes_completed / 60 || 0)}h {userData?.dailyData?.minutes_completed % 60 || 0}m
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Daily Goal</p>
              <p className="text-2xl font-medium">
                {Math.floor(userData?.dailyData?.goal_minutes / 60 || 0)}h {userData?.dailyData?.goal_minutes % 60 || 0}m
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{completedForToday ? "Completed!" : "In progress..."}</span>
              <span>{userData?.dailyData?.minutes_completed || 0}/{userData?.dailyData?.goal_minutes || 60} min</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        <StreakCounter 
          currentStreak={userData?.streakData?.current_streak || 0} 
          maxStreak={userData?.streakData?.max_streak || 0} 
        />
        
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-medium mb-4">Quick Stats</h2>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Total Time</span>
            <span>{Math.floor(userData?.totalMinutes / 60 || 0)}h {userData?.totalMinutes % 60 || 0}m</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Sessions Completed</span>
            <span>{userData?.completedSessions || 0}</span>
          </div>
          
          <div className="mt-4">
            <Link to="/statistics" className="flex items-center text-primary hover:underline">
              View detailed statistics
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

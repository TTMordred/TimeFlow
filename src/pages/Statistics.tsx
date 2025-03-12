
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Stats from '@/components/Stats';
import Calendar from '@/components/Calendar';
import AchievementCard, { Achievement } from '@/components/AchievementCard';
import LeaderboardPreview from '@/components/LeaderboardPreview';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  
  // Use React Query to fetch session data from Supabase
  const { data: sessionData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch daily progress data
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['daily-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30); // Last 30 days
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch streak data
  const { data: streakData, isLoading: streakLoading } = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data;
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Generate calendar data from actual progress
  const generateCalendarData = () => {
    if (!progressData) return [];
    
    const days = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      
      // Skip future dates
      if (date > today) continue;
      
      // Format date string to match Supabase date format (YYYY-MM-DD)
      const dateStr = format(date, 'yyyy-MM-dd');
      // Find matching progress data
      const dayProgress = progressData.find(p => p.date === dateStr);
      
      if (dayProgress) {
        const progress = Math.min(100, (dayProgress.minutes_completed / dayProgress.goal_minutes) * 100);
        days.push({
          date,
          completed: dayProgress.goal_completed,
          progress
        });
      } else {
        // No progress recorded for this day
        days.push({
          date,
          completed: false,
          progress: 0
        });
      }
    }
    
    return days;
  };
  
  // Generate weekly data for chart from actual data
  const generateWeeklyData = () => {
    const data = [];
    const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayProgress = progressData?.find(p => p.date === dateStr);
      
      data.push({
        day: format(date, 'EEE'),
        minutes: dayProgress ? dayProgress.minutes_completed : 0
      });
    }
    
    return data;
  };
  
  // Calculate statistics from real data
  const calculateStats = () => {
    if (!sessionData) return {
      totalMinutes: 0,
      completedSessions: 0,
      currentStreak: 0,
      weeklyData: []
    };
    
    const totalMinutes = sessionData.reduce((total, session) => total + session.duration, 0);
    const completedSessions = sessionData.filter(session => session.completed).length;
    const currentStreak = streakData?.current_streak || 0;
    const weeklyData = generateWeeklyData();
    
    return {
      totalMinutes,
      completedSessions,
      currentStreak,
      weeklyData
    };
  };
  
  // Generate achievements based on actual data
  const generateAchievements = (): Achievement[] => {
    const stats = calculateStats();
    
    return [
      {
        id: '1',
        title: 'Early Bird',
        description: 'Complete 5 sessions before 9 AM',
        icon: 'star',
        unlocked: true, // Would need time-of-day data to determine this accurately
        progress: 100
      },
      {
        id: '2',
        title: 'Consistency Master',
        description: 'Maintain a 7-day streak',
        icon: 'award',
        unlocked: stats.currentStreak >= 7,
        progress: Math.min(100, (stats.currentStreak / 7) * 100)
      },
      {
        id: '3',
        title: 'Focus Champion',
        description: 'Complete 20 focused sessions',
        icon: 'trophy',
        unlocked: stats.completedSessions >= 20,
        progress: Math.min(100, (stats.completedSessions / 20) * 100)
      },
      {
        id: '4',
        title: '10-Hour Milestone',
        description: 'Accumulate 10 hours of focused time',
        icon: 'clock',
        unlocked: stats.totalMinutes >= 600,
        progress: Math.min(100, (stats.totalMinutes / 600) * 100)
      }
    ];
  };
  
  // Generate mock leaderboard data (could be replaced with real leaderboard later)
  const generateLeaderboardData = () => {
    const stats = calculateStats();
    
    return {
      topUsers: [
        {
          id: '1',
          name: 'Alex Chen',
          avatar: '',
          points: 1250,
          streak: 15,
          rank: 1
        },
        {
          id: '2',
          name: 'Maria Rodriguez',
          avatar: '',
          points: 980,
          streak: 8,
          rank: 2
        },
        {
          id: '3',
          name: 'Jamal Wilson',
          avatar: '',
          points: 820,
          streak: 6,
          rank: 3
        }
      ],
      currentUserRank: {
        id: 'current',
        name: 'You',
        avatar: '',
        points: Math.floor(stats.totalMinutes + (stats.currentStreak * 10)),
        streak: stats.currentStreak,
        rank: 12
      }
    };
  };
  
  const isLoading = sessionsLoading || progressLoading || streakLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading statistics...</div>
      </div>
    );
  }
  
  const stats = calculateStats();
  const calendarDays = generateCalendarData();
  const achievements = generateAchievements();
  const leaderboardData = generateLeaderboardData();
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-semibold mb-8">Your Statistics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Stats 
          totalMinutes={stats.totalMinutes} 
          completedSessions={stats.completedSessions}
          currentStreak={stats.currentStreak}
          weeklyData={stats.weeklyData}
        />
        
        <Calendar days={calendarDays} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
          
          <div className="glass rounded-xl p-6 mt-8">
            <h2 className="text-xl font-medium mb-4">Time Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Daily Average</span>
                  <span className="text-sm font-medium">
                    {Math.round(stats.totalMinutes / Math.max(1, stats.completedSessions / 2))} min
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-timeflow-green-400 h-1.5 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Weekly Goal</span>
                  <span className="text-sm font-medium">
                    {(progressData?.[0]?.goal_minutes || 60) * 7} min
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-timeflow-green-400 h-1.5 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Monthly Progress</span>
                  <span className="text-sm font-medium">
                    {Math.round(stats.totalMinutes / 60)} hours
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-timeflow-green-400 h-1.5 rounded-full" style={{ width: "28%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Community</h2>
          <LeaderboardPreview 
            topUsers={leaderboardData.topUsers}
            currentUserRank={leaderboardData.currentUserRank}
          />
        </div>
      </div>
    </div>
  );
};

export default Statistics;

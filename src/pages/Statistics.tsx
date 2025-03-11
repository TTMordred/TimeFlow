import React, { useState, useEffect } from 'react';
import Stats from '@/components/Stats';
import Calendar from '@/components/Calendar';
import AchievementCard, { Achievement } from '@/components/AchievementCard';
import LeaderboardPreview from '@/components/LeaderboardPreview';
import { format, startOfWeek, addDays } from 'date-fns';

// Mock calendar data - in a real app, this would come from a database
const generateCalendarData = (data: any) => {
  const days = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    
    // Skip future dates
    if (date > today) continue;
    
    // Random progress for past dates (for demo purposes)
    // In a real app, this would come from actual user data
    const isToday = date.toDateString() === today.toDateString();
    
    // For today, use the actual progress
    if (isToday) {
      const progress = Math.min(100, (data.todayMinutes / data.dailyGoalMinutes) * 100);
      days.push({
        date,
        completed: progress >= 100,
        progress
      });
    } else {
      // For past dates, generate some random data for demonstration
      const daysPast = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      // More likely to have completed recent days (for streak calculation)
      const completed = daysPast <= data.currentStreak;
      const progress = completed ? 100 : Math.floor(Math.random() * 100);
      
      days.push({
        date,
        completed,
        progress
      });
    }
  }
  
  return days;
};

// Generate weekly data for the chart
const generateWeeklyData = () => {
  const data = [];
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    const isToday = date.toDateString() === new Date().toDateString();
    const isFutureDay = date > new Date();
    
    // For demo purposes, generate random minutes for past days
    // In a real app, this would come from actual user data
    let minutes = 0;
    
    if (!isFutureDay) {
      // Get data from localStorage for today
      if (isToday) {
        const storageData = localStorage.getItem('timeflowData');
        const data = storageData ? JSON.parse(storageData) : { todayMinutes: 0 };
        minutes = data.todayMinutes;
      } else {
        // Random data for past days
        minutes = Math.floor(Math.random() * 80) + 20; // 20-100 minutes
      }
    }
    
    data.push({
      day: format(date, 'EEE'),
      minutes: minutes
    });
  }
  
  return data;
};

// Mock achievements data
const generateAchievements = (data: any): Achievement[] => {
  return [
    {
      id: '1',
      title: 'Early Bird',
      description: 'Complete 5 sessions before 9 AM',
      icon: 'star',
      unlocked: true,
      progress: 100
    },
    {
      id: '2',
      title: 'Consistency Master',
      description: 'Maintain a 7-day streak',
      icon: 'award',
      unlocked: data.currentStreak >= 7,
      progress: Math.min(100, (data.currentStreak / 7) * 100)
    },
    {
      id: '3',
      title: 'Focus Champion',
      description: 'Complete 20 focused sessions',
      icon: 'trophy',
      unlocked: data.completedSessions >= 20,
      progress: Math.min(100, (data.completedSessions / 20) * 100)
    },
    {
      id: '4',
      title: '10-Hour Milestone',
      description: 'Accumulate 10 hours of focused time',
      icon: 'clock',
      unlocked: data.totalMinutes >= 600,
      progress: Math.min(100, (data.totalMinutes / 600) * 100)
    }
  ];
};

// Mock leaderboard data
const generateLeaderboardData = (data: any) => {
  // In a real app, this would be fetched from an API
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
      points: Math.floor(data.totalMinutes + (data.currentStreak * 10)),
      streak: data.currentStreak,
      rank: 12
    }
  };
};

const Statistics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<{
    topUsers: any[],
    currentUserRank: any
  }>({ topUsers: [], currentUserRank: null });
  
  useEffect(() => {
    // Get data from localStorage
    const storageData = localStorage.getItem('timeflowData');
    const parsedData = storageData ? JSON.parse(storageData) : {
      currentStreak: 0,
      maxStreak: 0,
      dailyGoalMinutes: 60,
      todayMinutes: 0,
      totalMinutes: 0,
      completedSessions: 0,
      lastActiveDate: null,
    };
    
    setData(parsedData);
    setCalendarDays(generateCalendarData(parsedData));
    setWeeklyData(generateWeeklyData());
    setAchievements(generateAchievements(parsedData));
    setLeaderboardData(generateLeaderboardData(parsedData));
  }, []);
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading statistics...</div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-semibold mb-8">Your Statistics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Stats 
          totalMinutes={data.totalMinutes} 
          completedSessions={data.completedSessions}
          currentStreak={data.currentStreak}
          weeklyData={weeklyData}
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
                    {Math.round(data.totalMinutes / Math.max(1, data.completedSessions / 2))} min
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
                    {data.dailyGoalMinutes * 7} min
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
                    {Math.round(data.totalMinutes / 60)} hours
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

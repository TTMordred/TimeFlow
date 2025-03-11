
import React, { useState, useEffect } from 'react';
import EnergyTree from '@/components/EnergyTree';
import StreakCounter from '@/components/StreakCounter';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Mock data - in a real app, this would come from a database or localStorage
const getDataFromStorage = () => {
  try {
    const data = localStorage.getItem('timeflowData');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error retrieving data from localStorage', error);
  }
  
  return {
    currentStreak: 0,
    maxStreak: 0,
    dailyGoalMinutes: 60,
    todayMinutes: 0,
    totalMinutes: 0,
    completedSessions: 0,
    lastActiveDate: null,
  };
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState(getDataFromStorage());
  const [dailyProgress, setDailyProgress] = useState(0);
  
  // Calculate daily progress percentage
  useEffect(() => {
    const progress = Math.min(100, (data.todayMinutes / data.dailyGoalMinutes) * 100);
    setDailyProgress(progress);
  }, [data.todayMinutes, data.dailyGoalMinutes]);
  
  // When component mounts, check if we need to reset daily minutes and update streak
  useEffect(() => {
    const today = new Date().toDateString();
    const lastActive = data.lastActiveDate ? new Date(data.lastActiveDate).toDateString() : null;
    
    if (lastActive && lastActive !== today) {
      // Check if we missed a day (streak broken)
      const lastActiveDate = new Date(data.lastActiveDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActiveDate.toDateString() !== yesterday.toDateString()) {
        // Streak is broken
        setData(prev => ({
          ...prev,
          currentStreak: 0,
          todayMinutes: 0,
          lastActiveDate: today,
        }));
        
        toast("Streak broken", {
          description: "You missed a day. Your streak has been reset.",
        });
      } else {
        // New day, but streak continues
        setData(prev => ({
          ...prev,
          todayMinutes: 0,
          lastActiveDate: today,
        }));
      }
    }
  }, [data.lastActiveDate]);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timeflowData', JSON.stringify(data));
  }, [data]);
  
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
                {Math.floor(data.todayMinutes / 60)}h {data.todayMinutes % 60}m
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Daily Goal</p>
              <p className="text-2xl font-medium">
                {Math.floor(data.dailyGoalMinutes / 60)}h {data.dailyGoalMinutes % 60}m
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{completedForToday ? "Completed!" : "In progress..."}</span>
              <span>{data.todayMinutes}/{data.dailyGoalMinutes} min</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        <StreakCounter 
          currentStreak={data.currentStreak} 
          maxStreak={data.maxStreak} 
        />
        
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-medium mb-4">Quick Stats</h2>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Total Time</span>
            <span>{Math.floor(data.totalMinutes / 60)}h {data.totalMinutes % 60}m</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Sessions Completed</span>
            <span>{data.completedSessions}</span>
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

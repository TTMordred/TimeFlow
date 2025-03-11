
import React from 'react';
import { Clock, Calendar, Flame, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsProps {
  totalMinutes: number;
  completedSessions: number;
  currentStreak: number;
  weeklyData: {
    day: string;
    minutes: number;
  }[];
}

const Stats: React.FC<StatsProps> = ({ 
  totalMinutes, 
  completedSessions, 
  currentStreak, 
  weeklyData 
}) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-medium">Your Statistics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center p-4 rounded-lg bg-secondary/50">
          <Clock className="h-8 w-8 text-primary mr-4" />
          <div>
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-medium">
              {hours}h {minutes}m
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 rounded-lg bg-secondary/50">
          <Calendar className="h-8 w-8 text-primary mr-4" />
          <div>
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="text-2xl font-medium">
              {completedSessions}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 rounded-lg bg-secondary/50">
          <Flame className="h-8 w-8 text-orange-500 mr-4" />
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-medium">
              {currentStreak} days
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          This Week's Activity
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Bar 
              dataKey="minutes" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Stats;

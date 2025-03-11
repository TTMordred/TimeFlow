
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Bell, Trash2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const [dailyGoal, setDailyGoal] = useState(60);
  const [enableNotifications, setEnableNotifications] = useState(true);
  
  useEffect(() => {
    const storageData = localStorage.getItem('timeflowData');
    if (storageData) {
      const data = JSON.parse(storageData);
      setDailyGoal(data.dailyGoalMinutes || 60);
    }
  }, []);
  
  const handleSaveSettings = () => {
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
    
    // Update settings
    data.dailyGoalMinutes = dailyGoal;
    
    // Save updated data
    localStorage.setItem('timeflowData', JSON.stringify(data));
    
    toast("Settings saved", {
      description: "Your settings have been updated successfully.",
    });
  };
  
  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all your data? This cannot be undone.")) {
      localStorage.removeItem('timeflowData');
      
      toast("Data reset", {
        description: "All your data has been reset.",
      });
      
      // Refresh page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };
  
  return (
    <div className="container mx-auto max-w-2xl animate-fade-in">
      <h1 className="text-3xl font-semibold mb-8">Settings</h1>
      
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-medium">Time Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dailyGoal">Daily Goal (minutes)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="dailyGoal"
                type="number"
                min="5"
                max="1440"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="max-w-xs"
              />
              <span className="text-sm text-muted-foreground">
                {Math.floor(dailyGoal / 60)}h {dailyGoal % 60}m
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Set your daily time goal. This affects your streak calculation.
            </p>
          </div>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-medium">Notification Settings</h2>
        </div>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="notifications"
            checked={enableNotifications}
            onChange={(e) => setEnableNotifications(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="notifications" className="ml-2">
            Enable browser notifications
          </Label>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Receive notifications when your session is complete or when you're about to lose your streak.
        </p>
      </div>
      
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center mb-4">
          <Trash2 className="h-5 w-5 mr-2 text-destructive" />
          <h2 className="text-xl font-medium">Data Management</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Reset all your data including streaks, statistics, and session history.
        </p>
        
        <Button 
          variant="destructive"
          onClick={handleResetData}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset All Data
        </Button>
      </div>
      
      <div className="flex justify-end">
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={handleSaveSettings}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;

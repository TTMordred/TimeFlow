
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Bell, Trash2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dailyGoal, setDailyGoal] = useState(60);
  const [enableNotifications, setEnableNotifications] = useState(true);
  
  // Get user settings
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get daily goal from daily_progress
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyData } = await supabase
        .from('daily_progress')
        .select('goal_minutes')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
        
      return {
        dailyGoalMinutes: dailyData?.goal_minutes || 60
      };
    },
    enabled: !!user,
  });
  
  useEffect(() => {
    if (userSettings) {
      setDailyGoal(userSettings.dailyGoalMinutes);
    }
  }, [userSettings]);
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get current daily progress
      const { data: dailyData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
        
      if (dailyData) {
        // Update goal minutes
        const { error } = await supabase
          .from('daily_progress')
          .update({ goal_minutes: dailyGoal })
          .eq('id', dailyData.id);
          
        if (error) throw error;
      } else {
        // Create new daily progress entry
        const { error } = await supabase
          .from('daily_progress')
          .insert({
            user_id: user.id,
            date: today,
            minutes_completed: 0,
            goal_minutes: dailyGoal,
            goal_completed: false
          });
          
        if (error) throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      queryClient.invalidateQueries({ queryKey: ['user-data'] });
      
      toast("Settings saved", {
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Settings save error:", error);
      toast("Error saving settings", {
        description: "There was a problem saving your settings. Please try again.",
      });
    }
  });
  
  // Reset data mutation
  const resetDataMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Delete sessions
      const { error: sessionsError } = await supabase
        .from('sessions')
        .delete()
        .eq('user_id', user.id);
        
      if (sessionsError) throw sessionsError;
      
      // Delete daily_progress
      const { error: progressError } = await supabase
        .from('daily_progress')
        .delete()
        .eq('user_id', user.id);
        
      if (progressError) throw progressError;
      
      // Reset streaks
      const { error: streakError } = await supabase
        .from('streaks')
        .update({
          current_streak: 0,
          max_streak: 0,
          last_active_date: null
        })
        .eq('user_id', user.id);
        
      if (streakError) throw streakError;
      
      // Reset user achievements
      const { error: achievementsError } = await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', user.id);
        
      if (achievementsError) throw achievementsError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      
      toast("Data reset", {
        description: "All your data has been reset.",
      });
      
      // Refresh page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      console.error("Data reset error:", error);
      toast("Error resetting data", {
        description: "There was a problem resetting your data. Please try again.",
      });
    }
  });
  
  const handleSaveSettings = () => {
    saveSettingsMutation.mutate();
  };
  
  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all your data? This cannot be undone.")) {
      resetDataMutation.mutate();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
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


import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles database errors in a consistent way
 */
export const handleDatabaseError = (error: any, customMessage?: string) => {
  console.error("Database operation error:", error);
  
  toast.error(customMessage || "An error occurred", {
    description: error?.message || "Please try again later.",
    duration: 5000,
  });
  
  return null;
};

/**
 * Fetches user data with error handling
 */
export const fetchUserData = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get daily progress for today
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
      
    if (dailyError) throw dailyError;
    
    // Get streak data
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (streakError) throw streakError;
    
    // Get total stats
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('duration')
      .eq('user_id', userId)
      .eq('completed', true);
    
    if (sessionsError) throw sessionsError;
    
    // Calculate total minutes from all sessions
    const totalMinutes = sessionsData?.reduce((total, session) => total + session.duration, 0) || 0;
    const completedSessions = sessionsData?.length || 0;
    
    return {
      dailyData: dailyData || { 
        minutes_completed: 0, 
        goal_minutes: 60, 
        goal_completed: false 
      },
      streakData: streakData || { 
        current_streak: 0, 
        max_streak: 0 
      },
      totalMinutes,
      completedSessions
    };
  } catch (error) {
    return handleDatabaseError(error, "Failed to fetch user data");
  }
};

/**
 * Updates daily progress with proper error handling
 */
export const updateDailyProgress = async (
  userId: string, 
  minutes: number, 
  goalMinutes?: number
) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current daily progress
    const { data: dailyData, error: dailyFetchError } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (dailyFetchError) throw dailyFetchError;
    
    // If no daily progress yet, create it
    if (!dailyData) {
      const newGoalMinutes = goalMinutes || 60;
      const goalCompleted = minutes >= newGoalMinutes;
      
      const { error } = await supabase
        .from('daily_progress')
        .insert({
          user_id: userId,
          date: today,
          minutes_completed: minutes,
          goal_minutes: newGoalMinutes,
          goal_completed: goalCompleted
        });
        
      if (error) throw error;
      
      return { minutes_completed: minutes, goal_minutes: newGoalMinutes, goal_completed: goalCompleted };
    } else {
      // Update existing daily progress
      const newMinutesCompleted = dailyData.minutes_completed + minutes;
      const newGoalMinutes = goalMinutes || dailyData.goal_minutes;
      const goalCompleted = newMinutesCompleted >= newGoalMinutes;
      
      const { error } = await supabase
        .from('daily_progress')
        .update({
          minutes_completed: newMinutesCompleted,
          goal_minutes: newGoalMinutes,
          goal_completed: goalCompleted
        })
        .eq('id', dailyData.id);
        
      if (error) throw error;
      
      return { 
        minutes_completed: newMinutesCompleted, 
        goal_minutes: newGoalMinutes, 
        goal_completed: goalCompleted,
        previousGoalCompleted: dailyData.goal_completed
      };
    }
  } catch (error) {
    return handleDatabaseError(error, "Failed to update daily progress");
  }
};

/**
 * Updates streak with proper error handling
 */
export const updateStreak = async (userId: string, completedGoal: boolean, previouslyCompleted: boolean) => {
  try {
    // Only update streak if goal was just completed for the first time today
    if (!completedGoal || previouslyCompleted) return null;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get streak data
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
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
      
      return { currentStreak: newStreak, maxStreak: newMaxStreak };
    }
    
    return null;
  } catch (error) {
    return handleDatabaseError(error, "Failed to update streak");
  }
};

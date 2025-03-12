
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const timerService = {
  recordPartialSession: async (
    userId: string, 
    minutesCompleted: number, 
    isCompleted: boolean = false,
    category: string = 'default',
    notes: string = 'Partial session'
  ) => {
    try {
      // Insert session record
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          duration: minutesCompleted,
          completed: isCompleted,
          category,
          notes
        });
      
      if (sessionError) throw sessionError;
      
      console.log(`Recorded ${isCompleted ? 'complete' : 'partial'} session: ${minutesCompleted} minutes`);
      return true;
    } catch (error) {
      console.error(`Error recording ${isCompleted ? 'complete' : 'partial'} session:`, error);
      return false;
    }
  },
  
  updateDailyProgress: async (userId: string, minutesCompleted: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if entry exists for today
      const { data: existingProgress, error: checkError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // Error other than "no rows returned"
        throw checkError;
      }
      
      if (existingProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('daily_progress')
          .update({
            minutes_completed: existingProgress.minutes_completed + minutesCompleted,
            goal_completed: existingProgress.minutes_completed + minutesCompleted >= existingProgress.goal_minutes
          })
          .eq('id', existingProgress.id);
          
        if (updateError) throw updateError;
        
        return {
          ...existingProgress,
          minutes_completed: existingProgress.minutes_completed + minutesCompleted
        };
      } else {
        // Insert new record with default goal of 60 minutes
        const { data: newProgress, error: insertError } = await supabase
          .from('daily_progress')
          .insert({
            user_id: userId,
            date: today,
            minutes_completed: minutesCompleted,
            goal_minutes: 60,
            goal_completed: minutesCompleted >= 60
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newProgress;
      }
    } catch (error) {
      console.error("Error updating daily progress:", error);
      toast.error("Error updating progress", {
        description: "There was a problem saving your progress."
      });
      return null;
    }
  }
};

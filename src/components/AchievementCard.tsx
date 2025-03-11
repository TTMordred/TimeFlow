
import React from 'react';
import { Award, Star, Trophy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'award' | 'star' | 'trophy' | 'clock';
  unlocked: boolean;
  progress?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, className }) => {
  const IconComponent = {
    award: Award,
    star: Star,
    trophy: Trophy,
    clock: Clock
  }[achievement.icon];

  return (
    <div 
      className={cn(
        "glass rounded-xl p-4 transition-all duration-300",
        achievement.unlocked 
          ? "bg-timeflow-green-100/40 border-timeflow-green-300/50 border" 
          : "bg-secondary/30 opacity-70 saturate-50",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div 
          className={cn(
            "p-2 rounded-lg",
            achievement.unlocked ? "bg-timeflow-green-200/50 text-timeflow-green-600" : "bg-secondary text-muted-foreground"
          )}
        >
          <IconComponent className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">{achievement.title}</h3>
          <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
          
          {achievement.progress !== undefined && (
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  achievement.unlocked ? "bg-timeflow-green-400" : "bg-muted-foreground"
                )}
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;

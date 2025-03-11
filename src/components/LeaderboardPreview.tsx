
import React from 'react';
import { Trophy, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  rank: number;
}

interface LeaderboardPreviewProps {
  topUsers: LeaderboardUser[];
  currentUserRank?: LeaderboardUser;
}

const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({ 
  topUsers, 
  currentUserRank 
}) => {
  return (
    <div className="glass rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-medium">Top Performers</h2>
        </div>
        <Link to="/community">
          <Button variant="ghost" size="sm" className="text-xs">
            View Full Leaderboard <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {topUsers.map((user) => (
          <div 
            key={user.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary font-semibold text-xs">
                {user.rank}
              </div>
              
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="h-4 w-4 text-primary" />
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.streak} day streak
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold">{user.points}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        ))}
      </div>
      
      {currentUserRank && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 font-semibold text-xs">
                {currentUserRank.rank}
              </div>
              
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {currentUserRank.avatar ? (
                  <img src={currentUserRank.avatar} alt={currentUserRank.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="h-4 w-4 text-primary" />
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium">You</p>
                <p className="text-xs text-muted-foreground">
                  {currentUserRank.streak} day streak
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold">{currentUserRank.points}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPreview;

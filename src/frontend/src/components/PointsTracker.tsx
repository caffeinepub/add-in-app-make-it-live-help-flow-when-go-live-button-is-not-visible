import { useMemo } from 'react';
import { Trophy, Star, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PointsTrackerProps {
  teamColor: string;
}

export default function PointsTracker({ teamColor }: PointsTrackerProps) {
  const points = useMemo(() => {
    const storedPoints = localStorage.getItem('fanforge_points');
    return storedPoints ? parseInt(storedPoints, 10) : 0;
  }, []);

  const tier = useMemo(() => {
    if (points >= 500) return { name: 'Legend', icon: Award, badge: '/assets/generated/legend-badge-transparent.dim_40x40.png' };
    if (points >= 200) return { name: 'Captain', icon: Star, badge: '/assets/generated/captain-badge-transparent.dim_40x40.png' };
    return { name: 'Rookie', icon: Trophy, badge: '/assets/generated/rookie-badge-transparent.dim_40x40.png' };
  }, [points]);

  const TierIcon = tier.icon;

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium gap-2"
                style={{ borderColor: teamColor }}
              >
                <img 
                  src={tier.badge} 
                  alt={`${tier.name} badge`}
                  className="w-5 h-5"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="font-bold" style={{ color: teamColor }}>{points}</span>
                <span className="text-xs text-white/70">pts</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1a1a1a] border-white/20 text-white font-medium">
            <p>View points breakdown</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="bg-[#0E0E10] border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-bold flex items-center gap-2">
            <TierIcon className="h-6 w-6" style={{ color: teamColor }} />
            Your Fan Stats
          </DialogTitle>
          <DialogDescription className="text-white/60 font-medium">
            Track your engagement and tier progression
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Tier */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <img 
                src={tier.badge} 
                alt={`${tier.name} badge`}
                className="w-10 h-10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div>
                <p className="text-sm text-white/60 font-medium">Current Tier</p>
                <p className="text-xl font-bold" style={{ color: teamColor }}>{tier.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: teamColor }}>{points}</p>
              <p className="text-xs text-white/60">total points</p>
            </div>
          </div>

          {/* Points Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">Points Per Action</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-white/80">💬 Comment/Post</span>
                <span className="font-semibold text-green-400">+5 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-white/80">🔮 Prediction</span>
                <span className="font-semibold text-green-400">+10 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-white/80">🔗 Referral</span>
                <span className="font-semibold text-green-400">+15 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-white/80">🎥 Highlight Upload</span>
                <span className="font-semibold text-green-400">+25 pts</span>
              </div>
            </div>
          </div>

          {/* Tier Progression */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">Tier Progression</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-white/80">Rookie</span>
                </div>
                <span className="text-xs text-white/60">0 - 199 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white/80">Captain</span>
                </div>
                <span className="text-xs text-white/60">200 - 499 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white/80">Legend</span>
                </div>
                <span className="text-xs text-white/60">500+ pts</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

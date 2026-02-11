import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Trophy, Award, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface LeaderboardEntry {
  username: string;
  points: number;
  tier: string;
  recentActivity: string;
}

export default function FanLeaderboardPage() {
  const navigate = useNavigate();

  // Generate demo leaderboard data
  const leaderboardData = useMemo<LeaderboardEntry[]>(() => {
    const entries: LeaderboardEntry[] = [];
    const activities = [
      'Posted 5 comments today',
      'Made 3 predictions',
      'Uploaded 2 highlights',
      'Shared content on social',
      'Rated 10 players'
    ];

    for (let i = 0; i < 50; i++) {
      const points = Math.max(50, 1000 - i * 15 - Math.floor(Math.random() * 50));
      let tier = 'Rookie';
      if (points >= 500) tier = 'Legend';
      else if (points >= 200) tier = 'Captain';

      entries.push({
        username: `Fan${1000 + i}`,
        points,
        tier,
        recentActivity: activities[Math.floor(Math.random() * activities.length)]
      });
    }

    return entries.sort((a, b) => b.points - a.points);
  }, []);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Legend':
        return <Award className="w-5 h-5 text-purple-400" />;
      case 'Captain':
        return <Star className="w-5 h-5 text-blue-400" />;
      default:
        return <Trophy className="w-5 h-5 text-amber-600" />;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Legend':
        return '/assets/generated/legend-badge-transparent.dim_40x40.png';
      case 'Captain':
        return '/assets/generated/captain-badge-transparent.dim_40x40.png';
      default:
        return '/assets/generated/rookie-badge-transparent.dim_40x40.png';
    }
  };

  const handleGoHome = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold">Fan Leaderboard</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoHome}
            className="hover:bg-white/10"
            aria-label="Return to home page"
          >
            <Home className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Weekly Summary */}
          <Card className="rounded-2xl shadow-lg border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <CardTitle className="font-bold text-white">Weekly AI Summary</CardTitle>
              </div>
              <CardDescription className="text-white/60 font-medium">
                Top fans of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-white/90 leading-relaxed">
                  🏆 <strong>Fan1000</strong> leads this week with an impressive 1000 points! They've been incredibly active, 
                  posting 15 comments, making 8 predictions, and uploading 3 highlights.
                </p>
                <p className="text-white/90 leading-relaxed">
                  ⭐ <strong>Fan1001</strong> and <strong>Fan1002</strong> are close behind, showing exceptional engagement 
                  with the community. The competition is heating up!
                </p>
                <p className="text-white/90 leading-relaxed">
                  🎯 This week saw a 35% increase in highlight uploads and a 50% increase in social sharing. 
                  The FanForge community is more active than ever!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="font-bold text-white">Top Fans by Points</CardTitle>
              <CardDescription className="text-white/60 font-medium">
                Ranked by total engagement points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 pr-4">
                  {leaderboardData.map((entry, index) => (
                    <div 
                      key={entry.username}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                        index < 3 
                          ? 'bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-yellow-400/30' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10">
                          {index < 3 ? (
                            <span className="text-2xl">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                            </span>
                          ) : (
                            <span className="text-lg font-bold text-white/50">#{index + 1}</span>
                          )}
                        </div>
                        
                        <img 
                          src={getTierBadge(entry.tier)}
                          alt={`${entry.tier} badge`}
                          className="w-8 h-8"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{entry.username}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                              {entry.tier}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-1">{entry.recentActivity}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-yellow-400">{entry.points}</p>
                        <p className="text-xs text-white/60">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0E0E10]/95 backdrop-blur mt-8">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-white/50 font-medium">
            © 2025. Built with <span className="text-red-500">♥</span> using{' '}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-semibold"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

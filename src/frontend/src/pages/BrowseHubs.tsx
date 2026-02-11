import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

interface TeamInfo {
  name: string;
  sport: string;
  logo: string;
  color: string;
}

const POPULAR_TEAMS: TeamInfo[] = [
  { name: 'Arsenal', sport: 'Football', logo: '/assets/generated/arsenal-logo-transparent.dim_120x120.png', color: '#EF0107' },
  { name: 'Chelsea', sport: 'Football', logo: '/assets/generated/chelsea-logo-transparent.dim_120x120.png', color: '#034694' },
  { name: 'Manchester United', sport: 'Football', logo: '/assets/generated/manchester-united-logo-transparent.dim_120x120.png', color: '#DA291C' },
  { name: 'Barcelona F.C.', sport: 'Football', logo: '/assets/generated/barcelona-logo-transparent.dim_120x120.png', color: '#A50044' },
  { name: 'Real Madrid', sport: 'Football', logo: '/assets/generated/real-madrid-logo-transparent.dim_120x120.png', color: '#FEBE10' },
  { name: 'Los Angeles Lakers', sport: 'Basketball', logo: '/assets/generated/lakers-logo-transparent.dim_120x120.png', color: '#552583' },
  { name: 'Golden State Warriors', sport: 'Basketball', logo: '/assets/generated/warriors-logo-transparent.dim_120x120.png', color: '#1D428A' },
  { name: 'Chicago Bulls', sport: 'Basketball', logo: '/assets/generated/bulls-logo-transparent.dim_120x120.png', color: '#CE1141' },
  { name: 'Mercedes AMG F1', sport: 'Formula 1', logo: '/assets/generated/mercedes-f1-logo-transparent.dim_120x120.png', color: '#00D2BE' },
  { name: 'Red Bull Racing', sport: 'Formula 1', logo: '/assets/generated/red-bull-racing-logo-transparent.dim_120x120.png', color: '#0600EF' },
  { name: 'Ferrari', sport: 'Formula 1', logo: '/assets/generated/ferrari-f1-logo-transparent.dim_120x120.png', color: '#DC0000' },
  { name: 'India', sport: 'Cricket', logo: '/assets/generated/india-cricket-logo-transparent.dim_120x120.png', color: '#0066CC' },
  { name: 'England', sport: 'Cricket', logo: '/assets/generated/england-cricket-logo-transparent.dim_120x120.png', color: '#0066CC' },
  { name: 'Australia', sport: 'Cricket', logo: '/assets/generated/australia-cricket-logo-transparent.dim_120x120.png', color: '#FFD700' },
];

export default function BrowseHubs() {
  const navigate = useNavigate();

  const handleBackToLanding = () => {
    navigate({ to: '/' });
  };

  const handleMakeMyHub = (team: TeamInfo) => {
    // Save to local storage
    localStorage.setItem('fanforge_team', team.name);
    localStorage.setItem('fanforge_sport', team.sport);
    
    // Clear old data
    localStorage.removeItem('fanforge_posts');
    localStorage.removeItem('fanforge_fixtures');
    localStorage.removeItem('fanforge_predictions');
    localStorage.removeItem('fanforge_news');
    
    toast.success(`${team.name} is now your hub! You can revisit it later.`);
    
    // Navigate to dashboard
    navigate({ to: '/dashboard/$teamName', params: { teamName: team.name } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0E10]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0E0E10]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0E0E10]/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/fanforge-logo-transparent.dim_200x200.png" 
              alt="FanForge Logo" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold text-white">
                FanForge
              </h1>
              <p className="text-xs text-white/50 font-medium">
                Browse Popular Hubs
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToLanding}
            className="rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
            title="Return to home page"
            aria-label="Return to home page"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3">
              Explore Popular Team Hubs
            </h2>
            <p className="text-lg text-white/70 font-medium">
              Select a team to view a demo hub, then make it yours!
            </p>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {POPULAR_TEAMS.map((team) => (
              <Card 
                key={team.name}
                className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <CardHeader className="text-center">
                  <div 
                    className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center p-4 border-2 shadow-xl mb-4 transition-all duration-300 group-hover:shadow-2xl"
                    style={{ 
                      borderColor: team.color,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <img 
                      src={team.logo}
                      alt={`Logo of ${team.name}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <CardTitle 
                    className="font-bold text-lg"
                    style={{ color: team.color }}
                  >
                    {team.name}
                  </CardTitle>
                  <CardDescription className="text-white/60 font-medium">
                    {team.sport}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleMakeMyHub(team)}
                    className="w-full rounded-xl font-semibold transition-all duration-300"
                    style={{ 
                      backgroundColor: team.color,
                      color: 'white'
                    }}
                  >
                    Make This My Hub
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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

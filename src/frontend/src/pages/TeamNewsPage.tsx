import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Newspaper } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetFeatureSectionData } from '@/hooks/useQueries';

const PREDEFINED_TEAMS = {
  Football: ['Arsenal', 'Chelsea', 'Manchester United', 'Barcelona F.C.', 'Real Madrid'],
  Basketball: ['Los Angeles Lakers', 'Golden State Warriors', 'Chicago Bulls'],
  'Formula 1': ['Mercedes AMG F1', 'Red Bull Racing', 'Ferrari'],
  Cricket: ['India', 'England', 'Australia'],
};

export default function TeamNewsPage() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [customTeam, setCustomTeam] = useState<string>('');
  const [showContent, setShowContent] = useState(false);

  const teamToQuery = selectedTeam || customTeam;
  const { data: sectionData, isLoading } = useGetFeatureSectionData(teamToQuery, showContent);

  const handleTeamSelect = (team: string) => {
    setSelectedTeam(team);
    setCustomTeam('');
    setShowContent(true);
  };

  const handleCustomTeamSubmit = () => {
    if (customTeam.trim()) {
      setSelectedTeam('');
      setShowContent(true);
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
            <Newspaper className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">Team News</h1>
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
        {!showContent ? (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Select your team to view Team News</h2>
              <p className="text-white/70 text-lg">Choose from popular teams or enter your own</p>
            </div>

            {/* Predefined Teams */}
            <div className="space-y-6">
              {Object.entries(PREDEFINED_TEAMS).map(([sport, teams]) => (
                <div key={sport} className="space-y-3">
                  <h3 className="text-xl font-semibold text-white/90">{sport}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {teams.map((team) => (
                      <Button
                        key={team}
                        onClick={() => handleTeamSelect(team)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
                      >
                        {team}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Team Input */}
            <div className="space-y-3 pt-6 border-t border-white/10">
              <h3 className="text-xl font-semibold text-white/90">Or enter your team</h3>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Enter team name..."
                  value={customTeam}
                  onChange={(e) => setCustomTeam(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomTeamSubmit()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={handleCustomTeamSubmit}
                  disabled={!customTeam.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  View News
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">{teamToQuery} - Latest News</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowContent(false);
                  setSelectedTeam('');
                  setCustomTeam('');
                }}
                className="border-white/20 hover:bg-white/10"
              >
                Change Team
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-white/70">Loading news...</p>
              </div>
            ) : sectionData && sectionData.newsFeed.length > 0 ? (
              <div className="space-y-4">
                {sectionData.newsFeed.map((news, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <Newspaper className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                      <p className="text-lg">{news}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <Newspaper className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-xl text-white/70">No news available for {teamToQuery}</p>
                <p className="text-sm text-white/50 mt-2">Check back later for updates</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

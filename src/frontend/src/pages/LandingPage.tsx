import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, History, Compass, Trophy, Newspaper, MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import NewsTickerBar from '@/components/NewsTickerBar';
import AuthDialog from '@/components/AuthDialog';
import SharedHubModal from '@/components/SharedHubModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/' });
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSharedHubModal, setShowSharedHubModal] = useState(false);
  const [sharedHubInfo, setSharedHubInfo] = useState<{ userName: string; teamName: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ displayName: string; avatar: string; isGuest: boolean } | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const registeredUser = localStorage.getItem('fanforge_user');
    const guestUser = sessionStorage.getItem('fanforge_user');
    
    let isAuthenticated = false;
    if (registeredUser) {
      setCurrentUser(JSON.parse(registeredUser));
      isAuthenticated = true;
    } else if (guestUser) {
      setCurrentUser(JSON.parse(guestUser));
      isAuthenticated = true;
    }

    // Check for shared hub link (e.g., ?shared=true&userName=John&teamName=Arsenal)
    const isShared = (searchParams as any)?.shared === 'true';
    const userName = (searchParams as any)?.userName || 'User';
    const teamName = (searchParams as any)?.teamName || 'Team';

    if (isShared) {
      // If user is already logged in, skip modal and load hub instantly
      if (isAuthenticated) {
        toast.success(`👤 Welcome back, ${currentUser?.displayName || 'User'}!`);
        // Navigate to the shared hub
        navigate({ to: '/dashboard/$teamName', params: { teamName } });
      } else {
        // Show shared hub modal for non-authenticated users
        setSharedHubInfo({ userName, teamName });
        setShowSharedHubModal(true);
      }
    } else {
      // Show auth dialog on first visit (only if not a shared link)
      if (!isAuthenticated) {
        const hasVisited = localStorage.getItem('fanforge_has_visited');
        if (!hasVisited) {
          setShowAuthDialog(true);
          localStorage.setItem('fanforge_has_visited', 'true');
        }
      }
    }

    // Legacy hub invite handling (for backward compatibility)
    const hubInvite = (searchParams as any)?.hubInvite;
    if (hubInvite && !isShared) {
      const hubInvites = JSON.parse(localStorage.getItem('fanforge_hub_invites') || '[]');
      const invite = hubInvites.find((inv: any) => inv.id === hubInvite);
      
      if (invite) {
        toast.info(`You're viewing ${invite.owner}'s Hub — continue as guest or sign in to interact.`);
      }
    }
  }, [searchParams, navigate]);

  const handleAuth = (user: { displayName: string; avatar: string; isGuest: boolean }) => {
    setCurrentUser(user);
    
    // If coming from shared hub modal, navigate to the shared hub
    if (sharedHubInfo) {
      toast.success(`👤 Welcome back, ${user.displayName}!`);
      navigate({ to: '/dashboard/$teamName', params: { teamName: sharedHubInfo.teamName } });
    }
  };

  const handleSharedHubContinueAsGuest = () => {
    const guestUser = {
      displayName: `Guest${Math.floor(Math.random() * 10000)}`,
      avatar: '/assets/generated/avatar-placeholder-transparent.dim_40x40.png',
      isGuest: true,
    };
    
    sessionStorage.setItem('fanforge_user', JSON.stringify(guestUser));
    sessionStorage.setItem('fanforge_auth_mode', 'guest');
    
    setCurrentUser(guestUser);
    
    // Navigate to the shared hub
    if (sharedHubInfo) {
      navigate({ to: '/dashboard/$teamName', params: { teamName: sharedHubInfo.teamName } });
    }
  };

  const handleSharedHubSignIn = () => {
    setShowSharedHubModal(false);
    setShowAuthDialog(true);
  };

  const handleStartNewHub = () => {
    if (!currentUser) {
      setShowAuthDialog(true);
      return;
    }
    navigate({ to: '/chat', search: { flow: 'new' } });
  };

  const handleRevisitHub = () => {
    if (!currentUser) {
      setShowAuthDialog(true);
      return;
    }

    const authMode = currentUser.isGuest ? 'guest' : 'registered';
    const storage = authMode === 'guest' ? sessionStorage : localStorage;
    const savedTeam = storage.getItem('fanforge_team');
    const savedSport = storage.getItem('fanforge_sport');
    
    if (savedTeam && savedSport) {
      toast.success(`Welcome back to your ${savedTeam} (${savedSport}) hub!`);
      navigate({ to: '/dashboard/$teamName', params: { teamName: savedTeam } });
    } else {
      toast.error("You don't have any previous hubs yet. Start one now!");
    }
  };

  const handleBrowseHubs = () => {
    navigate({ to: '/browse' });
  };

  const handleNavigateToFixtures = () => {
    navigate({ to: '/fixtures' });
  };

  const handleNavigateToNews = () => {
    navigate({ to: '/news' });
  };

  const handleNavigateToCommunity = () => {
    navigate({ to: '/community' });
  };

  const handleNavigateToPredictions = () => {
    navigate({ to: '/predictions' });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/generated/sports-fans-hero.dim_800x400.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen pb-12 md:pb-14">
        <main className="flex-1 flex items-center justify-center">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center animate-slide-up">
                  <h1 className="fanforge-title text-white drop-shadow-2xl animate-fade-in">
                    FAN FORGE
                  </h1>
                </div>

                <p className="text-2xl md:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-semibold drop-shadow-lg animate-fade-in-delay">
                  Build or revisit your own sports fan hub — any team, any sport.
                </p>
                <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-delay-2">
                  Just tell us your team, and we'll build a personalized hub with fixtures, news, predictions, and community posts — all powered by conversation
                </p>
              </div>

              <div className="pt-8 animate-fade-in-delay-3 flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                <Button 
                  size="lg" 
                  onClick={handleStartNewHub}
                  className="text-xl px-12 py-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold border-2 border-white/20"
                >
                  <MessageSquare className="mr-3 h-7 w-7" />
                  Start New Hub
                </Button>
                
                <Button 
                  size="lg" 
                  onClick={handleRevisitHub}
                  variant="outline"
                  className="text-xl px-12 py-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-white/10 hover:bg-white/20 text-white font-bold border-2 border-white/40 backdrop-blur-md"
                >
                  <History className="mr-3 h-7 w-7" />
                  Revisit Previous Hub
                </Button>
                
                <Button 
                  size="lg" 
                  onClick={handleBrowseHubs}
                  variant="outline"
                  className="text-xl px-12 py-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-white/10 hover:bg-white/20 text-white font-bold border-2 border-white/40 backdrop-blur-md"
                >
                  <Compass className="mr-3 h-7 w-7" />
                  Browse Popular Hubs
                </Button>
              </div>

              <div className="pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto animate-fade-in-delay-4">
                <button
                  onClick={handleNavigateToFixtures}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
                  aria-label="Navigate to Live Fixtures"
                >
                  <div className="text-4xl mb-3">
                    <Trophy className="w-12 h-12 mx-auto text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Live Fixtures</h3>
                  <p className="text-sm text-white/80">Track upcoming games and results</p>
                </button>

                <button
                  onClick={handleNavigateToNews}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
                  aria-label="Navigate to Team News"
                >
                  <div className="text-4xl mb-3">
                    <Newspaper className="w-12 h-12 mx-auto text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Team News</h3>
                  <p className="text-sm text-white/80">Stay updated with latest stories</p>
                </button>

                <button
                  onClick={handleNavigateToCommunity}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
                  aria-label="Navigate to Fan Community"
                >
                  <div className="text-4xl mb-3">
                    <MessageCircle className="w-12 h-12 mx-auto text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Fan Community</h3>
                  <p className="text-sm text-white/80">Connect with fellow supporters</p>
                </button>

                <button
                  onClick={handleNavigateToPredictions}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
                  aria-label="Navigate to Fan Predictions"
                >
                  <div className="text-4xl mb-3">
                    <Sparkles className="w-12 h-12 mx-auto text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Fan Predictions</h3>
                  <p className="text-sm text-white/80">Share your match predictions</p>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/20 bg-black/30 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-white/80 font-medium">
              © {new Date().getFullYear()}. Built with <span className="text-red-400">♥</span> using{' '}
              <a 
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
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

      <NewsTickerBar />
      
      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuth={handleAuth}
      />

      {sharedHubInfo && (
        <SharedHubModal
          open={showSharedHubModal}
          onClose={() => setShowSharedHubModal(false)}
          userName={sharedHubInfo.userName}
          teamName={sharedHubInfo.teamName}
          onContinueAsGuest={handleSharedHubContinueAsGuest}
          onSignIn={handleSharedHubSignIn}
        />
      )}
    </div>
  );
}

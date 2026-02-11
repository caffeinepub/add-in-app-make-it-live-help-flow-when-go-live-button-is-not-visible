import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Send, Home, RefreshCw, Trophy, ChevronDown, X, Film } from 'lucide-react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetDashboardData, useAddPost, useAddPrediction, useUpdateNews, useAddFixture, useGetAllHubs, useGetNextFiveFixtures } from '@/hooks/useQueries';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TeamVisualTemplate from '@/components/TeamVisualTemplate';
import PointsTracker from '@/components/PointsTracker';
import ShareToSocial from '@/components/ShareToSocial';
import SocialBuzzPanel from '@/components/SocialBuzzPanel';
import HighlightsTab from '@/components/HighlightsTab';
import TeamOfTheWeekBuilder from '@/components/TeamOfTheWeekBuilder';
import UserProfile from '@/components/UserProfile';
import EmojiPicker from '@/components/EmojiPicker';

export default function Dashboard() {
  const { teamName } = useParams({ from: '/dashboard/$teamName' });
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useGetDashboardData(teamName);
  const { data: nextFiveFixtures } = useGetNextFiveFixtures(teamName);
  const { data: allHubs } = useGetAllHubs();
  const addPostMutation = useAddPost();
  const addPredictionMutation = useAddPrediction();
  const updateNewsMutation = useUpdateNews();
  const addFixtureMutation = useAddFixture();

  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'fixtures' | 'news' | 'posts' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<{ displayName: string; avatar: string; isGuest: boolean } | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  const chatInputRef = useRef<HTMLInputElement>(null);
  const fixturesRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const expandedViewRef = useRef<HTMLDivElement>(null);

  const prevDataRef = useRef<typeof dashboardData>(null);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const registeredUser = localStorage.getItem('fanforge_user');
    const guestUser = sessionStorage.getItem('fanforge_user');
    
    if (registeredUser) {
      setCurrentUser(JSON.parse(registeredUser));
    } else if (guestUser) {
      setCurrentUser(JSON.parse(guestUser));
    }

    const points = parseInt(localStorage.getItem('fanforge_points') || '0', 10);
    setUserPoints(points);
  }, []);

  useEffect(() => {
    if (dashboardData && prevDataRef.current) {
      const newIds = new Set<string>();
      
      if (dashboardData.communityPosts.length > prevDataRef.current.communityPosts.length) {
        const newPost = dashboardData.communityPosts[0];
        newIds.add(`post-${newPost[0]}-${newPost[1]}`);
      }
      
      if (dashboardData.fanPredictions.length > prevDataRef.current.fanPredictions.length) {
        const newPrediction = dashboardData.fanPredictions[0];
        newIds.add(`prediction-${newPrediction}`);
      }
      
      if (dashboardData.newsFeed.length > prevDataRef.current.newsFeed.length) {
        const newNews = dashboardData.newsFeed[0];
        newIds.add(`news-${newNews}`);
      }
      
      if (dashboardData.fixtures.length > prevDataRef.current.fixtures.length) {
        const newFixture = dashboardData.fixtures[0];
        newIds.add(`fixture-${newFixture}`);
      }
      
      if (newIds.size > 0) {
        setNewItemIds(newIds);
        setTimeout(() => setNewItemIds(new Set()), 1000);
      }
    }
    
    prevDataRef.current = dashboardData;
  }, [dashboardData]);

  useEffect(() => {
    if (expandedSection && expandedViewRef.current) {
      expandedViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [expandedSection]);

  const teamColor = useMemo(() => {
    return dashboardData?.teamColor || '#FFFFFF';
  }, [dashboardData]);

  const sportName = useMemo(() => {
    return localStorage.getItem('fanforge_sport') || 'Sport';
  }, []);

  const sportEmoji = useMemo(() => {
    const sportEmojiMap: Record<string, string> = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Formula 1': '🏎️',
      'Cricket': '🏏'
    };
    return sportEmojiMap[sportName] || '🏆';
  }, [sportName]);

  const leaderboardData = useMemo(() => {
    if (!allHubs) return [];
    
    const teamPostCounts: Record<string, number> = {};
    
    allHubs.forEach(([_, team]) => {
      const cleanTeam = team.replace(/\s*\([^)]*\)$/, '');
      teamPostCounts[cleanTeam] = (teamPostCounts[cleanTeam] || 0) + 1;
    });
    
    return Object.entries(teamPostCounts)
      .map(([team, count]) => ({ team, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [allHubs]);

  const parseFixture = (fixture: string) => {
    if (fixture === 'TBD') {
      return { date: '', opponent: 'TBD', homeAway: '', isTBD: true };
    }
    
    const vsMatch = fixture.match(/^(.+?)\s+vs\s+(.+?)\s*\((.+?)\)$/);
    if (vsMatch) {
      return {
        date: vsMatch[1].trim(),
        opponent: vsMatch[2].trim(),
        homeAway: vsMatch[3].trim(),
        isTBD: false
      };
    }
    
    const awayMatch = fixture.match(/^(.+?)\s+@\s+(.+?)\s*\((.+?)\)$/);
    if (awayMatch) {
      return {
        date: awayMatch[1].trim(),
        opponent: awayMatch[2].trim(),
        homeAway: awayMatch[3].trim(),
        isTBD: false
      };
    }
    
    const arrowMatch = fixture.match(/^(.+?)\s*→\s*(.+?)\s*\((.+?)\)$/);
    if (arrowMatch) {
      return {
        date: arrowMatch[1].trim(),
        opponent: arrowMatch[2].trim(),
        homeAway: arrowMatch[3].trim(),
        isTBD: false
      };
    }
    
    return { date: '', opponent: fixture, homeAway: '', isTBD: false };
  };

  const parseCommand = (input: string): { type: 'post' | 'prediction' | 'news' | 'fixture' | 'none', content: string } => {
    const lowerInput = input.toLowerCase().trim();
    
    const postMatch = lowerInput.match(/^add\s+post\s+about\s+(.+)$/i);
    if (postMatch) {
      return { type: 'post', content: input.substring(input.toLowerCase().indexOf('about') + 6).trim() };
    }
    
    const predictionMatch = lowerInput.match(/^add\s+prediction\s+(.+)$/i);
    if (predictionMatch) {
      return { type: 'prediction', content: input.substring(input.toLowerCase().indexOf('prediction') + 11).trim() };
    }
    
    const newsMatch = lowerInput.match(/^update\s+news\s+with\s+(.+)$/i);
    if (newsMatch) {
      return { type: 'news', content: input.substring(input.toLowerCase().indexOf('with') + 5).trim() };
    }
    
    const fixtureMatch = lowerInput.match(/^add\s+fixture\s+(.+)$/i);
    if (fixtureMatch) {
      return { type: 'fixture', content: input.substring(input.toLowerCase().indexOf('fixture') + 8).trim() };
    }
    
    return { type: 'none', content: input };
  };

  const awardPoints = (points: number) => {
    const currentPoints = parseInt(localStorage.getItem('fanforge_points') || '0', 10);
    const newPoints = currentPoints + points;
    localStorage.setItem('fanforge_points', newPoints.toString());
    setUserPoints(newPoints);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isProcessing) return;

    const command = parseCommand(chatInput.trim());
    const inputText = chatInput.trim();
    setChatInput('');
    setIsProcessing(true);

    if (command.type === 'post') {
      addPostMutation.mutate(
        { teamName, post: command.content },
        {
          onSuccess: () => {
            toast.success('Post added!');
            
            awardPoints(5);
            toast.success('You earned +5 points for your post!');
            
            const posts = JSON.parse(localStorage.getItem('fanforge_posts') || '[]');
            posts.unshift({ content: command.content, timestamp: Date.now() });
            localStorage.setItem('fanforge_posts', JSON.stringify(posts));
            toast.success('Your hub has been saved. You can revisit it later.');
            
            setIsProcessing(false);
          },
          onError: () => {
            toast.error('Failed to add post.');
            setIsProcessing(false);
          }
        }
      );
    } else if (command.type === 'prediction') {
      addPredictionMutation.mutate(
        { teamName, prediction: command.content },
        {
          onSuccess: () => {
            toast.success('Prediction added!');
            
            awardPoints(10);
            toast.success('You earned +10 points for your prediction!');
            
            const predictions = JSON.parse(localStorage.getItem('fanforge_predictions') || '[]');
            predictions.unshift(command.content);
            localStorage.setItem('fanforge_predictions', JSON.stringify(predictions));
            toast.success('Your hub has been saved. You can revisit it later.');
            
            setIsProcessing(false);
          },
          onError: () => {
            toast.error('Failed to add prediction.');
            setIsProcessing(false);
          }
        }
      );
    } else if (command.type === 'news') {
      updateNewsMutation.mutate(
        { teamName, news: command.content },
        {
          onSuccess: () => {
            toast.success('News added!');
            
            const news = JSON.parse(localStorage.getItem('fanforge_news') || '[]');
            news.unshift(command.content);
            localStorage.setItem('fanforge_news', JSON.stringify(news));
            toast.success('Your hub has been saved. You can revisit it later.');
            
            setIsProcessing(false);
          },
          onError: () => {
            toast.error('Failed to update news.');
            setIsProcessing(false);
          }
        }
      );
    } else if (command.type === 'fixture') {
      addFixtureMutation.mutate(
        { teamName, fixture: command.content },
        {
          onSuccess: () => {
            toast.success('Fixture added!');
            
            const fixtures = JSON.parse(localStorage.getItem('fanforge_fixtures') || '[]');
            fixtures.unshift(command.content);
            localStorage.setItem('fanforge_fixtures', JSON.stringify(fixtures));
            toast.success('Your hub has been saved. You can revisit it later.');
            
            setIsProcessing(false);
          },
          onError: () => {
            toast.error('Failed to add fixture.');
            setIsProcessing(false);
          }
        }
      );
    } else {
      toast.error('Command not recognized. Try: "Add Post about...", "Add Prediction...", "Add Fixture...", or "Update News with..."');
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const formatTimestamp = (timestamp: bigint): string => {
    const ms = Number(timestamp / 1000000n);
    const date = new Date(ms);
    
    if (ms === 0 || isNaN(date.getTime())) {
      return 'Just now';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleBackToLanding = () => {
    navigate({ to: '/' });
  };

  const handleSwitchHub = () => {
    navigate({ to: '/' });
  };

  const handleSectionClick = (section: 'fixtures' | 'news' | 'posts') => {
    setExpandedSection(section);
  };

  const handleCloseExpanded = () => {
    setExpandedSection(null);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, section: 'fixtures' | 'news' | 'posts') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSectionClick(section);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setChatInput(prev => prev + emoji);
    chatInputRef.current?.focus();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserPoints(0);
  };

  const demoPlayers = useMemo(() => {
    return [
      { id: 0, name: 'Player 1', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.5, position: 'Forward' },
      { id: 1, name: 'Player 2', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.3, position: 'Midfielder' },
      { id: 2, name: 'Player 3', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.7, position: 'Defender' },
      { id: 3, name: 'Player 4', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.2, position: 'Goalkeeper' },
      { id: 4, name: 'Player 5', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.6, position: 'Forward' },
      { id: 5, name: 'Player 6', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.4, position: 'Midfielder' },
      { id: 6, name: 'Player 7', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.1, position: 'Defender' },
      { id: 7, name: 'Player 8', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.8, position: 'Forward' },
      { id: 8, name: 'Player 9', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.0, position: 'Midfielder' },
      { id: 9, name: 'Player 10', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.5, position: 'Defender' },
      { id: 10, name: 'Player 11', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.3, position: 'Midfielder' },
      { id: 11, name: 'Player 12', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png', rating: 4.6, position: 'Forward' },
    ];
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0E10] pb-24">
      <header className="border-b border-white/10 bg-[#0E0E10]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0E0E10]/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/fanforge-logo-transparent.dim_200x200.png" 
                alt="FanForge Logo" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-xl font-bold text-white">
                  FanForge – <span 
                    className="font-bold"
                    style={{ color: teamColor }}
                  >
                    {teamName}
                  </span> ({sportName}) Hub
                </h1>
                <p className="text-xs text-white/50 font-medium">Your personalized fan dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser && (
                <UserProfile
                  user={currentUser}
                  points={userPoints}
                  onLogout={handleLogout}
                />
              )}
              <PointsTracker teamColor={teamColor} />
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Leaderboard
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0E0E10] border-white/20 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white font-bold flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      Global Fan Leaderboard
                    </DialogTitle>
                    <DialogDescription className="text-white/60 font-medium">
                      Top teams by number of fan hubs created
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-2 pr-4">
                      {leaderboardData.length > 0 ? (
                        leaderboardData.map((item, index) => (
                          <div 
                            key={item.team}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-white/50 w-6">
                                #{index + 1}
                              </span>
                              <span className="font-medium text-white">{item.team}</span>
                            </div>
                            <span className="text-sm font-semibold text-white/70">
                              {item.count} {item.count === 1 ? 'hub' : 'hubs'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-white/50 py-8">No data yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwitchHub}
                className="rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Switch Hub
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            <TeamVisualTemplate 
              teamName={teamName}
              sportName={sportName}
              teamColor={teamColor}
            />

            <div className="mb-6 flex justify-center">
              <TeamOfTheWeekBuilder 
                teamName={teamName}
                teamColor={teamColor}
                players={demoPlayers}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 bg-white/5 border border-white/10">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/10">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="highlights" className="data-[state=active]:bg-white/10">
                  <Film className="w-4 h-4 mr-2" />
                  Highlights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div
                        ref={fixturesRef}
                        onClick={() => handleSectionClick('fixtures')}
                        onKeyDown={(e) => handleCardKeyDown(e, 'fixtures')}
                        tabIndex={0}
                        role="button"
                        aria-label="View detailed fixtures"
                        className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0E0E10] rounded-2xl"
                      >
                        <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{sportEmoji}</span>
                                <CardTitle className="font-bold text-white" style={{ color: teamColor }}>Next 5 Fixtures</CardTitle>
                              </div>
                              <ChevronDown className="h-5 w-5 text-white/50" />
                            </div>
                            <CardDescription className="text-white/60 font-medium">Upcoming games for {teamName}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-64">
                              {nextFiveFixtures && nextFiveFixtures.length > 0 ? (
                                <div className="space-y-3">
                                  {nextFiveFixtures.map((fixture, index) => {
                                    const parsed = parseFixture(fixture);
                                    const itemId = `fixture-${fixture}`;
                                    const isNew = newItemIds.has(itemId);
                                    
                                    return (
                                      <a
                                        key={index}
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className={`block p-3 rounded-xl bg-white/5 border border-white/10 shadow-md hover:bg-white/10 hover:border-white/20 transition-all duration-200 ${isNew ? 'animate-in fade-in duration-500' : ''}`}
                                      >
                                        {parsed.isTBD ? (
                                          <p className="text-sm text-white/50 font-medium italic">TBD</p>
                                        ) : (
                                          <p className="text-sm text-white font-medium">
                                            <span style={{ color: teamColor }} className="font-semibold">{parsed.date}</span>
                                            {parsed.date && ' vs '}
                                            <span className="font-bold">{parsed.opponent}</span>
                                            {parsed.homeAway && <span className="italic text-white/70"> ({parsed.homeAway})</span>}
                                          </p>
                                        )}
                                      </a>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-white/50">
                                  <span className="text-4xl mb-2">{sportEmoji}</span>
                                  <p className="text-sm font-medium">No fixtures scheduled yet</p>
                                  <p className="text-xs mt-1">Use chat to add fixtures</p>
                                </div>
                              )}
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>

                      <div
                        ref={newsRef}
                        onClick={() => handleSectionClick('news')}
                        onKeyDown={(e) => handleCardKeyDown(e, 'news')}
                        tabIndex={0}
                        role="button"
                        aria-label="View detailed news feed"
                        className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0E0E10] rounded-2xl"
                      >
                        <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">📰</span>
                                <CardTitle className="font-bold text-white" style={{ color: teamColor }}>Latest News Feed</CardTitle>
                              </div>
                              <ChevronDown className="h-5 w-5 text-white/50" />
                            </div>
                            <CardDescription className="text-white/60 font-medium">Recent news about {teamName}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-64">
                              {dashboardData?.newsFeed && dashboardData.newsFeed.length > 0 ? (
                                <div className="space-y-3">
                                  {dashboardData.newsFeed.slice(0, 3).map((news, index) => {
                                    const itemId = `news-${news}`;
                                    const isNew = newItemIds.has(itemId);
                                    return (
                                      <div 
                                        key={index} 
                                        className={`p-3 rounded-xl bg-white/5 border border-white/10 shadow-md ${isNew ? 'animate-in fade-in duration-500' : ''}`}
                                      >
                                        <p className="text-sm text-white font-medium">{news}</p>
                                      </div>
                                    );
                                  })}
                                  {dashboardData.newsFeed.length > 3 && (
                                    <p className="text-xs text-white/50 text-center pt-2 font-medium">
                                      Click to view all {dashboardData.newsFeed.length} news articles
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-white/50">
                                  <span className="text-4xl mb-2">📰</span>
                                  <p className="text-sm font-medium">No news articles yet</p>
                                  <p className="text-xs mt-1">Use chat to add news</p>
                                </div>
                              )}
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>

                      <div
                        ref={postsRef}
                        onClick={() => handleSectionClick('posts')}
                        onKeyDown={(e) => handleCardKeyDown(e, 'posts')}
                        tabIndex={0}
                        role="button"
                        aria-label="View detailed community posts"
                        className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0E0E10] rounded-2xl"
                      >
                        <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">💬</span>
                                <CardTitle className="font-bold text-white" style={{ color: teamColor }}>Community Posts</CardTitle>
                              </div>
                              <ChevronDown className="h-5 w-5 text-white/50" />
                            </div>
                            <CardDescription className="text-white/60 font-medium">What fans are saying</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-64">
                              {dashboardData?.communityPosts && dashboardData.communityPosts.length > 0 ? (
                                <div className="space-y-3">
                                  {dashboardData.communityPosts.slice(0, 3).map(([post, timestamp], index) => {
                                    const itemId = `post-${post}-${timestamp}`;
                                    const isNew = newItemIds.has(itemId);
                                    return (
                                      <div 
                                        key={index} 
                                        className={`p-3 rounded-xl bg-white/5 border border-white/10 shadow-md ${isNew ? 'animate-in fade-in duration-500' : ''}`}
                                      >
                                        <p className="text-sm text-white font-medium">{post}</p>
                                        <p className="text-xs text-white/40 mt-1 font-medium">
                                          {formatTimestamp(timestamp)}
                                        </p>
                                        <ShareToSocial commentText={post} />
                                      </div>
                                    );
                                  })}
                                  {dashboardData.communityPosts.length > 3 && (
                                    <p className="text-xs text-white/50 text-center pt-2 font-medium">
                                      Click to view all {dashboardData.communityPosts.length} posts
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-white/50">
                                  <span className="text-4xl mb-2">💬</span>
                                  <p className="text-sm font-medium">No posts yet</p>
                                  <p className="text-xs mt-1">Be the first to share your thoughts!</p>
                                </div>
                              )}
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🔮</span>
                            <CardTitle className="font-bold text-white" style={{ color: teamColor }}>Fan Predictions</CardTitle>
                          </div>
                          <CardDescription className="text-white/60 font-medium">Game predictions from fans</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64">
                            {dashboardData?.fanPredictions && dashboardData.fanPredictions.length > 0 ? (
                              <div className="space-y-3">
                                {dashboardData.fanPredictions.map((prediction, index) => {
                                  const itemId = `prediction-${prediction}`;
                                  const isNew = newItemIds.has(itemId);
                                  return (
                                    <div 
                                      key={index} 
                                      className={`p-3 rounded-xl bg-white/5 border border-white/10 shadow-md ${isNew ? 'animate-in fade-in duration-500' : ''}`}
                                    >
                                      <p className="text-sm text-white font-medium">{prediction}</p>
                                      <ShareToSocial commentText={prediction} />
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center text-white/50">
                                <span className="text-4xl mb-2">🔮</span>
                                <p className="text-sm font-medium">No predictions yet</p>
                                <p className="text-xs mt-1">Make your first prediction!</p>
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>

                    {expandedSection && (
                      <div 
                        ref={expandedViewRef}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      >
                        <Card className="rounded-2xl shadow-2xl border-white/20 bg-white/10 backdrop-blur">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">
                                  {expandedSection === 'fixtures' && sportEmoji}
                                  {expandedSection === 'news' && '📰'}
                                  {expandedSection === 'posts' && '💬'}
                                </span>
                                <CardTitle className="font-bold text-white text-xl" style={{ color: teamColor }}>
                                  {expandedSection === 'fixtures' && 'All Upcoming Fixtures'}
                                  {expandedSection === 'news' && 'All Latest News'}
                                  {expandedSection === 'posts' && 'All Community Posts'}
                                </CardTitle>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCloseExpanded}
                                className="text-white hover:bg-white/10 rounded-xl"
                                aria-label="Close expanded view"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                            <CardDescription className="text-white/60 font-medium">
                              {expandedSection === 'fixtures' && `Complete schedule for ${teamName}`}
                              {expandedSection === 'news' && `All news articles about ${teamName}`}
                              {expandedSection === 'posts' && `All posts from ${teamName} fans`}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-[500px]">
                              <div className="space-y-3 pr-4">
                                {expandedSection === 'fixtures' && nextFiveFixtures && (
                                  nextFiveFixtures.length > 0 ? (
                                    nextFiveFixtures.map((fixture, index) => {
                                      const parsed = parseFixture(fixture);
                                      return (
                                        <a
                                          key={index}
                                          href="#"
                                          onClick={(e) => e.preventDefault()}
                                          className="block p-4 rounded-xl bg-white/5 border border-white/10 shadow-md hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                                        >
                                          {parsed.isTBD ? (
                                            <p className="text-base text-white/50 font-medium italic">TBD</p>
                                          ) : (
                                            <p className="text-base text-white font-medium">
                                              <span style={{ color: teamColor }} className="font-semibold">{parsed.date}</span>
                                              {parsed.date && ' vs '}
                                              <span className="font-bold">{parsed.opponent}</span>
                                              {parsed.homeAway && <span className="italic text-white/70"> ({parsed.homeAway})</span>}
                                            </p>
                                          )}
                                        </a>
                                      );
                                    })
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center text-white/50">
                                      <span className="text-5xl mb-3">{sportEmoji}</span>
                                      <p className="text-base font-medium">No fixtures scheduled yet</p>
                                      <p className="text-sm mt-2">Use the chat below to add fixtures</p>
                                    </div>
                                  )
                                )}
                                {expandedSection === 'news' && dashboardData?.newsFeed && (
                                  dashboardData.newsFeed.length > 0 ? (
                                    dashboardData.newsFeed.map((news, index) => (
                                      <div 
                                        key={index} 
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-md hover:bg-white/10 transition-colors"
                                      >
                                        <p className="text-base text-white font-medium">{news}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center text-white/50">
                                      <span className="text-5xl mb-3">📰</span>
                                      <p className="text-base font-medium">No news articles yet</p>
                                      <p className="text-sm mt-2">Use the chat below to add news</p>
                                    </div>
                                  )
                                )}
                                {expandedSection === 'posts' && dashboardData?.communityPosts && (
                                  dashboardData.communityPosts.length > 0 ? (
                                    dashboardData.communityPosts.map(([post, timestamp], index) => (
                                      <div 
                                        key={index} 
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-md hover:bg-white/10 transition-colors"
                                      >
                                        <p className="text-base text-white font-medium">{post}</p>
                                        <p className="text-xs text-white/40 mt-2 font-medium">
                                          {formatTimestamp(timestamp)}
                                        </p>
                                        <ShareToSocial commentText={post} />
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center text-white/50">
                                      <span className="text-5xl mb-3">💬</span>
                                      <p className="text-base font-medium">No posts yet</p>
                                      <p className="text-sm mt-2">Be the first to share your thoughts!</p>
                                    </div>
                                  )
                                )}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <SocialBuzzPanel />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="highlights">
                <HighlightsTab 
                  teamName={teamName}
                  teamColor={teamColor}
                  onPointsEarned={awardPoints}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0E0E10]/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <div className="flex-1 flex gap-1">
              <Input
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Try: "Add Post about...", "Add Fixture...", or "Add Prediction..."'
                className="flex-1 rounded-2xl px-6 shadow-lg bg-white/5 border-white/20 text-white placeholder:text-white/40 font-medium"
                disabled={isProcessing}
              />
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
            <Button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || isProcessing}
              size="icon"
              className="rounded-2xl h-10 w-10 shrink-0 shadow-lg"
              style={{ backgroundColor: teamColor }}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

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

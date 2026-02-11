import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Sparkles, Home } from 'lucide-react';
import { useCreateHub, useAddPost, useAddPrediction, useUpdateNews, useAddFixture, useGetHub } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { useNavigate, useSearch } from '@tanstack/react-router';
import EmojiPicker from '@/components/EmojiPicker';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function getUserId(): string {
  let userId = localStorage.getItem('fanforge_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('fanforge_user_id', userId);
  }
  return userId;
}

const TEAMS_BY_SPORT: Record<string, string[]> = {
  'Football': ['Arsenal', 'Chelsea', 'Manchester United', 'Barcelona F.C.', 'Real Madrid'],
  'Basketball': ['Los Angeles Lakers', 'Golden State Warriors', 'Chicago Bulls'],
  'Formula 1': ['Mercedes AMG F1', 'Red Bull Racing', 'Ferrari'],
  'Cricket': ['India', 'England', 'Australia']
};

const SPORT_EMOJIS: Record<string, string> = {
  'Football': '⚽',
  'Basketball': '🏀',
  'Formula 1': '🏎️',
  'Cricket': '🏏'
};

export default function ChatInterface() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/chat' });
  const flow = (searchParams as any)?.flow as string | undefined;
  const teamNameFromUrl = (searchParams as any)?.teamName as string | undefined;
  
  const userId = getUserId();
  const { data: existingTeam } = useGetHub(userId);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Just talk to FanForge to add posts, fixtures, predictions, or news.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSport, setCurrentSport] = useState<string | null>(null);
  const [currentTeam, setCurrentTeam] = useState<string | null>(teamNameFromUrl || null);
  const [showTeamButtons, setShowTeamButtons] = useState(false);
  const [pendingTeamName, setPendingTeamName] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createHubMutation = useCreateHub();
  const addPostMutation = useAddPost();
  const addPredictionMutation = useAddPrediction();
  const updateNewsMutation = useUpdateNews();
  const addFixtureMutation = useAddFixture();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (flow === 'new') {
      const savedTeam = localStorage.getItem('fanforge_team');
      if (savedTeam) {
        setMessages([
          {
            id: '0',
            role: 'assistant',
            content: "Just talk to FanForge to add posts, fixtures, predictions, or news.",
            timestamp: new Date()
          },
          {
            id: '1',
            role: 'assistant',
            content: "Which sport do you want to follow?",
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages([
          {
            id: '0',
            role: 'assistant',
            content: "Just talk to FanForge to add posts, fixtures, predictions, or news.",
            timestamp: new Date()
          },
          {
            id: '1',
            role: 'assistant',
            content: "Which sport do you want to follow?",
            timestamp: new Date()
          }
        ]);
      }
    } else if (existingTeam && !currentTeam && !teamNameFromUrl) {
      setCurrentTeam(existingTeam);
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: "Just talk to FanForge to add posts, fixtures, predictions, or news.",
          timestamp: new Date()
        },
        {
          id: '1',
          role: 'assistant',
          content: `Welcome back to your ${existingTeam} hub! You can add content using commands like:\n\n• "Add Post about [your message]"\n• "Add Prediction [your prediction]"\n• "Add Fixture [opponent + date]"\n• "Update News with [headline]"`,
          timestamp: new Date()
        }
      ]);
    } else if (teamNameFromUrl) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: "Just talk to FanForge to add posts, fixtures, predictions, or news.",
          timestamp: new Date()
        },
        {
          id: '1',
          role: 'assistant',
          content: `Welcome to your ${teamNameFromUrl} hub! You can add content using commands like:\n\n• "Add Post about [your message]"\n• "Add Prediction [your prediction]"\n• "Add Fixture [opponent + date]"\n• "Update News with [headline]"`,
          timestamp: new Date()
        }
      ]);
    }
  }, [flow, existingTeam, currentTeam, teamNameFromUrl]);

  const addAssistantMessage = (content: string) => {
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
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

  const handleTeamButtonClick = (team: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: team,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setShowTeamButtons(false);
    handleTeamSelection(team);
  };

  const handleTeamSelection = async (teamName: string) => {
    const savedTeam = localStorage.getItem('fanforge_team');
    
    if (savedTeam && flow === 'new') {
      setPendingTeamName(teamName);
      setAwaitingConfirmation(true);
      addAssistantMessage(`Confirm new hub for ${teamName}? This will replace your current hub.\n\nReply "Yes" to confirm or "No" to cancel.`);
    } else {
      await createNewHub(teamName);
    }
  };

  const createNewHub = async (teamName: string) => {
    setIsSwitching(true);
    
    // Show loading spinner with message
    const loadingToast = toast.loading('Switching Hub — Please Wait');
    
    // Clear old data if exists
    localStorage.removeItem('fanforge_posts');
    localStorage.removeItem('fanforge_fixtures');
    localStorage.removeItem('fanforge_predictions');
    localStorage.removeItem('fanforge_news');
    
    // Store sport and team in localStorage
    localStorage.setItem('fanforge_sport', currentSport || '');
    localStorage.setItem('fanforge_team', teamName);
    
    // Ensure completion within 1.5 seconds
    const timeoutId = setTimeout(() => {
      if (isSwitching) {
        toast.dismiss(loadingToast);
        toast.success('✅ Hub switched successfully!');
        setIsSwitching(false);
        navigate({ to: '/dashboard/$teamName', params: { teamName } });
      }
    }, 1500);
    
    createHubMutation.mutate(
      { userId, teamName: `${teamName} (${currentSport})` },
      {
        onSuccess: () => {
          clearTimeout(timeoutId);
          setCurrentTeam(teamName);
          addAssistantMessage(`Great! Your ${teamName} (${currentSport}) hub has been created. You can now:\n\n• View your dashboard\n• Add posts using "Add Post about [your message]"\n• Add predictions using "Add Prediction [your prediction]"\n• Add fixtures using "Add Fixture [opponent + date]"\n• Update news using "Update News with [headline]"`);
          
          toast.dismiss(loadingToast);
          toast.success('✅ Hub switched successfully!');
          toast.success('Your hub has been saved. You can revisit it later.');
          
          setIsSwitching(false);
          
          setTimeout(() => {
            navigate({ to: '/dashboard/$teamName', params: { teamName } });
          }, 500);
        },
        onError: () => {
          clearTimeout(timeoutId);
          toast.dismiss(loadingToast);
          toast.error('Failed to create hub. Please try again.');
          addAssistantMessage('Sorry, there was an error creating your hub. Please try again.');
          setIsSwitching(false);
        }
      }
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || isSwitching) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsTyping(true);

    if (awaitingConfirmation && pendingTeamName) {
      if (userInput.toLowerCase() === 'yes') {
        setAwaitingConfirmation(false);
        await createNewHub(pendingTeamName);
        setPendingTeamName(null);
        return;
      } else if (userInput.toLowerCase() === 'no') {
        setAwaitingConfirmation(false);
        setPendingTeamName(null);
        addAssistantMessage('Hub creation cancelled. Returning to home page...');
        setIsTyping(false);
        setTimeout(() => {
          navigate({ to: '/' });
        }, 1500);
        return;
      } else {
        addAssistantMessage('Please reply "Yes" to confirm or "No" to cancel.');
        setIsTyping(false);
        return;
      }
    }

    if (!currentSport && !currentTeam) {
      setCurrentSport(userInput);
      localStorage.setItem('fanforge_sport', userInput);
      
      const normalizedSport = Object.keys(TEAMS_BY_SPORT).find(
        sport => sport.toLowerCase() === userInput.toLowerCase()
      );
      
      if (normalizedSport) {
        addAssistantMessage(`Great choice! ${SPORT_EMOJIS[normalizedSport] || ''} Which team?`);
        setShowTeamButtons(true);
      } else {
        addAssistantMessage(`Which team?`);
      }
      setIsTyping(false);
      return;
    }

    if (currentSport && !currentTeam) {
      await handleTeamSelection(userInput);
      return;
    }

    const command = parseCommand(userInput);
    
    if (!currentTeam) {
      addAssistantMessage('Please set up your team first.');
      setIsTyping(false);
      return;
    }
    
    if (command.type === 'post') {
      addPostMutation.mutate(
        { teamName: currentTeam, post: command.content },
        {
          onSuccess: () => {
            addAssistantMessage(`✓ Post added successfully! Your message "${command.content}" has been added to the Community Posts section.`);
            toast.success('Post added to dashboard!');
            
            const posts = JSON.parse(localStorage.getItem('fanforge_posts') || '[]');
            posts.unshift({ content: command.content, timestamp: Date.now() });
            localStorage.setItem('fanforge_posts', JSON.stringify(posts));
            
            setIsTyping(false);
          },
          onError: () => {
            addAssistantMessage('Sorry, there was an error adding your post. Please try again.');
            toast.error('Failed to add post.');
            setIsTyping(false);
          }
        }
      );
    } else if (command.type === 'prediction') {
      addPredictionMutation.mutate(
        { teamName: currentTeam, prediction: command.content },
        {
          onSuccess: () => {
            addAssistantMessage(`✓ Prediction added successfully! Your prediction "${command.content}" has been added to the Fan Predictions section.`);
            toast.success('Prediction added to dashboard!');
            
            const predictions = JSON.parse(localStorage.getItem('fanforge_predictions') || '[]');
            predictions.unshift(command.content);
            localStorage.setItem('fanforge_predictions', JSON.stringify(predictions));
            
            setIsTyping(false);
          },
          onError: () => {
            addAssistantMessage('Sorry, there was an error adding your prediction. Please try again.');
            toast.error('Failed to add prediction.');
            setIsTyping(false);
          }
        }
      );
    } else if (command.type === 'news') {
      updateNewsMutation.mutate(
        { teamName: currentTeam, news: command.content },
        {
          onSuccess: () => {
            addAssistantMessage(`✓ News updated successfully! The headline "${command.content}" has been added to the Latest News Feed.`);
            toast.success('News added to dashboard!');
            
            const news = JSON.parse(localStorage.getItem('fanforge_news') || '[]');
            news.unshift(command.content);
            localStorage.setItem('fanforge_news', JSON.stringify(news));
            
            setIsTyping(false);
          },
          onError: () => {
            addAssistantMessage('Sorry, there was an error updating the news. Please try again.');
            toast.error('Failed to update news.');
            setIsTyping(false);
          }
        }
      );
    } else if (command.type === 'fixture') {
      addFixtureMutation.mutate(
        { teamName: currentTeam, fixture: command.content },
        {
          onSuccess: () => {
            addAssistantMessage(`✓ Fixture added successfully! "${command.content}" has been added to the Upcoming Fixtures section.`);
            toast.success('Fixture added to dashboard!');
            
            const fixtures = JSON.parse(localStorage.getItem('fanforge_fixtures') || '[]');
            fixtures.unshift(command.content);
            localStorage.setItem('fanforge_fixtures', JSON.stringify(fixtures));
            
            setIsTyping(false);
          },
          onError: () => {
            addAssistantMessage('Sorry, there was an error adding the fixture. Please try again.');
            toast.error('Failed to add fixture.');
            setIsTyping(false);
          }
        }
      );
    } else {
      addAssistantMessage(`I didn't recognize that command. Try:\n\n• "Add Post about [your message]"\n• "Add Prediction [your prediction]"\n• "Add Fixture [opponent + date]"\n• "Update News with [headline]"\n\nOr visit your dashboard to add content there.`);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBackToLanding = () => {
    navigate({ to: '/' });
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const availableTeams = currentSport ? TEAMS_BY_SPORT[currentSport] || [] : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0E10]">
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
                {currentTeam ? `${currentTeam} Hub Chat` : 'Building your hub...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {showTeamButtons && availableTeams.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] space-y-3">
                  <p className="text-sm text-white/70 font-medium mb-2">Quick select:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTeams.map((team) => (
                      <Button
                        key={team}
                        onClick={() => handleTeamButtonClick(team)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium"
                      >
                        {team}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-white/50 font-medium mt-2">Or type your own team name below</p>
                </div>
              </div>
            )}
            
            {(isTyping || isSwitching) && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="text-sm text-white/70 font-medium">
                      {isSwitching ? 'Switching Hub — Please Wait' : 'Processing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-white/10">
          <div className="flex gap-2">
            <div className="flex-1 flex gap-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  awaitingConfirmation
                    ? 'Type "Yes" or "No"...'
                    : !currentSport 
                    ? "Type a sport (e.g., Football, Basketball)..." 
                    : !currentTeam 
                    ? "Type your team name..." 
                    : "Try: Add Post about..."
                }
                className="flex-1 rounded-2xl px-6 shadow-lg bg-white/5 border-white/20 text-white placeholder:text-white/40 font-medium"
                disabled={isTyping || isSwitching}
              />
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isSwitching}
              size="icon"
              className="rounded-2xl h-10 w-10 shrink-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isTyping || isSwitching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#0E0E10]/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-xs text-white/50 font-medium">
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

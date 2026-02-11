import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut, Share2, Trophy, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface UserProfileProps {
  user: {
    displayName: string;
    avatar: string;
    isGuest: boolean;
  };
  points: number;
  onLogout: () => void;
}

export default function UserProfile({ user, points, onLogout }: UserProfileProps) {
  const navigate = useNavigate();
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleShareHub = async () => {
    setIsGeneratingLink(true);
    
    // Generate unique hub invite link
    const hubId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const inviteLink = `${window.location.origin}?hubInvite=${hubId}`;
    
    // Save hub invite data
    const hubInvites = JSON.parse(localStorage.getItem('fanforge_hub_invites') || '[]');
    hubInvites.push({
      id: hubId,
      owner: user.displayName,
      createdAt: Date.now(),
      teamName: localStorage.getItem('fanforge_team') || 'Unknown',
    });
    localStorage.setItem('fanforge_hub_invites', JSON.stringify(hubInvites));
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Hub invite link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
    
    setIsGeneratingLink(false);
  };

  const handleLogout = () => {
    if (user.isGuest) {
      sessionStorage.clear();
      toast.info('Guest session ended');
    } else {
      localStorage.removeItem('fanforge_user');
      localStorage.removeItem('fanforge_auth_mode');
      toast.info('Logged out successfully');
    }
    onLogout();
    navigate({ to: '/' });
  };

  const handleNavigateToPublishHelp = () => {
    navigate({ to: '/publish-help' });
  };

  const getTierBadge = () => {
    if (points >= 1000) return { name: 'Legend', icon: '👑', color: 'text-yellow-400' };
    if (points >= 500) return { name: 'Captain', icon: '⭐', color: 'text-blue-400' };
    return { name: 'Rookie', icon: '🔰', color: 'text-green-400' };
  };

  const tier = getTierBadge();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-white/40 transition-all"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user.isGuest ? 'Guest Account' : 'Registered Account'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold">{points} pts</span>
              </div>
              <div className={`flex items-center space-x-1 ${tier.color}`}>
                <span className="text-sm">{tier.icon}</span>
                <span className="text-sm font-semibold">{tier.name}</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleShareHub} disabled={isGeneratingLink}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>{isGeneratingLink ? 'Generating...' : 'Share Hub Link'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNavigateToPublishHelp}>
          <Rocket className="mr-2 h-4 w-4" />
          <span>Make This App Live</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

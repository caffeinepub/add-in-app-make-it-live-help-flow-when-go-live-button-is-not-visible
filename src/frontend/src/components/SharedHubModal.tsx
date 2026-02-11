import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, UserPlus, User } from 'lucide-react';
import { toast } from 'sonner';

interface SharedHubModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  teamName: string;
  onContinueAsGuest: () => void;
  onSignIn: () => void;
}

export default function SharedHubModal({
  open,
  onClose,
  userName,
  teamName,
  onContinueAsGuest,
  onSignIn,
}: SharedHubModalProps) {
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Load saved preference
    const savedPreference = localStorage.getItem('fanforge_remember_login');
    if (savedPreference === 'true') {
      setRememberMe(true);
    }
  }, []);

  const handleContinueAsGuest = () => {
    if (rememberMe) {
      localStorage.setItem('fanforge_remember_login', 'true');
      localStorage.setItem('fanforge_preferred_auth', 'guest');
    }
    onContinueAsGuest();
    toast.success('✅ Joined as Guest');
    onClose();
  };

  const handleSignIn = () => {
    if (rememberMe) {
      localStorage.setItem('fanforge_remember_login', 'true');
      localStorage.setItem('fanforge_preferred_auth', 'registered');
    }
    onSignIn();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="bg-[#0E0E10] border-2 border-blue-500/40 text-white max-w-md rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-fade-in w-[90%] sm:w-full"
        aria-describedby="shared-hub-description"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <DialogHeader className="space-y-4">
          <DialogTitle className="text-white font-bold text-2xl text-center pr-8">
            Join FanForge Hub
          </DialogTitle>
          <DialogDescription 
            id="shared-hub-description"
            className="text-white/80 font-medium text-base text-center leading-relaxed"
          >
            You've been invited to join <span className="text-blue-400 font-semibold">{userName}'s</span>{' '}
            <span className="text-purple-400 font-semibold">{teamName}</span> Hub. Continue as a guest or sign in to join the conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <Button
              onClick={handleContinueAsGuest}
              variant="outline"
              className="w-full rounded-xl py-6 bg-white/5 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] font-semibold text-lg transition-all duration-300"
            >
              <User className="mr-2 h-5 w-5" />
              Continue as Guest
            </Button>

            <Button
              onClick={handleSignIn}
              className="w-full rounded-xl py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] font-semibold text-lg transition-all duration-300"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Sign In / Create Account
            </Button>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label
              htmlFor="remember-me"
              className="text-sm text-white/70 cursor-pointer font-medium"
            >
              Remember me next time
            </Label>
          </div>

          <p className="text-xs text-white/50 text-center leading-relaxed">
            Guest access provides temporary session-only access. Sign in to save your activity and interact fully.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

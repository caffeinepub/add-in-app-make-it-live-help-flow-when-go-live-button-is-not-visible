import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuth: (user: { displayName: string; avatar: string; isGuest: boolean }) => void;
}

const AVATAR_OPTIONS = [
  '/assets/generated/avatar-placeholder-transparent.dim_40x40.png',
  '/assets/generated/fanforge-logo-transparent.dim_200x200.png',
  '/assets/generated/trophy-icon-transparent.dim_32x32.png',
];

export default function AuthDialog({ open, onClose, onAuth }: AuthDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleContinueAsGuest = () => {
    const guestUser = {
      displayName: `Guest${Math.floor(Math.random() * 10000)}`,
      avatar: AVATAR_OPTIONS[0],
      isGuest: true,
    };
    
    sessionStorage.setItem('fanforge_user', JSON.stringify(guestUser));
    sessionStorage.setItem('fanforge_auth_mode', 'guest');
    
    onAuth(guestUser);
    toast.success('Continuing as guest');
    onClose();
  };

  const handleRegister = () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    const registeredUser = {
      displayName: displayName.trim(),
      avatar: selectedAvatar,
      isGuest: false,
    };

    localStorage.setItem('fanforge_user', JSON.stringify(registeredUser));
    localStorage.setItem('fanforge_auth_mode', 'registered');
    
    onAuth(registeredUser);
    toast.success(`Welcome, ${displayName}!`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0E0E10] border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-bold text-2xl">
            {isRegistering ? 'Create Account' : 'Welcome to FanForge'}
          </DialogTitle>
          <DialogDescription className="text-white/60 font-medium">
            {isRegistering
              ? 'Set up your profile to save your hubs permanently'
              : 'Continue as guest or create an account'}
          </DialogDescription>
        </DialogHeader>

        {!isRegistering ? (
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleContinueAsGuest}
              variant="outline"
              className="w-full rounded-xl py-6 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-semibold text-lg"
            >
              <User className="mr-2 h-5 w-5" />
              Continue as Guest
            </Button>
            <Button
              onClick={() => setIsRegistering(true)}
              className="w-full rounded-xl py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold text-lg"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Create Account
            </Button>
            <p className="text-xs text-white/50 text-center">
              Guest data is session-only. Create an account to save permanently.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white font-medium">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">Choose Avatar</Label>
              <div className="flex gap-3 justify-center">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`rounded-full p-1 transition-all ${
                      selectedAvatar === avatar
                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0E0E10]'
                        : 'ring-1 ring-white/20 hover:ring-white/40'
                    }`}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                      <AvatarFallback>A{index + 1}</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setIsRegistering(false)}
                variant="outline"
                className="flex-1 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 font-medium"
              >
                Back
              </Button>
              <Button
                onClick={handleRegister}
                disabled={!displayName.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold"
              >
                Create Account
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

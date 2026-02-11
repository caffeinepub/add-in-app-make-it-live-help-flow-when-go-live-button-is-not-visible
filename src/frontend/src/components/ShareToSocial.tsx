import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ShareToSocialProps {
  commentText: string;
  onShare?: (platforms: string[]) => void;
}

export default function ShareToSocial({ commentText, onShare }: ShareToSocialProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    
    if (checked && commentText.trim()) {
      const platforms = ['Instagram', 'X', 'TikTok', 'YouTube'];
      
      // Simulate cross-posting
      toast.success(`Shared to ${platforms.join(', ')}!`);
      
      // Save to social buzz history
      const socialBuzzHistory = JSON.parse(localStorage.getItem('fanforge_social_buzz') || '[]');
      socialBuzzHistory.unshift({
        text: commentText,
        platforms,
        timestamp: Date.now(),
        username: 'Fan' + Math.floor(Math.random() * 1000)
      });
      localStorage.setItem('fanforge_social_buzz', JSON.stringify(socialBuzzHistory.slice(0, 20)));
      
      if (onShare) {
        onShare(platforms);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Switch
        id="share-social"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-blue-500"
      />
      <Label 
        htmlFor="share-social" 
        className="text-xs text-white/70 cursor-pointer font-medium"
      >
        Share to Social
      </Label>
    </div>
  );
}

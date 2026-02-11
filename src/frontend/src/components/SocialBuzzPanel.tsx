import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Instagram, Twitter, Youtube } from 'lucide-react';

export default function SocialBuzzPanel() {
  const socialBuzz = useMemo(() => {
    const history = JSON.parse(localStorage.getItem('fanforge_social_buzz') || '[]');
    return history.slice(0, 10);
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'X':
        return <img src="/assets/generated/x-twitter-icon-transparent.dim_24x24.png" alt="X" className="w-4 h-4" />;
      case 'TikTok':
        return <img src="/assets/generated/tiktok-icon-transparent.dim_24x24.png" alt="TikTok" className="w-4 h-4" />;
      case 'YouTube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur">
      <CardHeader>
        <CardTitle className="font-bold text-white flex items-center gap-2">
          <span className="text-xl">📱</span>
          Social Buzz
        </CardTitle>
        <CardDescription className="text-white/60 font-medium">
          Recent shared comments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {socialBuzz.length > 0 ? (
            <div className="space-y-3 pr-4">
              {socialBuzz.map((item: any, index: number) => (
                <div 
                  key={index}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-md"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs font-semibold text-white/80">@{item.username}</span>
                  </div>
                  <p className="text-sm text-white/90 mb-2 line-clamp-2">{item.text}</p>
                  <div className="flex items-center gap-2">
                    {item.platforms.map((platform: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1">
                        {getPlatformIcon(platform)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/50">
              <span className="text-4xl mb-2">📱</span>
              <p className="text-sm font-medium">No shared comments yet</p>
              <p className="text-xs mt-1">Enable "Share to Social" to see activity</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

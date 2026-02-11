import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useGetNewsTickerHeadlines, useRefreshNewsTicker } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';

export default function NewsTickerBar() {
  const { data: headlines = [], isLoading } = useGetNewsTickerHeadlines();
  const refreshMutation = useRefreshNewsTicker();
  const [isPaused, setIsPaused] = useState(false);

  // Get team from localStorage to determine gradient color
  const savedTeam = localStorage.getItem('fanforge_team');
  const hasTeam = !!savedTeam;

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Duplicate headlines for seamless infinite scroll
  const displayHeadlines = headlines.length > 0 ? [...headlines, ...headlines] : [];

  if (isLoading || displayHeadlines.length === 0) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 overflow-hidden ${
        hasTeam 
          ? 'bg-gradient-to-r from-[#EF0107] to-[#9E1B32]' 
          : 'bg-gradient-to-r from-blue-600 to-blue-800'
      }`}
      style={{
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="relative flex items-center h-12 md:h-14">
        {/* Scrolling Headlines Container */}
        <div 
          className="flex-1 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={`flex whitespace-nowrap ticker-scroll ${isPaused ? '[animation-play-state:paused]' : ''}`}
          >
            {displayHeadlines.map((headline, index) => (
              <span
                key={`${headline}-${index}`}
                className="inline-block px-8 md:px-12 text-white font-bold uppercase text-xs md:text-sm lg:text-base tracking-wide"
                style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                }}
              >
                {headline}
              </span>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="absolute right-2 md:right-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            className="h-8 w-8 p-0 hover:bg-white/20 text-white"
            aria-label="Refresh news ticker"
            title="Refresh News"
          >
            <RefreshCw 
              className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} 
            />
          </Button>
        </div>
      </div>
    </div>
  );
}

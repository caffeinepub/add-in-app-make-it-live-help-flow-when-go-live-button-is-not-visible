import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useRatePlayer, useGetPlayerRating } from '@/hooks/useQueries';

interface PlayerRatingProps {
  teamName: string;
  playerId: number;
  playerName: string;
  teamColor: string;
}

export default function PlayerRating({ teamName, playerId, playerName, teamColor }: PlayerRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  
  const { data: ratingData, refetch } = useGetPlayerRating(teamName, playerId);
  const ratePlayerMutation = useRatePlayer();

  // Load user's rating from local storage on mount
  useEffect(() => {
    const storageKey = `fanforge_rating_${teamName}_${playerId}`;
    const storedRating = localStorage.getItem(storageKey);
    if (storedRating) {
      setUserRating(parseInt(storedRating, 10));
    }
  }, [teamName, playerId]);

  const handleStarClick = async (rating: number) => {
    setUserRating(rating);
    
    // Save to local storage
    const storageKey = `fanforge_rating_${teamName}_${playerId}`;
    localStorage.setItem(storageKey, rating.toString());

    // Submit to backend
    ratePlayerMutation.mutate(
      { teamName, playerId: BigInt(playerId), rating: BigInt(rating) },
      {
        onSuccess: () => {
          toast.success(`Thanks! Your rating for ${playerName} has been saved.`);
          refetch();
        },
        onError: () => {
          toast.error('Failed to save rating. Please try again.');
        }
      }
    );
  };

  const displayRating = hoveredStar !== null ? hoveredStar : userRating;
  const average = ratingData?.average || 0;
  const count = Number(ratingData?.count || 0n);

  return (
    <div className="mt-2 space-y-1">
      {/* Star Rating Bar */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = displayRating !== null && star <= displayRating;
                return (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0E0E10] rounded"
                    aria-label={`Rate ${playerName} ${star} out of 5 stars`}
                  >
                    <Star
                      className="w-5 h-5 transition-colors duration-150"
                      fill={isFilled ? '#FFD700' : '#444444'}
                      stroke={isFilled ? '#FFD700' : '#666666'}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="bg-[#1a1a1a] border-white/20 text-white font-medium"
          >
            <p>Rate this player's performance</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Average Rating Display */}
      {count > 0 && (
        <div className="text-center">
          <p className="text-xs text-white/70 font-medium">
            ⭐ {average.toFixed(1)} / 5 from {count} {count === 1 ? 'rating' : 'ratings'}
          </p>
        </div>
      )}
    </div>
  );
}

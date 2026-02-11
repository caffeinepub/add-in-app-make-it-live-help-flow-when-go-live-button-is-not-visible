import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Player {
  id: number;
  name: string;
  image: string;
  rating: number;
  position: string;
}

interface TeamOfTheWeekBuilderProps {
  teamName: string;
  teamColor: string;
  players: Player[];
}

export default function TeamOfTheWeekBuilder({ teamName, teamColor, players }: TeamOfTheWeekBuilderProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < 11) {
      setSelectedPlayers([...selectedPlayers, player]);
    } else {
      toast.error('Maximum 11 players allowed');
    }
  };

  const handleGenerateTeam = () => {
    if (selectedPlayers.length !== 11) {
      toast.error('Please select exactly 11 players');
      return;
    }

    // Simulate image generation
    toast.success('FanForge XI of the Week generated! Image ready to share.');
    
    // Save to localStorage
    localStorage.setItem(`fanforge_team_of_week_${teamName}`, JSON.stringify(selectedPlayers));
  };

  const handleReset = () => {
    setSelectedPlayers([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium gap-2"
          style={{ borderColor: teamColor }}
        >
          <Users className="w-4 h-4" />
          Build Your Team of the Week
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0E0E10] border-white/20 text-white max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-white font-bold flex items-center gap-2">
            <Users className="h-6 w-6" style={{ color: teamColor }} />
            FanForge XI of the Week
          </DialogTitle>
          <DialogDescription className="text-white/60 font-medium">
            Select 11 players to build your dream team ({selectedPlayers.length}/11 selected)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Selection */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">Available Players</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {players.map((player) => {
                  const isSelected = selectedPlayers.find(p => p.id === player.id);
                  return (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      className={`w-full p-3 rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-white/20 border-white/40' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={player.image}
                          alt={player.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/generated/generic-team-logo-transparent.dim_120x120.png';
                          }}
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white">{player.name}</p>
                          <p className="text-xs text-white/60">{player.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold" style={{ color: teamColor }}>
                            ⭐ {player.rating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Formation Preview */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">Your Formation</h3>
            <div 
              className="relative h-[400px] rounded-xl border-2 border-white/20 overflow-hidden"
              style={{ 
                backgroundImage: 'url(/assets/generated/formation-field.dim_400x300.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-green-900/40 to-green-800/40">
                <div className="h-full flex flex-col justify-around p-4">
                  {selectedPlayers.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPlayers.map((player, index) => (
                        <div 
                          key={player.id}
                          className="flex items-center gap-2 bg-black/60 backdrop-blur rounded-lg p-2"
                        >
                          <img 
                            src={player.image}
                            alt={player.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-xs text-white font-medium">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-white/50 text-sm">Select players to see formation</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-xl border-white/20 hover:bg-white/10"
          >
            Reset
          </Button>
          <Button
            onClick={handleGenerateTeam}
            disabled={selectedPlayers.length !== 11}
            className="rounded-xl font-semibold gap-2"
            style={{ backgroundColor: teamColor }}
          >
            <Download className="w-4 h-4" />
            Generate & Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

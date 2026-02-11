import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import PlayerRating from './PlayerRating';

interface TeamVisualTemplateProps {
  teamName: string;
  sportName: string;
  teamColor: string;
}

interface PlayerData {
  name: string;
  image: string;
}

interface TeamData {
  logo: string;
  players: PlayerData[];
}

// Team data mapping with logos and key players
const TEAM_DATA: Record<string, TeamData> = {
  'Arsenal': {
    logo: '/assets/generated/arsenal-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Bukayo Saka', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Martin Ødegaard', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Gabriel Jesus', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'William Saliba', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Chelsea': {
    logo: '/assets/generated/chelsea-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Cole Palmer', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Enzo Fernández', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Nicolas Jackson', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Moisés Caicedo', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Manchester United': {
    logo: '/assets/generated/manchester-united-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Bruno Fernandes', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Marcus Rashford', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Casemiro', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Lisandro Martínez', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Barcelona F.C.': {
    logo: '/assets/generated/barcelona-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Robert Lewandowski', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Pedri', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Gavi', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Frenkie de Jong', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Real Madrid': {
    logo: '/assets/generated/real-madrid-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Vinícius Júnior', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Jude Bellingham', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Luka Modrić', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Federico Valverde', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Los Angeles Lakers': {
    logo: '/assets/generated/lakers-logo-transparent.dim_120x120.png',
    players: [
      { name: 'LeBron James', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Anthony Davis', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: "D'Angelo Russell", image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Austin Reaves', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Golden State Warriors': {
    logo: '/assets/generated/warriors-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Stephen Curry', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Klay Thompson', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Draymond Green', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Andrew Wiggins', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Chicago Bulls': {
    logo: '/assets/generated/bulls-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Zach LaVine', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'DeMar DeRozan', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Nikola Vučević', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Coby White', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Mercedes AMG F1': {
    logo: '/assets/generated/mercedes-f1-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Lewis Hamilton', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'George Russell', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Toto Wolff', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Red Bull Racing': {
    logo: '/assets/generated/red-bull-racing-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Max Verstappen', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Sergio Pérez', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Christian Horner', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Ferrari': {
    logo: '/assets/generated/ferrari-f1-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Charles Leclerc', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Carlos Sainz', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Fred Vasseur', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'India': {
    logo: '/assets/generated/india-cricket-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Rohit Sharma', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Virat Kohli', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Hardik Pandya', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Jasprit Bumrah', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'England': {
    logo: '/assets/generated/england-cricket-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Ben Stokes', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Joe Root', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Jos Buttler', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'James Anderson', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
  'Australia': {
    logo: '/assets/generated/australia-cricket-logo-transparent.dim_120x120.png',
    players: [
      { name: 'Steve Smith', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Pat Cummins', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'David Warner', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
      { name: 'Mitchell Starc', image: '/assets/generated/generic-team-logo-transparent.dim_120x120.png' },
    ]
  },
};

export default function TeamVisualTemplate({ teamName, sportName, teamColor }: TeamVisualTemplateProps) {
  const teamData = useMemo(() => {
    return TEAM_DATA[teamName] || {
      logo: '/assets/generated/generic-team-logo-transparent.dim_120x120.png',
      players: []
    };
  }, [teamName]);

  return (
    <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur mb-6">
      <CardContent className="p-6">
        {/* Team Header */}
        <div className="flex items-center gap-6 mb-8">
          <div 
            className="w-32 h-32 rounded-2xl flex items-center justify-center p-4 border-2 shadow-xl"
            style={{ 
              borderColor: teamColor,
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <img 
              src={teamData.logo}
              alt={`Logo of ${teamName}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/generated/generic-team-logo-transparent.dim_120x120.png';
              }}
            />
          </div>
          <div className="flex-1">
            <h2 
              className="text-3xl font-bold mb-2"
              style={{ color: teamColor }}
            >
              {teamName}
            </h2>
            <p className="text-white/60 font-medium text-lg">{sportName}</p>
          </div>
        </div>

        {/* Players Showcase */}
        {teamData.players.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Key Players</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {teamData.players.map((player, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center group"
                >
                  <div 
                    className="w-[120px] h-[120px] rounded-xl overflow-hidden border-2 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl bg-white/5 flex items-center justify-center"
                    style={{ borderColor: teamColor }}
                  >
                    <img 
                      src={player.image}
                      alt={`Headshot of ${player.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Replace with generic silhouette
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-icon flex items-center justify-center w-full h-full';
                          fallback.innerHTML = `<svg class="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6 0-8 3-8 5v1h16v-1c0-2-2-5-8-5z"/></svg>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium text-white mt-2 text-center">
                    {player.name}
                  </p>
                  
                  {/* Player Rating Component */}
                  <PlayerRating
                    teamName={teamName}
                    playerId={index}
                    playerName={player.name}
                    teamColor={teamColor}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback for teams without player data */}
        {teamData.players.length === 0 && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50 font-medium">Player roster coming soon</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

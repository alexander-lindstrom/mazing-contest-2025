import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface Player {
  name: string;
  isHost: boolean;
}

interface PlayersListProps {
  players: Player[];
}

const PlayersList: React.FC<PlayersListProps> = ({ players }) => {
  return (
    <Card className="w-full bg-slate-700 p-3 rounded-lg shadow-lg">
      <CardHeader>
        <h2 className="text-left text-white font-mono font-bold text-lg">
          Players
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1.5">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-600 rounded-lg p-1.5"
            >
              <div className="flex-1 font-mono font-bold text-white truncate">
                {player.name}
              </div>
              {player.isHost && (
                <div className="w-20 font-mono font-bold text-slate-400 text-right">
                  (Host)
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayersList;
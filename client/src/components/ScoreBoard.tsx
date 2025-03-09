import React from 'react';
import { Card } from "@/components/ui/card";

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
}

interface ScoreboardProps {
  players: PlayerScore[];
  round: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, round }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card className="w-full bg-slate-800 p-3 rounded-lg shadow-lg">
      <div className="text-center text-white font-mono font-bold text-lg mb-4">
        Round {round}
      </div>

      <div className="flex flex-col space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-slate-700 rounded-lg p-2"
          >
            <div className="w-10 font-mono font-bold text-white text-center">
              #{index + 1}
            </div>

            <div className="flex-1 mx-4 font-mono font-bold text-white truncate">
              {player.name}
            </div>

            <div className="w-20 font-mono font-bold text-white text-right">
              {player.score.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Scoreboard;
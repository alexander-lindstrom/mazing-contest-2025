import React from 'react';
import { Card } from "@/components/ui/card";

export interface Player {
  id: string;
  name: string;
}

interface PlayerSelectorProps {
  players: Player[];
  isAnimationPhase: boolean;
  onSelectPlayer: (playerId: string) => void;
  selectedPlayerId: string;
  currentUserId: string;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({ 
  players, 
  isAnimationPhase, 
  onSelectPlayer, 
  selectedPlayerId,
  currentUserId
}) => {

  const effectiveSelectedId = selectedPlayerId || (isAnimationPhase ? currentUserId : undefined);

  return (
    <Card className="w-full bg-slate-800 p-3 rounded-lg shadow-lg">
      <div className="text-left text-white font-mono font-bold text-lg mb-4">
        {isAnimationPhase ? "Choose Player to Watch" : "Players in Game"}
        {!isAnimationPhase && (
          <div className="text-xs text-slate-400 mt-1">
            Selection available during animation phase
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            onClick={() => isAnimationPhase && onSelectPlayer(player.id)}
            className={`
              flex items-center justify-between rounded-lg p-2
              ${effectiveSelectedId === player.id ? 'bg-slate-600 border border-slate-400' : 'bg-slate-700'}
              ${isAnimationPhase ? 'cursor-pointer hover:bg-slate-600' : 'opacity-80'}
              transition-all duration-200
            `}
          >
            <div className="flex-1 mx-2 font-mono text-white truncate">
              {player.name}
              {player.id === currentUserId && (
                <span className="text-xs text-slate-400 ml-2">(You)</span>
              )}
            </div>

            {effectiveSelectedId === player.id && (
              <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PlayerSelector;
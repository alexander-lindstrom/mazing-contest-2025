import React from 'react';
import { Card } from '@/components/ui/card';
import { RoundResult } from '@mazing/util';

interface ResultDisplayProps {
  score: RoundResult[] | null;
  totalRounds: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  score,
  totalRounds
}) => {
  const roundNumber = score && score.length > 0 ? score[0].round + 1: 1;
  if (!score || score.length === 0) {
    return (
      <div className="w-full">
        <Card className="border-[3px] border-black p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Score</h2>
            <div className="text-sm font-medium">
              Round: {roundNumber} / {totalRounds}
            </div>
          </div>
          <div className="py-4 text-center">No results available yet</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="border-[3px] border-black p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Score</h2>
          <div className="text-sm font-medium">
            Round: {roundNumber} / {totalRounds}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 font-bold mb-2 text-blue-600 px-2">
          <div>Player</div>
          <div>Round Time</div>
          <div>Total Time</div>
        </div>
        
        {score.map((playerResult, index) => (
          <div 
            key={index} 
            className="grid grid-cols-3 gap-2 py-3 px-2 border-t border-gray-200"
          >
            <div className="font-medium">{playerResult.player.name}</div>
            <div>{playerResult.duration.toFixed(2)}s</div>
            <div>{playerResult.cumulativeDuration.toFixed(2)}s</div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default ResultDisplay;
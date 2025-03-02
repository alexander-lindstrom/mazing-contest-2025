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
        <Card className="bg-yellow-300 border-4 border-black p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Score</h2>
            <div className="text-2xl font-black uppercase tracking-tight">
              Round: {roundNumber} / {totalRounds}
            </div>
          </div>
          <div className="py-8 text-center bg-white border-4 border-black rounded-lg font-bold text-lg">
            No results available yet
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="bg-yellow-300 border-4 border-black p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight">Score</h2>
          <div className="text-2xl font-black uppercase tracking-tight">
            Round: {roundNumber} / {totalRounds}
          </div>
        </div>
        
        <div className="bg-white border-4 border-black rounded-lg p-4">
          <div className="grid grid-cols-3 gap-2 font-black mb-2 text-blue-600 px-2 py-2 bg-cyan-200 border-2 border-black rounded-md">
            <div>PLAYER</div>
            <div>ROUND</div>
            <div>TOTAL</div>
          </div>
          
          {score.map((playerResult, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-3 gap-2 py-3 px-2 border-t-2 border-black ${index % 2 === 0 ? 'bg-purple-100' : 'bg-green-100'}`}
            >
              <div className="font-bold">{playerResult.player.name}</div>
              <div className="font-mono font-bold">{playerResult.duration.toFixed(2)}s</div>
              <div className="font-mono font-bold">{playerResult.cumulativeDuration.toFixed(2)}s</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ResultDisplay;
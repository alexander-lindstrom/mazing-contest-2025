import React from 'react';
import { Card } from '@/components/ui/card';
import { FinalResults } from '@mazing/util';

interface FinalResultsDisplayProps {
  finalResults: FinalResults;
  totalRounds: number;
}

const FinalResultsDisplay: React.FC<FinalResultsDisplayProps> = ({
  finalResults,
  totalRounds
}) => {

  return (
    <div className="w-full">
      <Card className="bg-yellow-300 border-4 border-black p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight">Final Results</h2>
        </div>
        
        <div className="bg-white border-4 border-black rounded-lg p-4">
          <div className={`grid grid-cols-${totalRounds + 2} gap-2 font-black mb-2 text-blue-600 px-2 py-2 bg-cyan-200 border-2 border-black rounded-md`}>
            <div className="text-left">PLAYER</div>
            {Array.from({ length: totalRounds }, (_, i) => (
              <div key={i} className="text-right">ROUND{i + 1}</div>
            ))}
            <div className="text-right">TOTAL</div>
          </div>
          
          {finalResults.players.map((playerResult, index) => {
            const totalDuration = playerResult.durations.reduce((sum, duration) => sum + duration, 0);

            return (
              <div 
                key={index} 
                className={`grid grid-cols-${totalRounds + 2} gap-2 py-3 px-2 border-t-2 border-black ${index % 2 === 0 ? 'bg-purple-100' : 'bg-green-100'}`}
              >
                <div className="text-left font-bold">{playerResult.player.name}</div>
                {playerResult.durations.map((duration, roundIndex) => (
                  <div key={roundIndex} className="text-right font-mono font-bold">
                    {duration.toFixed(2)}s
                  </div>
                ))}
                <div className="text-right font-mono font-bold">{totalDuration.toFixed(2)}s</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default FinalResultsDisplay;
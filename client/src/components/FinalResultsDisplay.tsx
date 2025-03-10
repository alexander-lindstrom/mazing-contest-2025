import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FinalResults } from '@mazing/util';

interface FinalResultsDisplayProps {
  finalResults: FinalResults;
  totalRounds: number;
}

const FinalResultsDisplay: React.FC<FinalResultsDisplayProps> = ({
  finalResults,
  totalRounds,
}) => {
  const sortedPlayers = [...finalResults.players].sort((a, b) => {
    const totalDurationA = a.durations.reduce((sum, duration) => sum + duration, 0);
    const totalDurationB = b.durations.reduce((sum, duration) => sum + duration, 0);
    return totalDurationB - totalDurationA;
  });

  return (
    <div className="w-full overflow-x-auto"> {/* Allow horizontal scrolling if needed */}
      <Card className="bg-slate-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Final Results</h2>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Placement</TableHead>
                <TableHead className="text-white">Player</TableHead>
                {Array.from({ length: totalRounds }, (_, i) => (
                  <TableHead key={i} className="text-right text-white">
                    Round {i + 1}
                  </TableHead>
                ))}
                <TableHead className="text-right text-white">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((playerResult, index) => {
                const totalDuration = playerResult.durations.reduce((sum, duration) => sum + duration, 0);

                return (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-slate-600' : 'bg-slate-700'}>
                    <TableCell className="font-bold text-white">#{index + 1}</TableCell>
                    <TableCell className="font-bold text-white">{playerResult.player.name}</TableCell>
                    {playerResult.durations.map((duration, roundIndex) => (
                      <TableCell key={roundIndex} className="text-right font-mono font-bold text-white">
                        {duration.toFixed(2)}s
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-mono font-bold text-white">
                      {totalDuration.toFixed(2)}s
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default FinalResultsDisplay;
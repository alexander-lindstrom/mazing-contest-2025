import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FinalResults } from '@mazing/util';

interface RoundResultsDialogProps {
  roundResults: FinalResults;
  totalRounds: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoCloseDelay?: number;
}

const RoundResultsDialog: React.FC<RoundResultsDialogProps> = ({
  roundResults,
  totalRounds,
  open,
  onOpenChange,
  autoCloseDelay = 5000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 100 / (autoCloseDelay / 100)));
    }, 100);

    const timeout = setTimeout(() => {
      onOpenChange(false);
      setProgress(100);
    }, autoCloseDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [open, autoCloseDelay, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Round Results</DialogTitle>
        </DialogHeader>

        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          />
        </div>


        <Card className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <div className="bg-slate-700 rounded-lg p-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Player</TableHead>
                  <TableHead className="text-right text-white">Round {totalRounds}</TableHead>
                  <TableHead className="text-right text-white">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roundResults.players.map((playerResult, index) => {
                  const totalDuration = playerResult.durations.reduce((sum, duration) => sum + duration, 0);
                  const roundDuration = playerResult.durations[totalRounds - 1];

                  return (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-slate-600' : 'bg-slate-700'}>
                      <TableCell className="font-bold text-white">{playerResult.player.name}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-white">
                        {roundDuration.toFixed(2)}s
                      </TableCell>
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
      </DialogContent>
    </Dialog>
  );
};

export default RoundResultsDialog;
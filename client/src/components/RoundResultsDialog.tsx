import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PlayerScore {
  id: string;
  name: string;
  score: number;
}

interface RoundResultsDialogProps {
  players: PlayerScore[];
  round: number; // zero indexed
  numRounds: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoCloseDelay?: number;
}

const RoundResultsDialog: React.FC<RoundResultsDialogProps> = ({
  players,
  round,
  open,
  onOpenChange,
  autoCloseDelay = 5000,
}) => {
  const [progress, setProgress] = useState(100);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

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
          <DialogTitle>Round {round} results</DialogTitle>
          <DialogDescription>
          </DialogDescription>
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
                  <TableHead className="text-white">Placement</TableHead>
                  <TableHead className="text-white">Player</TableHead>
                  <TableHead className="text-right text-white">Round {round}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => (
                  <TableRow
                    key={player.id}
                    className={index % 2 === 0 ? 'bg-slate-600' : 'bg-slate-700'}
                  >
                    <TableCell className="font-bold text-white">#{index + 1}</TableCell>
                    <TableCell className="font-bold text-white">{player.name}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-white">
                      {player.score.toFixed(2)}s
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default RoundResultsDialog;
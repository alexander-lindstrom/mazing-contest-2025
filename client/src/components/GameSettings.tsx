import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Import shadcn Tooltip
import { GameSettingsData } from '@mazing/util';

interface GameSettingsProps {
  onSettingsChange: (settings: GameSettingsData) => void;
  settings: GameSettingsData;
  isHost: boolean;
}

const GameSettings: React.FC<GameSettingsProps> = ({ 
  onSettingsChange, 
  settings,
  isHost 
}) => {
  const { rounds, duration, roundTransitionDelay } = settings;

  const handleRoundsChange = (value: string): void => {
    const newRounds = parseInt(value);
    onSettingsChange({ rounds: newRounds, duration, roundTransitionDelay });
  };

  const handleDurationChange = (value: string): void => {
    const newDuration = parseInt(value);
    onSettingsChange({ rounds, duration: newDuration, roundTransitionDelay });
  };

  const handleRoundTransitionDelayChange = (value: string): void => {
    const newDelay = parseInt(value);
    onSettingsChange({ rounds, duration, roundTransitionDelay: newDelay });
  };

  return (
    <Card className="w-full bg-slate-700 p-3 rounded-lg shadow-lg">
      <CardContent>
        <div className="space-y-4">

          <div className="flex flex-col space-y-2">
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <label className="font-mono font-bold text-white cursor-help">
                  Rounds
                </label>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                <p>Number of rounds in the game</p>
              </TooltipContent>
            </Tooltip>
            {isHost ? (
              <Select value={rounds.toString()} onValueChange={handleRoundsChange}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white font-mono font-bold">
                  <SelectValue placeholder="Select rounds" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white font-mono">
                  {[1, 2, 3, 4, 5, 7, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="hover:bg-slate-600">
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-slate-700 border-slate-600 rounded-lg p-2 font-mono font-bold text-white border">
                {rounds}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <label className="font-mono font-bold text-white cursor-help">
                  Duration
                </label>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                <p>Duration of each round in seconds</p>
              </TooltipContent>
            </Tooltip>
            {isHost ? (
              <Select value={duration.toString()} onValueChange={handleDurationChange}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white font-mono font-bold">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white font-mono">
                  {[30, 45, 60, 90, 120].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="hover:bg-slate-600">
                      {num} sec
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-slate-700 border-slate-600 rounded-lg p-2 font-mono font-bold text-white border">
                {duration} sec
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <label className="font-mono font-bold text-white cursor-help">
                  Transition
                </label>
              </TooltipTrigger>
              <TooltipContent side = "right" className="bg-slate-800 text-white border-slate-700">
                <p>Delay between rounds in seconds</p>
              </TooltipContent>
            </Tooltip>
            {isHost ? (
              <Select value={roundTransitionDelay.toString()} onValueChange={handleRoundTransitionDelayChange}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white font-mono font-bold">
                  <SelectValue placeholder="Select delay" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white font-mono">
                  {[0, 3, 5, 10, 15].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="hover:bg-slate-600">
                      {num} sec
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-slate-700 border-slate-600 rounded-lg p-2 font-mono font-bold text-white border">
                {roundTransitionDelay} sec
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameSettings;
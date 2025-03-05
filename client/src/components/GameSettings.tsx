import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader,  CardContent } from "@/components/ui/card";

interface GameSettingsProps {
  onSettingsChange: (settings: GameSettingsData) => void;
  rounds: number;
  duration: number;
  isHost: boolean;
}

interface GameSettingsData {
  rounds: number;
  duration: number;
}

const GameSettings: React.FC<GameSettingsProps> = ({ 
  onSettingsChange, 
  rounds,
  duration,
  isHost 
}) => {
  const handleRoundsChange = (value: string): void => {
    const newRounds = parseInt(value);
    onSettingsChange({ rounds: newRounds, duration });
  };

  const handleDurationChange = (value: string): void => {
    const newDuration = parseInt(value);
    onSettingsChange({ rounds, duration: newDuration });
  };

  return (
    <Card className="bg-yellow-300 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform h-full">
      <CardHeader className="pb-2">
       
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="font-bold text-black">ROUNDS</label>
            {isHost ? (
              <Select value={rounds.toString()} onValueChange={handleRoundsChange}>
                <SelectTrigger className="bg-white border-2 border-black rounded font-medium">
                  <SelectValue placeholder="Select rounds" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black">
                  {[3, 5, 7, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-white border-2 border-black rounded py-2 px-3 font-medium">
                {rounds}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-bold text-black">BUILD TIME</label>
            {isHost ? (
              <Select value={duration.toString()} onValueChange={handleDurationChange}>
                <SelectTrigger className="bg-white border-2 border-black rounded font-medium">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black">
                  {[30, 45, 60, 90, 120].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-white border-2 border-black rounded py-2 px-3 font-medium">
                {duration}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameSettings;
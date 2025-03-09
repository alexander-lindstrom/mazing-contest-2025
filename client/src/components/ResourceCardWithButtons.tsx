import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock, Coins, Trees } from "lucide-react";
import SoundButton from './SoundButton';

interface ResourceCardWithButtonProps {
  resources: { gold: number; lumber: number };
  isRunning: boolean;
  stopwatch: number;
  countdown: number;
  handleStartButton: (() => void) | null;
  handleReset: (() => void) | null;
  handleGenerateNew: (() => void) | null;
  handleShare: (() => void) | null;
  copied: boolean; // Added copied prop for the Share button state
}

const ResourceCardWithButton: React.FC<ResourceCardWithButtonProps> = ({
  resources,
  isRunning,
  stopwatch,
  countdown,
  handleStartButton,
  handleReset,
  handleGenerateNew,
  handleShare,
  copied,
}) => {
  const timeValue = isRunning ? stopwatch.toFixed(1) : countdown;

  return (
    <Card className="w-full bg-slate-800 p-3 rounded-lg shadow-lg">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-3">

          <div className="flex items-center bg-slate-700 rounded-lg p-2 w-24">
            <Clock className="text-blue-400 mr-2" size={18} />
            <div className="font-mono font-bold text-white whitespace-nowrap">
              {timeValue}
            </div>
          </div>

          <div className="flex items-center bg-slate-700 rounded-lg p-2 w-24">
            <Coins className="text-yellow-400 mr-2" size={18} />
            <div className="font-mono font-bold text-white whitespace-nowrap">
              {resources.gold}
            </div>
          </div>

          <div className="flex items-center bg-slate-700 rounded-lg p-2 w-24">
            <Trees className="text-green-400 mr-2" size={18} />
            <div className="font-mono font-bold text-white whitespace-nowrap">
              {resources.lumber}
            </div>
          </div>
        </div>

        {handleStartButton && handleReset && handleGenerateNew && handleShare && (
          <div className="flex flex-row items-center space-x-2">
            <SoundButton
              className="bg-blue-400 text-black hover:bg-blue-500 font-bold py-2 px-5 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all"
              onClick={handleStartButton}
            >
              Start
            </SoundButton>
            <SoundButton
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-2 px-5 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all"
              onClick={handleReset}
            >
              Reset
            </SoundButton>
            <SoundButton
              className="bg-red-400 text-black hover:bg-red-500 font-bold py-2 px-5 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all"
              onClick={handleGenerateNew}
            >
              New
            </SoundButton>
            <SoundButton
              className="bg-green-400 text-black hover:bg-green-500 font-bold py-2 px-5 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all"
              onClick={handleShare}
            >
              {copied ? "Copied!" : "Share"}
            </SoundButton>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResourceCardWithButton;
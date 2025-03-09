import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock, Coins, Trees } from "lucide-react";

interface ResourceCardProps {
  resources: { gold: number; lumber: number };
  isRunning: boolean;
  stopwatch: number;
  countdown: number;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resources, isRunning, stopwatch, countdown }) => {
  const timeValue = isRunning ? stopwatch.toFixed(1) : countdown;
  
  return (
    <Card className="w-full bg-slate-800 p-3 rounded-lg shadow-lg">
      <div className="flex flex-row items-center space-x-3">

        <div className="flex items-center bg-slate-700 rounded-lg p-2">
          <Clock className="text-blue-400 mr-2" size={18} />
          <div className="font-mono font-bold text-white whitespace-nowrap">
            {timeValue}
          </div>
        </div>

        <div className="flex items-center bg-slate-700 rounded-lg p-2">
          <Coins className="text-yellow-400 mr-2" size={18} />
          <div className="font-mono font-bold text-white whitespace-nowrap">
            {resources.gold}
          </div>
        </div>
        
        <div className="flex items-center bg-slate-700 rounded-lg p-2">
          <Trees className="text-green-400 mr-2" size={18} />
          <div className="font-mono font-bold text-white whitespace-nowrap">
            {resources.lumber}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResourceCard;
import { Card } from "@/components/ui/card";

interface ResourceCardProps {
  resources: { gold: number; lumber: number };
  isRunning: boolean;
  stopwatch: number;
  countdown: number;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resources, isRunning, stopwatch, countdown }) => {
  return (
    <div className="w-full">
      <Card className="bg-yellow-300 border-4 border-black p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform">
        <div className="text-2xl font-black uppercase tracking-tight text-center mb-4">
          Resources
        </div>
        
        <div className="bg-white border-4 border-black rounded-lg p-4">

          <div className="grid grid-cols-2 gap-2 py-3 px-2 border-t-2 border-black bg-green-100 text-center">
            <div className="font-bold">Time:</div>
            <div className="font-mono font-bold">{isRunning ? stopwatch : countdown}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-3 px-2 border-t-2 border-black bg-purple-100 text-center">
            <div className="font-bold">Gold:</div>
            <div className="font-mono font-bold">{resources.gold}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-3 px-2 border-t-2 border-black bg-green-100 text-center">
            <div className="font-bold">Wood:</div>
            <div className="font-mono font-bold">{resources.lumber}</div>
          </div>
          
        </div>
      </Card>
    </div>
  );
};

export default ResourceCard;

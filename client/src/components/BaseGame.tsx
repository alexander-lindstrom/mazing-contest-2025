import { Button } from "@/components/ui/button";
import GridRenderer from "./GridRenderer";
import { ClapEvent, GridCell, Position, Tower } from "@mazing/util";
import { KonvaEventObject } from "konva/lib/Node";
import ResourceCard from "./ResourceCard";

interface BaseGameProps {
  startingState: { width: number; height: number };
  towers: Tower[];
  grid: GridCell[][];
  handleCellClick: (x: number, y: number, e: KonvaEventObject<MouseEvent>) => void;
  runnerPath: Position[];
  isRunning: boolean;
  clapEvents: ClapEvent[];
  resources: { gold: number; lumber: number };
  stopwatch: number;
  countdown: number;
  handleStartButton: (() => void) | null;
  handleReset: (() => void) | null;
}

const BaseGame: React.FC<BaseGameProps> = ({
  startingState,
  towers,
  grid,
  handleCellClick,
  runnerPath,
  isRunning,
  clapEvents,
  resources,
  stopwatch,
  countdown,
  handleStartButton,
  handleReset,
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-6xl">
      <div className="flex w-full space-x-6">
        <div className="flex flex-col items-center min-w-[300px] max-w-[350px]">
          <ResourceCard resources={resources} isRunning={isRunning} stopwatch={stopwatch} countdown={countdown} />
        </div>
  
        {/* Grid Container */}
        <div className="flex-grow">
          <div className="rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <GridRenderer
              width={startingState.width}
              height={startingState.height}
              towers={towers}
              grid={grid}
              handleClick={handleCellClick}
              runnerPath={runnerPath}
              showRunner={isRunning}
              clapEvents={clapEvents}
            />
          </div>
        </div>
  
        {handleStartButton && handleReset && (
          <div className="flex flex-col space-y-6 w-80">
            <div className="flex space-x-4">
              <Button
                className="bg-blue-400 text-black hover:bg-blue-500 font-bold py-6 px-12 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-2xl"
                onClick={handleStartButton}
              >
                Start
              </Button>
              <Button
                className="bg-green-400 text-black hover:bg-green-500 font-bold py-6 px-12 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-2xl"
                onClick={handleReset}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );      
};

export default BaseGame;

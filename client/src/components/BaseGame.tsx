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
      <h1 className="text-3xl font-bold text-center mb-4">
        Mazing Contest!
      </h1>
  
      <div className="flex w-full space-x-6">
        <div className="flex flex-col items-center min-w-[300px] max-w-[350px]">
          <ResourceCard resources={resources} isRunning={isRunning} stopwatch={stopwatch} countdown={countdown} />
        </div>
  
        <div className="flex-grow">
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
  
        {handleStartButton && handleReset && (
          <div className="flex flex-col space-y-6 w-80">
            <div className="flex space-x-4">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white border-[3px] border-black px-4 py-2"
                onClick={handleStartButton}
              >
                Start
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white border-[3px] border-black px-4 py-2"
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

import GridRenderer from "./GridRenderer";
import { ClapEvent, GridCell, Position, Tower } from "@mazing/util";
import { KonvaEventObject } from "konva/lib/Node";
import ResourceCard from "./ResourceCard";
import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import SoundButton from "./SoundButton";

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
  const [ref, bounds] = useMeasure();
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

  const aspectRatio = startingState.width / startingState.height;

  useEffect(() => {
    const maxWidth = bounds.width;
    const maxHeight = bounds.height;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    const minWidth = 800;
    const minHeight = minWidth / aspectRatio;

    if (width < minWidth) {
      width = minWidth;
      height = minHeight;
    }

    setGridDimensions({ width, height });
  }, [bounds.width, bounds.height, aspectRatio]);

  return (
    <div className="flex flex-col items-center w-full max-w-6xl">
      <div className="flex w-full space-x-6">
        <div className="flex flex-col items-center min-w-[200px] max-w-[250px]">
          <ResourceCard resources={resources} isRunning={isRunning} stopwatch={stopwatch} countdown={countdown} />
        </div>

        <div ref={ref} className="flex-grow">
          <div
            className="rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ width: gridDimensions.width, height: gridDimensions.height }}
          >
            <GridRenderer
              width={gridDimensions.width}
              height={gridDimensions.height}
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
              <SoundButton
                className="bg-blue-400 text-black hover:bg-blue-500 font-bold py-4 px-8 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-xl"
                onClick={handleStartButton}
              >
                Start
              </SoundButton>
              <SoundButton
                className="bg-green-400 text-black hover:bg-green-500 font-bold py-4 px-8 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-xl"
                onClick={handleReset}
              >
                Regenerate
              </SoundButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseGame;
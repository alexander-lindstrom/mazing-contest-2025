import GridRenderer from "./GridRenderer";
import { ClapEvent, GridCell, Position, Tower } from "@mazing/util";
import { KonvaEventObject } from "konva/lib/Node";
import ResourceCard from "./ResourceCard";
import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import ResourceCardWithButtons from "./ResourceCardWithButtons";

interface BaseGameProps {
  startingState: { width: number; height: number };
  towers: Tower[];
  grid: GridCell[][];
  handleCellClick: (x: number, y: number, e: KonvaEventObject<MouseEvent>) => void;
  runnerPath: Position[];
  runnerStatus: boolean[];
  runnerAngle: number[];
  isRunning: boolean;
  clapEvents: ClapEvent[];
  resources: { gold: number; lumber: number };
  stopwatch: number;
  countdown: number;
  handleStartButton: (() => void) | null;
  handleReset: (() => void) | null;
  handleGenerateNew: (() => void) | null;
  handleShare: (() => void) | null;
  copied: boolean;
  startTime?: number;
}

const BaseGame: React.FC<BaseGameProps> = ({
  startingState,
  towers,
  grid,
  handleCellClick,
  runnerPath,
  runnerStatus,
  runnerAngle,
  isRunning,
  clapEvents,
  resources,
  stopwatch,
  countdown,
  handleStartButton,
  handleReset,
  handleGenerateNew,
  handleShare,
  copied,
  startTime = 0,
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
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
      <div style={{ width: gridDimensions.width }} className="flex flex-col">
  
        <div className="w-full mb-4 flex justify-center items-center">
          {handleStartButton && handleReset && handleGenerateNew && handleShare ? (
            <ResourceCardWithButtons
              resources={resources}
              isRunning={isRunning}
              stopwatch={stopwatch}
              countdown={countdown}
              handleStartButton={handleStartButton}
              handleReset={handleReset}
              handleGenerateNew={handleGenerateNew}
              handleShare={handleShare}
              copied={copied}
            />
          ) : (
            <ResourceCard
              resources={resources}
              isRunning={isRunning}
              stopwatch={stopwatch}
              countdown={countdown}
            />
          )}
        </div>
  
        { /* regular grid */}
        {grid.length > 0 && grid[0].length > 0 && (
          <div
            ref={ref}
            className="rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-auto"
          >
            <GridRenderer
              width={gridDimensions.width}
              height={gridDimensions.height}
              towers={towers}
              grid={grid}
              handleClick={handleCellClick}
              runnerPath={runnerPath}
              runnerStatus={runnerStatus}
              runnerAngle={runnerAngle}
              showRunner={isRunning}
              clapEvents={clapEvents}
              startTime={startTime}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseGame;
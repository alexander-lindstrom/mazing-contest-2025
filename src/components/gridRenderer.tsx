import { Stage, Layer, Rect, Group } from "react-konva";
import { canPlaceTower, getBaseCellColor, getCellColor, GridParams, Position, Tower } from "../util/Grid";
import { useCallback, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import Runner from "./Runner";
import ClapAnimation, { ClapEvent } from "./ClapAnimation";
import { defaultTimeStep, getCenterPoint } from "../util/Simulation";

const CELL_SIZE = 50;
const CELL_PADDING = 1;

export type GridRendererParams = GridParams & {
  handleClick: (x: number, y: number) => void;
  runnerPath: Position[];
  showRunner: boolean;
  clapEvents: ClapEvent[];
  towers: Tower[];
};

const GridRenderer: React.FC<GridRendererParams> = ({
  height,
  width,
  grid,
  handleClick,
  runnerPath,
  showRunner,
  clapEvents,
  towers,
}) => {
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const x = Math.floor(pos.x / CELL_SIZE);
      const y = Math.floor(pos.y / CELL_SIZE);

      if (x >= 0 && x + 1 < width && y >= 0 && y + 1 < height) {
        setHoverPosition({ x, y });
      } else {
        setHoverPosition(null);
      }
    },
    [width, height]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;
      const x = Math.floor(pos.x / CELL_SIZE);
      const y = Math.floor(pos.y / CELL_SIZE);

      handleClick(x, y);
    },
    [handleClick]
  );

  const renderBaseGrid = () => (
    grid.map((row, y) =>
      row.map((cell, x) => (
        <Rect
          key={`${x}-${y}`}
          x={x * CELL_SIZE + CELL_PADDING}
          y={y * CELL_SIZE + CELL_PADDING}
          width={CELL_SIZE - 2 * CELL_PADDING}
          height={CELL_SIZE - 2 * CELL_PADDING}
          fill={getBaseCellColor(cell)}
          strokeWidth={1}
          stroke="#000"
          cornerRadius={2}
          cursor="pointer"
        />
      ))
    )
  );

  const renderTowers = () => (
    towers.map((tower, index) => {
      const { positions, type } = tower;
      const center = getCenterPoint(positions);
      return (
        <Rect
          key={`tower-${index}`}
          x={(center.x + 0.5) * CELL_SIZE}
          y={(center.y + 0.5) * CELL_SIZE}
          width={Math.SQRT2 * CELL_SIZE}
          height={Math.SQRT2 * CELL_SIZE}
          fill={getCellColor(type)}
          strokeWidth={1}
          stroke="#000"
          rotation={45}
          offsetX={(Math.SQRT2 * CELL_SIZE) / 2}
          offsetY={(Math.SQRT2 * CELL_SIZE) / 2}
          cornerRadius={4}
        />
      );
    })
  );

  return (
    <Stage
      width={width * CELL_SIZE}
      height={height * CELL_SIZE}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
    >
      <Layer>
        {renderBaseGrid()}
        {renderTowers()}
    


        {hoverPosition && (
          <Group>
            {[0, 1].map((dy) =>
              [0, 1].map((dx) => {
                const x = hoverPosition.x + dx;
                const y = hoverPosition.y + dy;

                return (
                  <Rect
                    key={`hover-${x}-${y}`}
                    x={x * CELL_SIZE}
                    y={y * CELL_SIZE}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    fill="rgba(255, 255, 255, 0.2)"
                    stroke={canPlaceTower(grid, hoverPosition.x, hoverPosition.y) ? "blue" : "red"}
                    strokeWidth={2}
                  />
                );
              })
            )}
          </Group>
        )}
      </Layer>

      {runnerPath && showRunner && (
        <Layer>
          <Runner runnerPath={runnerPath} cellSize={50} timestep={defaultTimeStep} />
        </Layer>
      )}

      {clapEvents.length > 0 && showRunner && (
        <Layer>
          <ClapAnimation 
          events={clapEvents} 
          cellSize={CELL_SIZE} />
        </Layer>
      )}
    </Stage>
  );
};

export default GridRenderer;

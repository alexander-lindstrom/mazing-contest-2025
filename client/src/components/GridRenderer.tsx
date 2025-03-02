import { Stage, Layer, Rect, Group } from "react-konva";
import { useCallback, useState, useMemo } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import Runner from "./Runner";
import { canPlaceTower, ClapEvent, defaultTimeStep, getBaseCellColor, getCellColor, getCenterPoint, GridParams, Position, Tower } from "@mazing/util";
import ClapAnimation from "./ClapAnimation";

const CELL_PADDING = 1;

export type GridRendererParams = GridParams & {
  handleClick: (x: number, y: number, e: KonvaEventObject<MouseEvent>) => void;
  runnerPath: Position[];
  showRunner: boolean;
  clapEvents: ClapEvent[];
  towers: Tower[];
};

const GridRenderer: React.FC<GridRendererParams> = ({
  height,
  width,
  grid = [],
  handleClick,
  runnerPath,
  showRunner,
  clapEvents,
  towers,
}) => {
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);

  const CELL_SIZE = useMemo(() => {
    if (grid.length === 0 || grid[0].length === 0) {
      return 0;
    }
    const cellWidth = width / grid[0].length;
    const cellHeight = height / grid.length;
    return Math.min(cellWidth, cellHeight);
  }, [width, height, grid]);

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (grid.length === 0 || grid[0].length === 0) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const x = Math.floor(pos.x / CELL_SIZE);
      const y = Math.floor(pos.y / CELL_SIZE);

      if (x >= 0 && x + 1 < grid[0].length && y >= 0 && y + 1 < grid.length) {
        setHoverPosition({ x, y });
      } else {
        setHoverPosition(null);
      }
    },
    [CELL_SIZE, grid]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (grid.length === 0 || grid[0].length === 0) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const x = Math.floor(pos.x / CELL_SIZE);
      const y = Math.floor(pos.y / CELL_SIZE);

      handleClick(x, y, e);
    },
    [handleClick, CELL_SIZE, grid]
  );

  const renderBaseGrid = () => {
    if (grid.length === 0 || grid[0].length === 0) return null;

    return grid.map((row, y) =>
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
    );
  };

  const renderTowers = () => {
    if (grid.length === 0 || grid[0].length === 0) return null;

    return towers.map((tower, index) => {
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
    });
  };

  if (grid.length === 0 || grid[0].length === 0) {
    return null;
  }

  return (
    <Stage
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
    >
      <Layer>
        {renderBaseGrid()}
        {renderTowers()}
        {!showRunner && hoverPosition && (
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
          <Runner runnerPath={runnerPath} cellSize={CELL_SIZE} timestep={defaultTimeStep} />
        </Layer>
      )}
      {clapEvents.length > 0 && showRunner && (
        <Layer>
          <ClapAnimation events={clapEvents} cellSize={CELL_SIZE} />
        </Layer>
      )}
    </Stage>
  );
};

export default GridRenderer;
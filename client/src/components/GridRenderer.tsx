import { Stage, Layer, Rect, Group } from "react-konva";
import { useCallback, useState, useMemo } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import Runner from "./Runner";
import { canPlaceTower, ClapEvent, defaultTimeStep, getCenterPoint, GridCell, GridParams, Position, Tower } from "@mazing/util";
import ClapAnimation from "./ClapAnimation";
import SlowTower from "./grid/SlowTower";
import { BlockingTower } from "./grid/BlockingTower";
import { Grass } from "./grid/Grass";
import { WildGrass } from "./grid/WildGrass";
import { Sand } from "./grid/Sand";
import { GridLines } from "./grid/GridLines";
import React from "react";

export interface BasePositionProps {
  x: number;
  y: number;
  size: number;
  id?: string;
}

export type GridRendererParams = GridParams & {
  handleClick: (x: number, y: number, e: KonvaEventObject<MouseEvent>) => void;
  runnerPath: Position[];
  runnerStatus: boolean[];
  runnerAngle: number[];
  showRunner: boolean;
  clapEvents: ClapEvent[];
  towers: Tower[];
  startTime?: number;
};

const GridRenderer: React.FC<GridRendererParams> = ({
  height,
  width,
  grid = [],
  handleClick,
  runnerPath,
  runnerStatus,
  runnerAngle,
  showRunner,
  clapEvents,
  towers,
  startTime = 0,
}) => {
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);

  const CELL_SIZE = useMemo(() => {
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
      if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
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

  interface RenderBaseGridProps {
    grid: GridCell[][];
    CELL_SIZE: number;
    towers: Tower[];
  }

  const renderBaseGrid = ({ grid, CELL_SIZE, towers }: RenderBaseGridProps) => {
    return useMemo(() => {
      const gridElements = grid.map((row, y) =>
        row.map((cell, x) => {
          const centerX = (x + 0.5) * CELL_SIZE;
          const centerY = (y + 0.5) * CELL_SIZE;
          switch (cell) {
            case GridCell.GRASS:
              return (
                <Grass
                  key={`grass-${x}-${y}`}
                  x={centerX}
                  y={centerY}
                  size={CELL_SIZE}
                />
              );
            case GridCell.GRASS_NOBUILD:
              return (
                <WildGrass
                  key={`wild-grass-${x}-${y}`}
                  x={centerX}
                  y={centerY}
                  size={CELL_SIZE}
                />
              );
            case GridCell.SAND:
              return (
                <Sand
                  key={`sand-${x}-${y}`}
                  x={centerX}
                  y={centerY}
                  size={CELL_SIZE}
                />
              );
            default:
              return null;
          }
        })
      );
  
      return (
        <Layer cache>
          {gridElements.flat()}
          <GridLines
            key="grid-lines"
            width={grid[0].length * CELL_SIZE}
            height={grid.length * CELL_SIZE}
            cellSize={CELL_SIZE}
          />
        </Layer>
      );
    }, [grid, CELL_SIZE, towers]);
  };
  
  const towersGrid = useMemo(() => 
    towers.map((tower, index) => {
      const { positions, type } = tower;
      const center = getCenterPoint(positions);
      
      const centerX = (center.x + 0.5) * CELL_SIZE;
      const centerY = (center.y + 0.5) * CELL_SIZE;
      const radius = 2 * CELL_SIZE;
      const key = `tower-${index}`;
  
      if (type === GridCell.CLAP_TOWER || type === GridCell.CLAP_TOWER_NOSELL || type == GridCell.BLOCK_TOWER_NOSELL_UPGRADED) {
        return (
          <SlowTower
            key={key}
            id={key}
            x={centerX}
            y={centerY}
            towerRadius={radius}
            showEffectBorder={false} // Todo: show on hover?
            sellable={type === GridCell.CLAP_TOWER || type === GridCell.BLOCK_TOWER_NOSELL_UPGRADED}       
          />
        );
      }
  
      if (type === GridCell.BLOCK_TOWER || type == GridCell.BLOCK_TOWER_NOSELL) {
        return (
          <BlockingTower
            key={key}
            id={key}
            x={centerX}
            y={centerY}
            towerRadius={radius}
            sellable={type === GridCell.BLOCK_TOWER}
          />
        );
      }
  
      return null;
    }),
    [towers, CELL_SIZE]);

    const hoverEffect = useMemo(() => {
      if (!hoverPosition || showRunner) return null;
      return (
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
      );
    }, [hoverPosition, showRunner, CELL_SIZE, grid]);

    const startIndex = useMemo(() => {
      return Math.floor(startTime / defaultTimeStep);
    }, [startTime]);

  return (
    <Stage
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
    >
      {renderBaseGrid({ grid, CELL_SIZE, towers })}
      <Layer>
        {towersGrid}
      </Layer>

      {!showRunner && hoverPosition && (
        <Layer>
          {hoverEffect}
        </Layer>
      )}

      {runnerPath && showRunner && (
        <Layer>
          <Runner
            runnerPath={runnerPath}
            cellSize={CELL_SIZE}
            runnerStatus={runnerStatus}
            runnerAngle={runnerAngle}
            startIndex={startIndex}
            timestep={defaultTimeStep}
          />
        </Layer>
      )}

      {clapEvents.length > 0 && showRunner && (
        <Layer>
          <ClapAnimation 
            events={clapEvents} 
            cellSize={CELL_SIZE}
            startTime={startTime}
          />
        </Layer>
      )}
    </Stage>
  );
};

export default React.memo(GridRenderer);
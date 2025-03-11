import { Stage, Layer, Rect, Group } from "react-konva";
import { useCallback, useState, useMemo } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import Runner from "./Runner";
import { canPlaceTower, ClapEvent, defaultTimeStep, getCenterPoint, GridCell, GridParams, Position, Tower } from "@mazing/util";
import ClapAnimation from "./ClapAnimation";
import SlowTower from "./grid/SlowTower";
import { RegularTower } from "./grid/RegularTower";
import { Grass } from "./grid/Grass";
import { WildGrass } from "./grid/WildGrass";
import { Sand } from "./grid/Sand";

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
      row.map((cell, x) => {
        const centerX = (x+0.5) * CELL_SIZE;
        const centerY= (y+0.5) * CELL_SIZE;
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
  };

  const renderTowers = () => {
    if (grid.length === 0 || grid[0].length === 0) return null;

    return towers.map((tower, index) => {
      const { positions } = tower;
      const center = getCenterPoint(positions);
      
      const centerX = (center.x + 0.5) * CELL_SIZE;
      const centerY = (center.y + 0.5) * CELL_SIZE;
      
      const radius = 2*CELL_SIZE;
      
      switch (tower.type) {
        case GridCell.CLAP_TOWER:
          return (
            <SlowTower
              key={`tower-${index}`}
              id={`tower-${index}`}
              x={centerX}
              y={centerY}
              towerRadius={radius}
              showEffectBorder={false} // Todo: show on hover?
              sellable={true}       
            />
          );
        case GridCell.CLAP_TOWER_NOSELL:
          return (
            <SlowTower
              key={`tower-${index}`}
              id={`tower-${index}`}
              x={centerX}
              y={centerY}
              towerRadius={radius}
              showEffectBorder={false} // Todo: show on hover?
              sellable={false}       
            />
          );
        case GridCell.BLOCK_TOWER:
          return (
            <RegularTower
              key={`tower-${index}`}
              id={`tower-${index}`}
              x={centerX}
              y={centerY}
              towerRadius={radius}
              sellable={true}
            />
          );
        case GridCell.BLOCK_TOWER_NOSELL:
          return (
            <RegularTower
              key={`tower-${index}`}
              id={`tower-${index}`}
              x={centerX}
              y={centerY}
              towerRadius={radius}
              sellable={false}
            />
          );
        default:
          return null;
      }
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
          <Runner 
            runnerPath={runnerPath} 
            cellSize={CELL_SIZE} 
            timestep={defaultTimeStep}
            runnerStatus={runnerStatus}
            runnerAngle={runnerAngle}
          />

        </Layer>
      )}
      {clapEvents.length > 0 && showRunner && (
        <Layer>
          <ClapAnimation 
            events={clapEvents} 
            cellSize={CELL_SIZE}
          />
        </Layer>
      )}
    </Stage>
  );
};

export default GridRenderer;
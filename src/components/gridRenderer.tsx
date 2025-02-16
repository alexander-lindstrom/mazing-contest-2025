import { Stage, Layer, Rect, Group } from 'react-konva';
import { canPlaceTower, getCellColor, GridParams, Position } from '../util/Grid';
import { useCallback, useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import Runner from './Runner';
import Konva from 'konva';
import { defaultTimeStep } from '../util/Simulation';

const CELL_SIZE = 50;
const CELL_PADDING = 1;

export type GridRendererParams = GridParams & {
  handleClick: (x: number, y: number) => void;
  runnerPath: Position[];
  showRunner: boolean;
};

const GridRenderer: React.FC<GridRendererParams> = ({ height, width, grid, handleClick, runnerPath, showRunner }) => {
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
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
  }, [width, height]);

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const x = Math.floor(pos.x / CELL_SIZE);
    const y = Math.floor(pos.y / CELL_SIZE);

    handleClick(x, y);
  }, [handleClick]);

  return (
    <Stage
      width={width * CELL_SIZE}
      height={height * CELL_SIZE}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
    >
      <Layer ref={layerRef}>
        {/* Base grid */}
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <Rect
              key={`${x}-${y}`}
              x={x * CELL_SIZE + CELL_PADDING}
              y={y * CELL_SIZE + CELL_PADDING}
              width={CELL_SIZE - 2 * CELL_PADDING}
              height={CELL_SIZE - 2 * CELL_PADDING}
              fill={getCellColor(cell)}
              strokeWidth={1}
              stroke="#000"
              cornerRadius={2}
              cursor="pointer"
            />
          ))
        )}

        {/* Hover highlight for 2x2 area */}
        {hoverPosition && (
          <Group>
            {[0, 1].map(dy =>
              [0, 1].map(dx => {
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
    </Stage>
  );
};

export default GridRenderer;

import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { canPlaceTower, getCellColor, getTowerSymbol, getTowerSymbolColor, GridCell, GridProperties, Position, TowerType } from '../types/grid';
import { useCallback, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';

const CELL_SIZE = 50;
const CELL_PADDING = 1;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GridRenderer: React.FC<GridProperties> = ({ height, width, grid, towers, onCellClick }) => {
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  
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
    
    onCellClick(x, y);
  }, [onCellClick]);

  return (
    <Stage 
      width={width * CELL_SIZE} 
      height={height * CELL_SIZE}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
    >
      <Layer>
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

        {/* Tower symbols */}
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (
              cell === GridCell.BLOCK_TOWER ||
              cell === GridCell.CLAP_TOWER ||
              cell === GridCell.BLOCK_TOWER_NOSELL ||
              cell === GridCell.CLAP_TOWER_NOSELL
            ) {
              // Only render symbol on top-left cell of 2x2 tower
              if (x % 2 === 0 && y % 2 === 0) {
                const towerType = cell === GridCell.BLOCK_TOWER || cell === GridCell.BLOCK_TOWER_NOSELL
                  ? TowerType.BLOCK_TOWER
                  : TowerType.CLAP_TOWER;
                
                return (
                  <Text
                    key={`tower-${x}-${y}`}
                    x={x * CELL_SIZE}
                    y={y * CELL_SIZE}
                    width={CELL_SIZE * 2}
                    height={CELL_SIZE * 2}
                    text={getTowerSymbol(towerType)}
                    fontSize={40}
                    fill={getTowerSymbolColor(cell)}
                    align="center"
                    verticalAlign="middle"
                  />
                );
              }
            }
            return null;
          })
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
    </Stage>
  );
};

export default GridRenderer;
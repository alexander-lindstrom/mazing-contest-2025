import { Stage, Layer, Rect, Group } from 'react-konva';
import { canPlaceTower, canSellTower, getCellColor, GridCell, GridParams, Position, Tower} from '../util/Grid';
import { useCallback, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';

const CELL_SIZE = 50;
const CELL_PADDING = 1;

export type GridRendererParams = GridParams & {
  setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>;
  setTowers: React.Dispatch<React.SetStateAction<Tower[]>>;
}

const GridRenderer: React.FC<GridRendererParams> = ({ height, width, towers, setTowers, grid, setGrid }) => {
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

    const handleCellClick = (x: number, y: number) => {
      const newGrid = grid.map(row => [...row]);
  
      if (canSellTower(grid, x, y)) {
        const towerIndex = towers.findIndex(tower => 
            tower.positions.some(pos => pos.x === x && pos.y === y)
        );
        
        if (towerIndex !== -1) {
            const tower = towers[towerIndex];
            
            tower.positions.forEach(pos => {
                newGrid[pos.y][pos.x] = GridCell.GRASS;
            });
            
            const newTowers = [...towers];
            newTowers.splice(towerIndex, 1);
            
            setGrid(newGrid);
            setTowers(newTowers);
            return;
        }
      }
      
      if (canPlaceTower(grid, x, y)) {
        const selectedTower = GridCell.BLOCK_TOWER;
        const positions: [Position, Position, Position, Position] = [
            { x: x, y: y },
            { x: x + 1, y: y },
            { x: x, y: y + 1 },
            { x: x + 1, y: y + 1 }
        ];
        
        positions.forEach(pos => {
            newGrid[pos.y][pos.x] = selectedTower;
        });
        
        const newTower: Tower = {
            type: GridCell.BLOCK_TOWER,
            positions: positions
        };
        
        const newTowers = [...towers, newTower];
        
        setGrid(newGrid);
        setTowers(newTowers);
      }
    };

    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const x = Math.floor(pos.x / CELL_SIZE);
    const y = Math.floor(pos.y / CELL_SIZE);
    
    handleCellClick(x, y);
  }, [grid, setGrid, setTowers, towers]);

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
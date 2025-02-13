import { useState } from 'react';
import GridRenderer from '../components/GridRenderer';
import { generateStartingState } from '../util/RandomGeneration';
import { canPlaceTower, canSellTower, GridCell, Position, Tower } from '../util/Grid';

const startingState = generateStartingState();

export function GamePage() {

  const [grid, setGrid] = useState(() => {
    return startingState.grid;
  });
  const [towers, setTowers] = useState(() => {
    return startingState.towers;
  });

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

  return (
    <div className="game-page">
      <h1>Tower Defense Grid</h1>
      <GridRenderer
        width={startingState.width}
        height={startingState.height}
        towers={towers}
        grid={grid}
        handleClick={handleCellClick}
      />
    </div>
  );
}
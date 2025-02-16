import { useState } from 'react';
import GridRenderer from '../components/GridRenderer';
import { generateStartingState } from '../util/RandomGeneration';
import { canPlaceTower, canSellTower, defaultGoal, defaultStart, GridCell, Position, Tower } from '../util/Grid';
import { findShortestPath } from '../util/Pathfinding';
import { simulateRunnerMovement } from '../util/Simulation';

const startingState = generateStartingState();

export function GamePage() {
  const [grid, setGrid] = useState(() => {
    return startingState.grid;
  });
  const [towers, setTowers] = useState(() => {
    return startingState.towers;
  });

  const [runnerPath, setRunnerPath] = useState<Position[]>([]);
  const [isRunning, setIsRunning] = useState(false);

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

  const handleButtonClick = () => {
    const path = findShortestPath(grid, defaultStart, defaultGoal);
    if (!path) {
      return;
    }

    const runnerPosition = simulateRunnerMovement(towers, path);
    setRunnerPath(runnerPosition);
    setIsRunning(true);
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
        runnerPath={runnerPath}
        showRunner={isRunning}
      />

      <button 
        onClick={handleButtonClick}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start
      </button>
    </div>
  );
}

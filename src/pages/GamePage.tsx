import { useState } from 'react';
import GridRenderer from '../components/GridRenderer';
import { generateStartingState } from '../util/RandomGeneration';
import { canPlaceTower, canSellTower, defaultGoal, defaultStart, GridCell, Position, Tower } from '../util/Grid';
import { findShortestPath } from '../util/Pathfinding';
import { simulateRunnerMovement } from '../util/Simulation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const startingState = generateStartingState();

export function GamePage() {
  const [grid, setGrid] = useState(() => startingState.grid);
  const [towers, setTowers] = useState(() => startingState.towers);
  const [runnerPath, setRunnerPath] = useState<Position[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleCellClick = (x: number, y: number) => {
    const newGrid = grid.map(row => [...row]);
    
    // Logic for handling tower placement and removal
    if (canSellTower(grid, x, y)) {
      const towerIndex = towers.findIndex(tower => tower.positions.some(pos => pos.x === x && pos.y === y));
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

      const newTower: Tower = { type: GridCell.BLOCK_TOWER, positions: positions };
      const newTowers = [...towers, newTower];
      setGrid(newGrid);
      setTowers(newTowers);
    }
  };

  const handleButtonClick = () => {
    const path = findShortestPath(grid, defaultStart, defaultGoal);
    if (!path) return;

    const runnerPosition = simulateRunnerMovement(towers, path);
    setRunnerPath(runnerPosition);
    setIsRunning(true);
  };

  return (
    <div className="game-page flex flex-col gap-8 p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">Tower Defense Grid</h1>

      <div className="grid-section flex justify-center">
        <Card className="bg-gray-800 p-6">
          <GridRenderer
            width={startingState.width}
            height={startingState.height}
            towers={towers}
            grid={grid}
            handleClick={handleCellClick}
            runnerPath={runnerPath}
            showRunner={isRunning}
          />
        </Card>
      </div>

      <div className="game-info-section flex flex-col items-center gap-4">
        <Card className="bg-gray-800 p-6">
          <div className="text-lg font-semibold">Game Info</div>
          <div className="text-sm">
            <p>Gold: 500</p>
            <p>Lumber: 200</p>
            <p>Time Left: 2:30</p>
          </div>
        </Card>
      </div>

      <div className="buttons-section flex justify-center gap-4">
        <Button className="bg-blue-500 px-6 py-3 rounded hover:bg-blue-600" onClick={handleButtonClick}>
          Start
        </Button>
        <Button className="bg-red-500 px-6 py-3 rounded hover:bg-red-600" onClick={() => {}}>
          Reset
        </Button>
      </div>
    </div>
  );
}

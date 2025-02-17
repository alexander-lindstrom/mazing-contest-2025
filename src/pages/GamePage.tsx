import { useState, useEffect } from 'react';
import GridRenderer from '../components/GridRenderer';
import { generateStartingState } from '../util/RandomGeneration';
import { canPlaceTower, canSellTower, defaultGoal, defaultStart, get2x2Positions, GridCell, Position } from '../util/Grid';
import { findShortestPath } from '../util/Pathfinding';
import { defaultTimeStep, simulateRunnerMovement } from '../util/Simulation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { ClapEvent } from '../components/ClapAnimation';

const startingState = generateStartingState();
const INITIAL_COUNTDOWN = 45;

export function GamePage() {
  const [grid, setGrid] = useState(startingState.grid);
  const [towers, setTowers] = useState(startingState.towers);
  const [resources, setResources] = useState({ gold: startingState.gold, lumber: startingState.lumber });
  const [runnerPath, setRunnerPath] = useState<Position[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [placeTowerMode, setPlaceTowerMode] = useState(GridCell.BLOCK_TOWER);
  const [clapEvents, setClapEvents] = useState<ClapEvent[]>([]);
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const [stopwatch, setStopwatch] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [totalSimulationTime, setTotalSimulationTime] = useState<number | null>(null);

  console.log(totalSimulationTime)

  useEffect(() => {
    if (countdown <= 0) {
      handleStartButton();
      return;
    }
    
    const interval = setInterval(() => {
      setCountdown(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  useEffect(() => {
    if (!isStopwatchRunning || (totalSimulationTime !== null && stopwatch >= totalSimulationTime)) {
      return;
    }
    
    const interval = setInterval(() => {
      setStopwatch(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStopwatchRunning, stopwatch, totalSimulationTime]);

  const handleCellClick = (x: number, y: number) => {
    if (isRunning) return;
    const newGrid = grid.map(row => [...row]);

    if (canSellTower(grid, x, y)) {
      const towerIndex = towers.findIndex(tower =>
        tower.positions.some(pos => pos.x === x && pos.y === y)
      );
      if (towerIndex !== -1) {
        const tower = towers[towerIndex];
        const goldDiff = 1;
        const lumberDiff = tower.type === GridCell.CLAP_TOWER ? 1 : 0;
        tower.positions.forEach(pos => {
          newGrid[pos.y][pos.x] = GridCell.GRASS;
        });
        const newTowers = [...towers];
        newTowers.splice(towerIndex, 1);
        setGrid(newGrid);
        setTowers(newTowers);
        setResources({ gold: resources.gold + goldDiff, lumber: resources.lumber + lumberDiff });
        return;
      }
    } else if (canPlaceTower(grid, x, y)) {
      const positions = get2x2Positions({ x, y });
      const lumberCost = placeTowerMode === GridCell.BLOCK_TOWER ? 0 : 1;
      if (resources.gold < 1 || resources.lumber < lumberCost) return;
      positions.forEach(pos => {
        newGrid[pos.y][pos.x] = placeTowerMode;
      });
      setGrid(newGrid);
      setTowers([...towers, { type: placeTowerMode, positions }]);
      setResources({ gold: resources.gold - 1, lumber: resources.lumber - lumberCost });
    }
  };

  const handleStartButton = () => {
    if (isRunning) return;
    
    const path = findShortestPath(grid, defaultStart, defaultGoal);
    if (!path) return;
    
    const timeSteps = simulateRunnerMovement(towers, path);
    const positions = timeSteps.map(step => step.position);
    const claps = timeSteps.flatMap(step => step.claps || []);
    
    setRunnerPath(positions);
    setClapEvents(claps);
    setIsRunning(true);
    setCountdown(0);
    setStopwatch(0);
    setIsStopwatchRunning(true);
    
    const totalSimTime = timeSteps.length * defaultTimeStep;
    setTotalSimulationTime(totalSimTime);
  };

  const handleReset = () => {
    const newState = generateStartingState();
    setGrid(newState.grid);
    setTowers(newState.towers);
    setResources({ gold: newState.gold, lumber: newState.lumber });
    setRunnerPath([]);
    setIsRunning(false);
    setPlaceTowerMode(GridCell.BLOCK_TOWER);
    setCountdown(INITIAL_COUNTDOWN);
    setStopwatch(0);
    setIsStopwatchRunning(false);
    setTotalSimulationTime(null);
  };
  
  return (
    <div className="flex justify-center items-start p-6 bg-gray-900 min-h-screen">
      <div className="flex flex-col items-center w-full max-w-6xl">
        <div className="flex w-full space-x-6">
          <div className="flex-grow">
            <GridRenderer
              width={startingState.width}
              height={startingState.height}
              towers={towers}
              grid={grid}
              handleClick={handleCellClick}
              runnerPath={runnerPath}
              showRunner={isRunning}
              clapEvents={clapEvents}
            />
          </div>

          <div className="flex flex-col space-y-6 w-80">
            <Card className="bg-gray-800 text-white p-4">
              <h2 className="text-lg font-semibold">Game Info</h2>
              <p>Gold: {resources.gold}</p>
              <p>Lumber: {resources.lumber}</p>
              <p>Time: {isRunning ? stopwatch : countdown}</p>
            </Card>

            <div className="flex space-x-4">
              <Button onClick={handleStartButton} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Start</Button>
              <Button onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Regenerate</Button>
              <div className="flex items-center gap-2">
                <span>Block</span>
                <Switch checked={placeTowerMode === GridCell.CLAP_TOWER} onCheckedChange={checked => setPlaceTowerMode(checked ? GridCell.CLAP_TOWER : GridCell.BLOCK_TOWER)} />
                <span>Clap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

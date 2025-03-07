import { useState, useEffect } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { canPlaceTower, canSellTower, ClapEvent, defaultGoal, defaultStart, defaultTimeStep, findShortestPath, generateStartingState, get2x2Positions, GridCell, pathExists, Position, simulateRunnerMovement } from '@mazing/util';
import BaseGame from '@/components/BaseGame';
import useSellTowerSound from '@/hooks/useSellTowerSound';
import useBuildTowerSound from '@/hooks/useBuildTowerSound';
import useInvalidActionSound from '@/hooks/useInvalidActionSound';

const startingState = generateStartingState();
const INITIAL_COUNTDOWN = 45;

export function SinglePlayerGame() {
  const [grid, setGrid] = useState(startingState.grid);
  const [towers, setTowers] = useState(startingState.towers);
  const [resources, setResources] = useState({ gold: startingState.gold, lumber: startingState.lumber });
  const [runnerPath, setRunnerPath] = useState<Position[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [clapEvents, setClapEvents] = useState<ClapEvent[]>([]);
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const [stopwatch, setStopwatch] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [totalSimulationTime, setTotalSimulationTime] = useState<number | null>(null);
  const sellTowerSound = useSellTowerSound();
  const buildTowerSound = useBuildTowerSound();
  const invalidActionSound = useInvalidActionSound();

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

  const handleCellClick = (x: number, y: number, e: KonvaEventObject<MouseEvent>) => {
    if (isRunning) {
      return;
    }
    if (!pathExists(grid, defaultStart, defaultGoal, { x, y })) {
      invalidActionSound();
      return;
    }
    const newGrid = grid.map(row => [...row]);
    const shiftPress = e.evt.shiftKey;

    if (canSellTower(grid, x, y)) {
      const towerIndex = towers.findIndex(tower =>
        tower.positions.some(pos => pos.x === x && pos.y === y)
      );
      if (towerIndex !== -1) {
        sellTowerSound();
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
      const lumberCost = shiftPress ? 1 : 0;
      if (resources.gold < 1 || resources.lumber < lumberCost) {
        return;
      }
      buildTowerSound();
      positions.forEach(pos => {
        newGrid[pos.y][pos.x] = shiftPress ? GridCell.CLAP_TOWER : GridCell.BLOCK_TOWER;
      });
      setGrid(newGrid);
      setTowers([...towers, { type: shiftPress ? GridCell.CLAP_TOWER : GridCell.BLOCK_TOWER, positions }]);
      setResources({ gold: resources.gold - 1, lumber: resources.lumber - lumberCost });
    }
    else{
      invalidActionSound();
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
    setCountdown(INITIAL_COUNTDOWN);
    setStopwatch(0);
    setIsStopwatchRunning(false);
    setTotalSimulationTime(null);
  };
  
  return (
    <BaseGame
      startingState={startingState}
      towers={towers}
      grid={grid}
      handleCellClick={handleCellClick}
      runnerPath={runnerPath}
      isRunning={isRunning}
      clapEvents={clapEvents}
      resources={resources}
      stopwatch={stopwatch}
      countdown={countdown}
      handleStartButton={handleStartButton}
      handleReset={handleReset}
    />
  );
}

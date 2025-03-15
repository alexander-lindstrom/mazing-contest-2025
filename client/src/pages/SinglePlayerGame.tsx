import { useState, useEffect } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { canPlaceTower, canSellTower, ClapEvent, defaultGoal, defaultStart, defaultTimeStep, findShortestPath, generateStartingState, get2x2Positions, GridCell, pathExists, Position, simulateRunnerMovement, StartingState } from '@mazing/util';
import BaseGame from '@/components/BaseGame';
import invalidSound from "../sounds/invalid_action.mp3";
import buildSound from "../sounds/building_tower.wav";
import sellSound from "../sounds/selling_tower.wav";
import useSound from '@/hooks/useSound';

interface SinglePlayerGameProps {
  seed: string | undefined;
  duration: number;
}

export function SinglePlayerGame({
  seed,
  duration,
} : SinglePlayerGameProps) {

  const [startingState, setStartingState] = useState(generateStartingState(seed));
  const [grid, setGrid] = useState(startingState.grid);
  const [towers, setTowers] = useState(startingState.towers);
  const [resources, setResources] = useState({ gold: startingState.gold, lumber: startingState.lumber });
  const [runnerPath, setRunnerPath] = useState<Position[]>([]);
  const [runnerStatus, setRunnerStatus] = useState<boolean[]>([]);
  const [runnerAngle, setRunnerAngle] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [clapEvents, setClapEvents] = useState<ClapEvent[]>([]);
  const [countdown, setCountdown] = useState(duration);
  const [stopwatch, setStopwatch] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [totalSimulationTime, setTotalSimulationTime] = useState<number | null>(null);
  const sellTowerSound = useSound(sellSound, 0.5);
  const buildTowerSound = useSound(buildSound, 0.5);
  const invalidActionSound = useSound(invalidSound, 0.5);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const newStartingState = generateStartingState(seed || undefined);
    setStartingState(newStartingState);
    restart(newStartingState);
  }, [seed]);

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

  const restart = (state: StartingState) => {
    setGrid(state.grid);
    setTowers(state.towers);
    setResources({ gold: state.gold, lumber: state.lumber });
    setRunnerPath([]);
    setRunnerStatus([]);
    setRunnerAngle([]);
    setIsRunning(false);
    setCountdown(duration);
    setStopwatch(0);
    setIsStopwatchRunning(false);
    setTotalSimulationTime(null);
  }

  const handleStartButton = () => {
    if (isRunning) return;
    
    const path = findShortestPath(grid, defaultStart, defaultGoal);
    if (!path) return;
    
    const timeSteps = simulateRunnerMovement(towers, path);
    const positions = timeSteps.map(step => step.position);
    const runnerStatus = timeSteps.map(step => step.isSlowed);
    const runnerAngle = timeSteps.map(step => step.angle);
    const claps = timeSteps.flatMap(step => step.claps || []);
    
    setRunnerPath(positions);
    setRunnerStatus(runnerStatus);
    setRunnerAngle(runnerAngle);
    setClapEvents(claps);
    setIsRunning(true);
    setCountdown(0);
    setStopwatch(0);
    setIsStopwatchRunning(true);
    
    const totalSimTime = timeSteps.length * defaultTimeStep;
    setTotalSimulationTime(totalSimTime);
  };

  const handleRegenerate = () => {
    const newState = generateStartingState();
    setStartingState(newState);
    restart(newState);
  };

  const handleReset = () => {
    restart(startingState);
  } 

  const handleShare = () => {
    const baseUrl = import.meta.env.MODE === 'development'
      ? 'http://localhost:5173'
      : import.meta.env.VITE_FRONTEND_URL;
  
    const seed = startingState.seed;
    const fullUrl = `${baseUrl}?mode=single&seed=${encodeURIComponent(seed)}`;
  
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
      })
      .catch((error) => {
        console.error('Failed to copy URL to clipboard:', error);
      });
  };
  
  return (
    <BaseGame
      startingState={startingState}
      towers={towers}
      grid={grid}
      handleCellClick={handleCellClick}
      runnerPath={runnerPath}
      runnerStatus={runnerStatus}
      runnerAngle={runnerAngle}
      isRunning={isRunning}
      clapEvents={clapEvents}
      resources={resources}
      stopwatch={stopwatch}
      countdown={countdown}
      handleStartButton={handleStartButton}
      handleReset={handleReset}
      handleGenerateNew={handleRegenerate}
      handleShare={handleShare}
      copied={copied}
    />
  );
}

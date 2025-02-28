import { useState, useEffect } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { canPlaceTower, canSellTower, ChatMessage, ClapEvent, defaultGoal, defaultHeight, defaultStart,
  defaultTimeStep, defaultWidth, findShortestPath, GameActionEnum, get2x2Positions, GridCell,
  LobbyInformation,
  Position, RoundResult, simulateRunnerMovement, StartingState, Tower } from '@mazing/util';
import BaseGame from '@/components/BaseGame';
import { ChatRoom } from '@/components/ChatRoom';
import { getSocket } from '@/socket';
import ResultDisplay from './ResultDisplay';

interface MultiPlayerGameSettings {
  rounds: number,
  buildingTime: number,
}

interface MultiPlayerGameProps {
  settings: MultiPlayerGameSettings,
  lobby: LobbyInformation,
  chatLog: ChatMessage[];
  onChatMessage: (message: string) => void;
  initialScore: RoundResult[] | null;
}

export const MultiPlayerGame = ({
  settings, 
  lobby,
  chatLog,
  onChatMessage,
  initialScore
}: MultiPlayerGameProps) => {
  const [grid, setGrid] = useState<GridCell[][]>([])
  const [towers, setTowers] = useState<Tower[]>([])
  const [resources, setResources] = useState({ gold: 0, lumber: 0 });
  const [runnerPath, setRunnerPath] = useState<Position[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [clapEvents, setClapEvents] = useState<ClapEvent[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [stopwatch, setStopwatch] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [totalSimulationTime, setTotalSimulationTime] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState<RoundResult[] | null>(initialScore)
  
  // add rounds later
  const { rounds, buildingTime } = settings;

  useEffect(() => {
    const socket = getSocket();

    function onRoundStart(config: StartingState) {
      setGrid(config.grid);
      setTowers(config.towers);
      setResources({ gold: config.gold, lumber: config.lumber });
      
      setRunnerPath([]);
      setClapEvents([]);
      setIsRunning(false);
      setTotalSimulationTime(null);
      
      setCountdown(buildingTime);
      setIsStopwatchRunning(false);
    }

    function onRoundEnd(result: RoundResult[]) { 

      setCurrentScore(result);
      console.log(result)

    }

    // function onGameEnd() {}

    socket.on(GameActionEnum.SERVER_ROUND_CONFIG, onRoundStart);
    socket.on(GameActionEnum.SERVER_ROUND_RESULT, onRoundEnd);
    //socket.on(GameActionEnum.SERVER_FINAL_RESULT, onGameEnd);

    return () => {
      socket.off(GameActionEnum.SERVER_ROUND_CONFIG);
      socket.off(GameActionEnum.SERVER_ROUND_RESULT);
      //socket.off(GameActionEnum.SERVER_FINAL_RESULT);
    };
  }, [buildingTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          const newCountdown = prevCountdown - 1;
          if (newCountdown <= 0) {
            handleRunnerStart();
          }
          return newCountdown;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isStopwatchRunning) {
      timer = setInterval(() => {
        setStopwatch(prevTime => {
          if (totalSimulationTime !== null && prevTime >= totalSimulationTime) {
            setIsStopwatchRunning(false);
            
            const socket = getSocket();
            const finalState: StartingState = {
              height: grid.length > 0 ? grid.length : defaultHeight,
              width: grid.length > 0 ? grid[0].length : defaultWidth,
              grid: grid,
              towers: towers,
              gold: resources.gold,
              lumber: resources.lumber
            };
            
            console.log("sending result (client)")
            socket.emit('game-action', { type: GameActionEnum.CLIENT_ROUND_RESULT, payload: finalState });
            
            return totalSimulationTime;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStopwatchRunning, totalSimulationTime, grid, towers, resources]);

  const handleCellClick = (x: number, y: number, e: KonvaEventObject<MouseEvent>) => {
    if (isRunning) return;
    const newGrid = grid.map(row => [...row]);
    const shiftPress = e.evt.shiftKey;

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
      const lumberCost = shiftPress ? 1 : 0;
      if (resources.gold < 1 || resources.lumber < lumberCost) return;
      positions.forEach(pos => {
        newGrid[pos.y][pos.x] = shiftPress ? GridCell.CLAP_TOWER : GridCell.BLOCK_TOWER;
      });
      setGrid(newGrid);
      setTowers([...towers, { type: shiftPress ? GridCell.CLAP_TOWER : GridCell.BLOCK_TOWER, positions }]);
      setResources({ gold: resources.gold - 1, lumber: resources.lumber - lumberCost });
    }
  };

  const handleRunnerStart = () => {
    if (isRunning) {
      return;
    }
    
    const path = findShortestPath(grid, defaultStart, defaultGoal);
    if (!path) return;
    
    const timeSteps = simulateRunnerMovement(true, towers, path);
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
  
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-grow">
        <BaseGame
          startingState={{ width: defaultWidth, height: defaultHeight }}
          towers={towers}
          grid={grid}
          handleCellClick={handleCellClick}
          runnerPath={runnerPath}
          isRunning={isRunning}
          clapEvents={clapEvents}
          resources={resources}
          stopwatch={stopwatch}
          countdown={countdown}
          handleStartButton={null}
          handleReset={null}
        />
      </div>
      
      <div className="w-full lg:w-80">
        <ChatRoom
          chatLog={chatLog}
          onSendMessage={onChatMessage}
          title={`Game Chat: ${lobby.gameId.substring(0, 8)}`}
        />
      </div>

      <ResultDisplay 
        score={currentScore}
        roundNumber={3}
        totalRounds={rounds}
      />
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { canPlaceTower, canSellTower, ChatMessage, ClapEvent, defaultGoal, defaultHeight, defaultStart,
  defaultTimeStep, defaultWidth, FinalResults, findShortestPath, GameActionEnum, GameSettingsData, get2x2Positions, GridCell,
  PlayerData,
  Position, RoundResult, simulateRunnerMovement, StartingState, Tower } from '@mazing/util';
import BaseGame from '@/components/BaseGame';
import { getSocket } from '@/socket';
import startSound from "../sounds/button_start.wav";
import invalidSound from "../sounds/invalid_action.mp3";
import buildSound from "../sounds/building_tower.wav";
import sellSound from "../sounds/selling_tower.wav";
import useSound from '@/hooks/useSound';
import Scoreboard, { PlayerScore } from './ScoreBoard';
import { GameChat } from './GameChat';
import RoundResultsDialog from './RoundResultsDialog';
import FinalResultsDisplay from './FinalResultsDisplay';


interface MultiPlayerGameProps {
  settings: GameSettingsData,
  chatLog: ChatMessage[];
  onChatMessage: (message: string) => void;
  initialScore: RoundResult[] | null;
  players: PlayerData[];
}

const extractPlayerScores = (
  players: PlayerData[],
  roundResults: RoundResult[] | null
): PlayerScore[] => {

  if (!roundResults || roundResults.length === 0) {
    return players.map((player) => ({
      id: player.id,
      name: player.name,
      score: 0,
    }));
  }

  return roundResults.map((result) => ({
    id: result.player.id,
    name: result.player.name,
    score: result.duration,
  }));
};

const extractRound = (roundResults: RoundResult[] | null) => {
  if (roundResults && roundResults[0]){
    return roundResults[0].round + 1;
  }
  return 0;
}

export const MultiPlayerGame = ({
  settings, 
  chatLog,
  onChatMessage,
  initialScore,
  players
}: MultiPlayerGameProps) => {
  const [grid, setGrid] = useState<GridCell[][]>([])
  const [towers, setTowers] = useState<Tower[]>([])
  const [resources, setResources] = useState({ gold: 0, lumber: 0 });
  const [runnerPath, setRunnerPath] = useState<Position[]>([]);
  const [runnerStatus, setRunnerStatus] = useState<boolean[]>([]);
  const [runnerAngle, setRunnerAngle] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [clapEvents, setClapEvents] = useState<ClapEvent[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [stopwatch, setStopwatch] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [totalSimulationTime, setTotalSimulationTime] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState<RoundResult[] | null>(initialScore);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalResult, setFinalResult] = useState<FinalResults | null >(null);
  const [isRoundResultsDialogOpen, setIsRoundResultsDialogOpen] = useState(false);
  const playStartSound = useSound(startSound, 0.5);
  const playInvalidSound = useSound(invalidSound, 0.5);
  const playBuildSound = useSound(buildSound, 0.5);
  const playSellSound = useSound(sellSound, 0.5);
  
  const { rounds, duration: buildingTime } = settings;
  const playerScores = extractPlayerScores(players, currentScore);
  const round = extractRound(currentScore);

  useEffect(() => {
    const socket = getSocket();

    function onRoundStart(config: StartingState) {
      playStartSound();
      setGrid(config.grid);
      setTowers(config.towers);
      setResources({ gold: config.gold, lumber: config.lumber });
      
      setRunnerPath([]);
      setRunnerStatus([]);
      setRunnerAngle([]);
      setClapEvents([]);
      setIsRunning(false);
      setTotalSimulationTime(null);
      
      setCountdown(buildingTime);
      setIsStopwatchRunning(false);
    }

    const onRoundEnd = (result: RoundResult[]) => {
      setCurrentScore(result);
      setIsRoundResultsDialogOpen(true);
    };

    function onGameEnd(finalResult: FinalResults) {
      setFinalResult(finalResult);
      setGameEnded(true);
    }

    socket.on(GameActionEnum.SERVER_ROUND_CONFIG, onRoundStart);
    socket.on(GameActionEnum.SERVER_ROUND_RESULT, onRoundEnd);
    socket.on(GameActionEnum.SERVER_GAME_ENDED, onGameEnd);

    return () => {
      socket.off(GameActionEnum.SERVER_ROUND_CONFIG);
      socket.off(GameActionEnum.SERVER_ROUND_RESULT);
      socket.off(GameActionEnum.SERVER_GAME_ENDED);
    };
  }, [buildingTime, playStartSound]);

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

  const resultSentRef = useRef(false);
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    resultSentRef.current = false;
    
    if (isStopwatchRunning) {
      timer = setInterval(() => {
        setStopwatch(prevTime => {
          if (totalSimulationTime !== null && prevTime >= totalSimulationTime && !resultSentRef.current) {
            setIsStopwatchRunning(false);
            resultSentRef.current = true;
            
            const socket = getSocket();
            const finalState: StartingState = {
              height: grid.length > 0 ? grid.length : defaultHeight,
              width: grid.length > 0 ? grid[0].length : defaultWidth,
              grid: grid,
              towers: towers,
              gold: resources.gold,
              lumber: resources.lumber
            };
            
            socket.emit('game-action', { type: GameActionEnum.CLIENT_ROUND_RESULT, payload: finalState });
          }
          
          return totalSimulationTime !== null && prevTime >= totalSimulationTime
            ? totalSimulationTime
            : prevTime + 1;
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
        playSellSound();
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
      playBuildSound();
      positions.forEach(pos => {
        newGrid[pos.y][pos.x] = shiftPress ? GridCell.CLAP_TOWER : GridCell.BLOCK_TOWER;
      });
      setGrid(newGrid);
      setTowers([...towers, { type: shiftPress ? GridCell.CLAP_TOWER : GridCell.BLOCK_TOWER, positions }]);
      setResources({ gold: resources.gold - 1, lumber: resources.lumber - lumberCost });
    }
    else{
      playInvalidSound();
    }
  };

  const handleRunnerStart = () => {
    if (isRunning) {
      return;
    }
    
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
  
  return (
    <div className="flex flex-col lg:flex-row gap-2 items-start w-full">
      {!gameEnded && (
        <>
          <div className="flex flex-col space-y-4 w-96">
            <div>
              <Scoreboard
                players={playerScores}
                round={round}
                numRounds={settings.rounds}
              />
            </div>
            <div>
              <GameChat
                chatLog={chatLog}
                onSendMessage={onChatMessage}
              />
            </div>
          </div>
          <div className="max-w-[1200px]">
            <BaseGame
              startingState={{ width: defaultWidth, height: defaultHeight }}
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
              handleStartButton={null}
              handleReset={null}
              handleGenerateNew={null}
              handleShare={null}
              copied={false}
            />
          </div>
        </>
      )}
      {gameEnded && finalResult && (
        <div className="flex flex-col gap-4 w-full">
          <div className="w-full">
            <FinalResultsDisplay
              finalResults={finalResult}
              totalRounds={rounds}
            />
          </div>
          <div className="flex justify-left w-full">
            <div className="w-96">
              <GameChat
                chatLog={chatLog}
                onSendMessage={onChatMessage}
              />
            </div>
          </div>
        </div>
      )}

      <RoundResultsDialog
        players={playerScores}
        round={round}
        numRounds={settings.rounds}
        open={isRoundResultsDialogOpen}
        onOpenChange={setIsRoundResultsDialogOpen}
        autoCloseDelay={5000}
      />

    </div>
  );
}
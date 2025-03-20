import { useState, useEffect, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { canPlaceTower, canSellTower, ChatMessage, ClapEvent, defaultGoal, defaultHeight, defaultStart,
  defaultTimeStep, defaultWidth, FinalResults, findShortestPath, GameActionEnum, GameSettingsData, get2x2Positions, GridCell,
  pathExists,
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
import PlayerSelector from './PlayerSelector';


interface MultiPlayerGameProps {
  settings: GameSettingsData,
  chatLog: ChatMessage[];
  onChatMessage: (message: string) => void;
  initialScore: RoundResult[] | null;
  players: PlayerData[];
  player: { id: string, name: string };
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
    score: result.cumulativeDuration,
  }));
};

const extractRound = (roundResults: RoundResult[] | null) => {
  if (roundResults && roundResults[0]){
    return roundResults[0].round + 1;
  }
  return 0;
}

const resultById = (roundResults: RoundResult[], playerId: string): RoundResult | undefined => {
  return roundResults.find(result => result.player.id === playerId);
};

export const MultiPlayerGame = ({
  settings, 
  chatLog,
  onChatMessage,
  initialScore,
  players,
  player
}: MultiPlayerGameProps) => {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
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
  const [score, setscore] = useState<RoundResult[] | null>(initialScore);
  const [roundResult, setRoundResult] = useState<RoundResult[] | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalResult, setFinalResult] = useState<FinalResults | null >(null);
  const [isRoundResultsDialogOpen, setIsRoundResultsDialogOpen] = useState(false);

  const [selectedPlayerId, setSelectedPlayerId] = useState(player.id);
  const [selectedPlayerGrid, setSelectedPlayerGrid] = useState<GridCell[][]>([]);
  const [selectedPlayerTowers, setSelectedPlayerTowers] = useState<Tower[]>([]);
  const [selectedPlayerRunnerPath, setSelectedPlayerRunnerPath] = useState<Position[]>([]);
  const [selectedPlayerRunnerStatus, setSelectedPlayerRunnerStatus] = useState<boolean[]>([]);
  const [selectedPlayerRunnerAngle, setSelectedPlayerRunnerAngle] = useState<number[]>([]);
  const [selectedPlayerClapEvents, setSelectedPlayerClapEvents] = useState<ClapEvent[]>([]);


  const playStartSound = useSound(startSound, 0.5);
  const playInvalidSound = useSound(invalidSound, 0.5);
  const playBuildSound = useSound(buildSound, 0.5);
  const playSellSound = useSound(sellSound, 0.5);
  
  const { rounds, duration: buildingTime } = settings;
  const playerScores = extractPlayerScores(players, score);
  const round = extractRound(score);
  const resultSentRef = useRef(false);

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

      setSelectedPlayerId(player.id);
      setSelectedPlayerGrid([]);
      setSelectedPlayerTowers([]);
      setSelectedPlayerRunnerPath([]);
      setSelectedPlayerRunnerStatus([]);
      setSelectedPlayerRunnerAngle([]);
      setSelectedPlayerClapEvents([]);
    }

    const onRoundResult = (result: RoundResult[]) => {
      setRoundResult(result);
    };

    const onRoundEnd = (result : RoundResult[]) => {
      setscore(result);
      setIsRoundResultsDialogOpen(true);
    };

    function onGameEnd(finalResult: FinalResults) {
      setFinalResult(finalResult);
      setGameEnded(true);
    }

    socket.on(GameActionEnum.SERVER_ROUND_CONFIG, onRoundStart);
    socket.on(GameActionEnum.SERVER_ROUND_RESULT, onRoundResult);
    socket.on(GameActionEnum.SERVER_ROUND_ENDED, onRoundEnd);
    socket.on(GameActionEnum.SERVER_GAME_ENDED, onGameEnd);

    return () => {
      socket.off(GameActionEnum.SERVER_ROUND_CONFIG);
      socket.off(GameActionEnum.SERVER_ROUND_RESULT);
      socket.off(GameActionEnum.SERVER_ROUND_ENDED);
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
            if (!resultSentRef.current) {
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
            handleRunnerStart()
          }
          return newCountdown;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    resultSentRef.current = false;
    
    if (isStopwatchRunning) {
      timer = setInterval(() => {
        setStopwatch(prevTime => {
          if (totalSimulationTime !== null && prevTime >= totalSimulationTime && !resultSentRef.current) {
            setIsStopwatchRunning(false);
          }
          
          return totalSimulationTime !== null && prevTime >= totalSimulationTime
            ? totalSimulationTime
            : prevTime + 0.1;
        });
    }, 100);
  }
  
  return () => {
    if (timer) {
      clearInterval(timer);
    }
  };
}, [isStopwatchRunning, totalSimulationTime, grid, towers, resources]);

  const handleCellClick = (x: number, y: number, e: KonvaEventObject<MouseEvent>) => {
    if (isRunning) {
      return;
    }
    if (!pathExists(grid, defaultStart, defaultGoal, { x, y })) {
      playInvalidSound();
      return;
    }
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
    if (!path) {
      return;
    }
    
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

  const updateSelectedPlayer = (id: string) => {

    if (!roundResult || roundResult.length === 0) {
      return;
    }
    const results = resultById(roundResult, id);
    if (!results) {
      return;
    }

    setSelectedPlayerId(id);
    
    const playerGrid = results.finalMaze;
    const playerTowers = results.finalTowers;
    const playerPath = findShortestPath(playerGrid, defaultStart, defaultGoal);
    if (!playerPath) {
      return;
    }
    
    const timeSteps = simulateRunnerMovement(playerTowers, playerPath);
    const positions = timeSteps.map(step => step.position);
    const runnerStatus = timeSteps.map(step => step.isSlowed);
    const runnerAngle = timeSteps.map(step => step.angle);
    const claps = timeSteps.flatMap(step => step.claps || []);

    setSelectedPlayerGrid(playerGrid);
    setSelectedPlayerTowers(playerTowers);
    setSelectedPlayerRunnerPath(positions);
    setSelectedPlayerRunnerAngle(runnerAngle);
    setSelectedPlayerRunnerStatus(runnerStatus);
    setSelectedPlayerClapEvents(claps);
  }
  
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
            <div>
            <PlayerSelector
              players={playerScores}
              isAnimationPhase={isRunning}
              onSelectPlayer={updateSelectedPlayer}
              currentUserId={player.id}
              selectedPlayerId={selectedPlayerId}
            />
            </div>
          </div>
          <div className="max-w-[1200px]">
            {selectedPlayerId === player.id ? (
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
                startTime={stopwatch}
              />
            ) : (
              <BaseGame
                startingState={{ width: defaultWidth, height: defaultHeight }}
                towers={selectedPlayerTowers}
                grid={selectedPlayerGrid}
                handleCellClick={handleCellClick}
                runnerPath={selectedPlayerRunnerPath}
                runnerStatus={selectedPlayerRunnerStatus}
                runnerAngle={selectedPlayerRunnerAngle}
                isRunning={isRunning}
                clapEvents={selectedPlayerClapEvents}
                resources={resources}
                stopwatch={stopwatch}
                countdown={countdown}
                handleStartButton={null}
                handleReset={null}
                handleGenerateNew={null}
                handleShare={null}
                copied={false}
                startTime={stopwatch}
              />
            )}
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
        autoCloseDelay={settings.roundTransitionDelay*1000}
      />

    </div>
  );
}
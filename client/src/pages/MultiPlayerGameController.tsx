import { useState, useEffect } from 'react';
import { getSocket } from '@/socket';
import { ChatMessage, GameSettingsData, LobbyInformation, PlayerData, RoundResult } from '@mazing/util';
import { GameRoomView } from '../components/GameRoomView';
import { LobbyView } from '../components/LobbyView';
import { MultiPlayerGame } from '../components/MultiPlayerGame';
import startSound from "../sounds/button_start.wav";
import stopSound from "../sounds/button_stop.wav";
import useSound from '@/hooks/useSound';

export const MultiPlayerGameController = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [player, setPlayer] = useState<PlayerData>({ name: "", id: "" });
  const [availableGames, setAvailableGames] = useState<LobbyInformation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<LobbyInformation | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [initialScore, setInitialScore] = useState<RoundResult[] | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettingsData>({ rounds: 5, duration: 45, roundTransitionDelay: 5 });
  const startButtonClick = useSound(startSound, 0.5);
  const stopButtonClick = useSound(stopSound, 0.5);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    function onConnect(socketId: string | undefined) {
      setIsConnected(true);
      if (socketId) {
        setPlayer((prevPlayer) => ({
          ...prevPlayer,
          id: socketId,
        }));
      } else {
        console.warn("Socket ID is not available after connection.");
      }
    }    

    function onDisconnect() {
      setIsConnected(false);
    }

    function onGamesList(games: LobbyInformation[]) {
      setAvailableGames(games);
    }

    function onGameJoined(game: LobbyInformation) {
      setCurrentGame(game);
    }

    function onGameLeft() {
      setCurrentGame(null);
      setChatLog([]);
      setGameStarted(false);
    }
  
    function onPlayerUpdate(game: LobbyInformation) {
      setCurrentGame(game);
    }

    function onChatBroadcast(message: ChatMessage) {
      setChatLog((prevChatLog) => [...prevChatLog, message]);
    }

    function onGameStart(initialScore: RoundResult[]) {
      setInitialScore(initialScore);
      setGameStarted(true);
    }

    function onSettingsUpdate(settings: GameSettingsData) {
      setGameSettings(settings);
    }

    socket.on("connect", () => {
      onConnect(socket.id);
    });    
    socket.on('disconnect', onDisconnect);
    socket.on('list-games', onGamesList);
    socket.on('game-joined', onGameJoined);
    socket.on('game-left', onGameLeft);
    socket.on('player-update', onPlayerUpdate);
    socket.on('chat-broadcast', onChatBroadcast);
    socket.on('game-started', onGameStart);
    socket.on('update-settings', onSettingsUpdate);

    return () => {
      socket.off("connect", () => onConnect(socket.id));
      socket.off('disconnect', onDisconnect);
      socket.off('list-games', onGamesList);
      socket.off('game-joined', onGameJoined);
      socket.off('game-left', onGameLeft);
      socket.off('player-update', onPlayerUpdate);
      socket.off('chat-broadcast', onChatBroadcast);
      socket.off('game-start', onGameStart);
      socket.off('update-settings', onSettingsUpdate);
    };
  }, []);

  const handleHostGame = () => {
    if (!player.name.trim()) {
      setError('Please enter your name before hosting a game');
      return;
    }
    const socket = getSocket();
    socket?.emit('req-create-game', player.name);
  };

  const setPlayerNameAndClearError = (name: string) => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      name: name,
    }));
    if (error) {
      setError(null);
    }
  };

  const handleRequestJoinGame = (gameId: string) => {
    if (!player.name.trim()) {
      setError('Please enter your name before joining a game');
      return;
    }

    const socket = getSocket();
    socket?.emit('req-join-game', {
      gameId: gameId,
      playerData: {
        name: player.name,
        id: socket.id
      }
    });    
  };

  const handleLeaveGame = () => {
    stopButtonClick();
    const socket = getSocket();
    socket?.emit('req-leave-game', {
      gameId: currentGame?.gameId
    });
  };

  const handleStartGame = () => {
    startButtonClick();
    const socket = getSocket();
    socket?.emit('req-start-game', currentGame?.gameId)
  };

  const handleChatMessage = (message: string) => {
    const socket = getSocket();
    socket?.emit('req-chat-message', {
      message: message,
      sender: player.name,
      gameId: currentGame?.gameId,
    });
  }

  const clientSettingsUpdate = (settings: GameSettingsData) => {
    const socket = getSocket();
    socket?.emit('req-update-settings', { gameId: currentGame?.gameId, settings: settings })
  }

  if (gameStarted && currentGame) {
    return (
      <MultiPlayerGame 
        settings={gameSettings}
        chatLog={chatLog}
        onChatMessage={handleChatMessage}
        initialScore={initialScore}
        players={currentGame.players}
        player={player}
      />
    );
  } else if (currentGame) {
    return (
      <GameRoomView
        game={currentGame}
        player={player}
        onLeaveGame={handleLeaveGame}
        onStartGame={handleStartGame}
        onChatMessage={handleChatMessage}
        chatLog={chatLog}
        gameSettings={gameSettings}
        updateGameSettings={clientSettingsUpdate}
      />
    );
  }

  return (
    <LobbyView
      isConnected={isConnected}
      playerName={player.name}
      error={error}
      availableGames={availableGames}
      onHostGame={handleHostGame}
      onJoinGame={handleRequestJoinGame}
      setPlayerName={setPlayerNameAndClearError}
    />
  );
};

export default MultiPlayerGameController;
import { useState, useEffect } from 'react';
import { getSocket } from '@/socket';
import { ChatMessage, GameSettingsData, LobbyInformation, PlayerData, RoundResult } from '@mazing/util';
import { GameRoomView } from '../components/GameRoomView';
import { LobbyView } from '../components/LobbyView';
import { MultiPlayerGame } from '../components/MultiPlayerGame';
import startSound from "../sounds/button_start.wav";
import stopSound from "../sounds/button_stop.wav";
import useSound from '@/hooks/useSound';
import { getUserId, getUserName } from '@/user';

export const MultiPlayerGameController = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [player, setPlayer] = useState<PlayerData>({ name: getUserName(), id: getUserId(), connected: false });
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
    const socket = getSocket(player.id);
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        connected: true,
      }));
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
      onConnect();
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
      socket.off("connect", () => onConnect());
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
    const socket = getSocket(player.id);
    socket?.emit('req-create-game', player);
  };

  const setPlayerNameAndClearError = (name: string) => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      name: name,
    }));
    setError(null);
    localStorage.setItem("userName", name);
 
  };

  const handleRequestJoinGame = (gameId: string) => {
    if (!player.name.trim()) {
      setError('Please enter your name before joining a game');
      return;
    }

    const socket = getSocket(player.id);
    socket?.emit('req-join-game', gameId, player);    
  };

  const handleLeaveGame = () => {
    stopButtonClick();
    const socket = getSocket(player.id);
    socket?.emit('req-leave-game', currentGame?.gameId, player);
  };

  const handleStartGame = () => {
    startButtonClick();
    const socket = getSocket(player.id);
    socket?.emit('req-start-game', currentGame?.gameId, player)
  };

  const handleChatMessage = (message: string) => {
    const socket = getSocket(player.id);
    socket?.emit('req-chat-message',currentGame?.gameId, message, player, );
  }

  const clientSettingsUpdate = (settings: GameSettingsData) => {
    const socket = getSocket(player.id);
    socket?.emit('req-update-settings', currentGame?.gameId, settings, player)
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
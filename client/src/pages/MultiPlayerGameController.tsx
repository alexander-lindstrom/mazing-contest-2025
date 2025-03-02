import { useState, useEffect } from 'react';
import { getSocket } from '@/socket';
import { ChatMessage, LobbyInformation, RoundResult } from '@mazing/util';
import { GameRoomView } from '../components/GameRoomView';
import { LobbyView } from '../components/LobbyView';
import { MultiPlayerGame } from '../components/MultiPlayerGame';

export const MultiPlayerGameController = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [availableGames, setAvailableGames] = useState<LobbyInformation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<LobbyInformation | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [initialScore, setInitialScore] = useState<RoundResult[] | null>(null)

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    function onConnect() {
      setIsConnected(true);
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

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('list-games', onGamesList);
    socket.on('game-joined', onGameJoined);
    socket.on('game-left', onGameLeft);
    socket.on('player-update', onPlayerUpdate);
    socket.on('chat-broadcast', onChatBroadcast);
    socket.on('game-started', onGameStart);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('list-games', onGamesList);
      socket.off('game-joined', onGameJoined);
      socket.off('game-left', onGameLeft);
      socket.off('player-update', onPlayerUpdate);
      socket.off('chat-broadcast', onChatBroadcast);
      socket.off('game-start', onGameStart);
    };
  }, []);

  const handleHostGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name before hosting a game');
      return;
    }
    const socket = getSocket();
    socket?.emit('req-create-game', playerName);
  };

  const setPlayerNameAndClearError = (name: string) => {
    setPlayerName(name);
    if (error) {
      setError(null);
    }
  };

  const handleRequestJoinGame = (gameId: string) => {
    if (!playerName.trim()) {
      setError('Please enter your name before joining a game');
      return;
    }

    const socket = getSocket();
    socket?.emit('req-join-game', {
      gameId: gameId,
      playerData: {
        name: playerName,
        id: socket.id
      }
    });    
  };

  const handleLeaveGame = () => {
    const socket = getSocket();
    socket?.emit('req-leave-game', {
      gameId: currentGame?.gameId
    });
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket?.emit('req-start-game', currentGame?.gameId)
  };

  const handleChatMessage = (message: string) => {
    const socket = getSocket();
    socket?.emit('req-chat-message', {
      message: message,
      sender: playerName,
      gameId: currentGame?.gameId,
    });
  }

  if (gameStarted && currentGame) {
    return (
      <MultiPlayerGame 
        settings={{ rounds: 10, buildingTime: 15 }}
        chatLog={chatLog}
        onChatMessage={handleChatMessage}
        initialScore={initialScore}
      />
    );
  } else if (currentGame) {
    return (
      <GameRoomView
        game={currentGame}
        playerName={playerName}
        onLeaveGame={handleLeaveGame}
        onStartGame={handleStartGame}
        onChatMessage={handleChatMessage}
        chatLog={chatLog}
      />
    );
  }

  return (
    <LobbyView
      isConnected={isConnected}
      playerName={playerName}
      error={error}
      availableGames={availableGames}
      onHostGame={handleHostGame}
      onJoinGame={handleRequestJoinGame}
      setPlayerName={setPlayerNameAndClearError}
    />
  );
};

export default MultiPlayerGameController;
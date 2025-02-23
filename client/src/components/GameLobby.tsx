import { useState, useEffect } from 'react';
import { getSocket } from '@/socket';
import { ChatMessage, LobbyInformation } from '@mazing/util';
import { GameRoomView } from './GameRoomView';
import { LobbyView } from './LobbyView';



export const GameLobby = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [availableGames, setAvailableGames] = useState<LobbyInformation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<LobbyInformation | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);

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
    }
  
    function onPlayerUpdate(game: LobbyInformation) {
      setCurrentGame(game);
    }

    function onChatBroadcast(message: ChatMessage) {
      setChatLog((prevChatLog) => [...prevChatLog, message]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('list-games', onGamesList);
    socket.on('game-joined', onGameJoined);
    socket.on('game-left', onGameLeft);
    socket.on('player-update', onPlayerUpdate);
    socket.on('chat-broadcast', onChatBroadcast);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('list-games', onGamesList);
      socket.off('game-joined', onGameJoined);
      socket.off('game-left', onGameLeft);
      socket.off('player-update', onPlayerUpdate);
      socket.off('chat-broadcast', onChatBroadcast);
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
        name: playerName
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
    socket?.emit('req-start-game', {
      gameId: currentGame?.gameId
    });
  };

  const handleChatMessage = (message: string) => {
    const socket = getSocket();
    socket?.emit('req-chat-message', {
      message: message,
      sender: playerName,
      gameId: currentGame?.gameId,
    });
  }

  if (currentGame) {
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

export default GameLobby;
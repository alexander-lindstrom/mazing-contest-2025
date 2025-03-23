import { ChatMessage, GameAction, GameSettingsData, PlayerData } from "@mazing/util";
import { GameManager } from "./GameManager";
import { Server, Socket } from "socket.io";
import { LRUCache } from "lru-cache";

export function setupGameServer(io: Server): void {
  const gameManager = new GameManager(io);
  const userMap = new LRUCache({
    max: 10000,
    ttl: 30 * 60 * 1000 // 30min
  });

  io.on("connection", (socket: Socket) => {

    const userId = Array.isArray(socket.handshake.query.userId)
      ? socket.handshake.query.userId[0]
      : socket.handshake.query.userId;
    if (userId) {

      // Reconnection logic here
      // Check if part of a running game
      // ...
      userMap.set(userId, socket.id);
    }
    
    // initial info to client
    listGames(io, socket, gameManager, false);
    
    // event handlers
    socket.on("req-create-game", (player: PlayerData) => handleCreateGame(socket, player));
    socket.on("req-join-game", (gameId: string, player: PlayerData) => handleJoinGame(socket, gameId, player));
    socket.on("req-leave-game", (gameId: string, player: PlayerData) => handleLeaveGame(socket, gameId, player));
    socket.on("req-chat-message", (gameId: string, message: string, player: PlayerData) => handleChatMessage(gameId, message, player));
    socket.on("req-start-game", (gameId: string, player: PlayerData) => handleStartGame(socket, gameId, player));
    socket.on("req-update-settings", (gameId: string, settings: GameSettingsData, player: PlayerData) => handleSettingsReq(socket, gameId, settings, player));
    socket.on("game-action", (action: GameAction, player: PlayerData) => handleGameAction(socket, action, player));
    
    socket.on("disconnect", (reason: string) => handleDisconnect(socket, reason, userId));
  });

  function listGames(io: Server, socket: Socket, gameManager: GameManager, updateAll: boolean) {
    const availableGames = gameManager.getAvailableGames();
    updateAll ? io.emit("list-games", availableGames) : socket.emit("list-games", availableGames);
  }

  // Dont allow creating game if in one
  function handleCreateGame(socket: Socket, player: PlayerData) {
    if (!player.id || !player.name){
      console.error("Cannot create game!");
      return;
    }
    const game = gameManager.createGame(player);
    listGames(io, socket, gameManager, true);
    socket.emit("game-joined", game.getLobbyInformation());
    socket.join(game.id);
  }

  // Dont allow joining game if in one
  function handleJoinGame(socket: Socket, gameId: string, player: PlayerData) {

    const game = gameManager.joinGame(gameId, socket, player);
    if (!game || !player.id || !player.name) {
      console.error("Cannot join game!");
      return;
    }
    io.to(gameId).emit("player-update", game.getLobbyInformation());
    socket.emit("game-joined", game.getLobbyInformation());
    socket.join(game.id);
  }

  function handleLeaveGame(socket: Socket, gameId: string, player: PlayerData) {
    const game = gameManager.leaveGame(socket, player.id);
    if (game) {
      socket.leave(game.id);
      socket.emit("game-left");
      io.to(game.id).emit("player-update", game.getLobbyInformation());
      listGames(io, socket, gameManager, true);
    } else {
      console.error("Could not find game to leave!");
    }
  }

  function handleChatMessage(gameId: string, message: string, player: PlayerData) {
    const game = gameManager.getGameByPlayer(player.id);
    if (!game || game.id != gameId) {
      console.error("Cannot send chat message!");
      return;
    }
    const chatMessage: ChatMessage = { 
      sender: player.name, 
      message: message, 
      timestamp: Date.now() 
    };
    io.to(gameId).emit("chat-broadcast", chatMessage);
  }

  function handleSettingsReq(socket: Socket, gameId: string, settings: GameSettingsData, player: PlayerData) {
    gameManager.updateSettings(io, socket, gameId, settings, player);
  }

  function handleStartGame(socket: Socket, gameId: string, player: PlayerData) {
    gameManager.startGame(io, socket, gameId, player);
  }

  function handleGameAction(socket: Socket, action: GameAction, player: PlayerData) {
    gameManager.handleGameAction(io, socket, action, player);
  }

  function handleDisconnect(socket: Socket, reason: string, userId: string | undefined ) {

    if(!userId) {
      console.error("Cannot find userId on disconnect");
      return;
    }
    const game = gameManager.getGameByPlayer(userId)
    if (!game) {
      return;
    }
    game.updatePlayer(userId, false);
    gameManager.leaveGame(socket, userId)
    socket.leave(game.id);
    io.to(game.id).emit("player-update", game.getLobbyInformation());
  }
}
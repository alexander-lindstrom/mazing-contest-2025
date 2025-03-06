import { ChatMessage, ChatRequest, GameAction, PlayerData, UpdateSettingsRequest } from "@mazing/util";
import { GameManager } from "./GameManager";
import { Server, Socket } from "socket.io";

export function setupGameServer(io: Server): void {
  const gameManager = new GameManager(io);
  
  io.on("connection", (socket: Socket) => {
    
    // initial info to client
    listGames(io, socket, gameManager, false);
    
    // event handlers
    socket.on("req-create-game", (name: string) => handleCreateGame(socket, name));
    socket.on("req-join-game", (data: { gameId: string; playerData: PlayerData }) => handleJoinGame(socket, data));
    socket.on("req-leave-game", () => handleLeaveGame(socket));
    socket.on("req-chat-message", (req: ChatRequest) => handleChatMessage(req));
    socket.on("req-start-game", (gameId: string) => handleStartGame(socket, gameId));
    socket.on("req-update-settings", (req: UpdateSettingsRequest) => handleSettingsReq(socket, req));
    socket.on("game-action", (action: GameAction) => handleGameAction(socket, action));
    
    socket.on("disconnect", (reason: string) => handleDisconnect(socket, reason));
  });

  function listGames(io: Server, socket: Socket, gameManager: GameManager, updateAll: boolean) {
    const availableGames = gameManager.getAvailableGames();
    updateAll ? io.emit("list-games", availableGames) : socket.emit("list-games", availableGames);
  }

  function handleCreateGame(socket: Socket, name: string) {
    const game = gameManager.createGame({ name, id: socket.id });
    listGames(io, socket, gameManager, true);
    socket.emit("game-joined", game.getLobbyInformation());
    socket.join(game.id);
  }

  function handleJoinGame(socket: Socket, { gameId, playerData }: { gameId: string; playerData: PlayerData }) {

    const game = gameManager.joinGame(gameId, socket, playerData);
    io.to(gameId).emit("player-update", game.getLobbyInformation());
    socket.emit("game-joined", game.getLobbyInformation());
    socket.join(game.id);
  }

  function handleLeaveGame(socket: Socket) {
    const game = gameManager.leaveGame(socket);
    if (game) {
      socket.leave(game.id);
      socket.emit("game-left");
      io.to(game.id).emit("player-update", game.getLobbyInformation());
      listGames(io, socket, gameManager, true);
    } else {
      throw new Error("Could not find game to leave!");
    }
  }

  function handleChatMessage(req: ChatRequest) {
    const message: ChatMessage = { 
      sender: req.sender, 
      message: req.message, 
      timestamp: Date.now() 
    };
    io.to(req.gameId).emit("chat-broadcast", message);
  }

  function handleSettingsReq(socket: Socket, req: UpdateSettingsRequest) {
    gameManager.updateSettings(io, socket, req);
  }

  function handleStartGame(socket: Socket, gameId: string) {
    gameManager.startGame(io, socket, gameId);
  }

  function handleGameAction(socket: Socket, action: GameAction) {
    gameManager.handleGameAction(io, socket, action);
  }

  function handleDisconnect(socket: Socket, reason: string) {
    const game = gameManager.leaveGame(socket);
    if (game) {
      io.to(game.id).emit("player-update", game.getLobbyInformation());
    }
  }
}
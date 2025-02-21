import { PlayerData } from "./Game";
import { GameAction, GameManager } from "./GameManager";
import { Server, Socket } from "socket.io";


export function setupGameServer(io: Server): void {
    const gameManager = new GameManager(io);
  
    io.on('connection', (socket: Socket) => {
      socket.on('create-game', () => {
        const game = gameManager.createGame();
        socket.emit('game-created', game.serialize());
      });
  
      socket.on('join-game', ({ gameId, playerData }: { gameId: string, playerData: PlayerData }) => {
        try {
          const game = gameManager.joinGame(gameId, socket, playerData);
          // Broadcast to all players in the room
          io.to(gameId).emit('player-joined', game.serialize());
        } catch (error) {
          socket.emit('error', error instanceof Error ? error.message : 'Unknown error');
        }
      });
  
      socket.on('game-action', (action: GameAction) => {
        const game = gameManager.getGameByPlayer(socket.id);
        if (!game) {
          return;
        }
        gameManager.handleGameAction(socket, action);
      });
  
      socket.on('disconnect', () => {
        const game = gameManager.leaveGame(socket);
        if (game) {
          // Broadcast to remaining players in the room
          io.to(game.id).emit('player-left', game.serialize());
        }
      });
    });
  }
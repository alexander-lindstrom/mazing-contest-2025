import { PlayerData } from "./Game";
import { GameAction, GameManager } from "./GameManager";
import { Server, Socket } from "socket.io";


export function setupGameServer(io: Server): void {
    const gameManager = new GameManager(io);
  
    io.on('connection', (socket: Socket) => {

      //List available games
      const availableGames = gameManager.getGameIds();
      console.log(availableGames)
      socket.emit('list-games', availableGames);

      console.log('Client connected:', socket.id);

      socket.on('create-game', (playerData: PlayerData) => {
        console.log('Request to create game from:', playerData.name);
        const game = gameManager.createGame();
        gameManager.joinGame(game.id, socket, playerData)
        socket.emit('game-created', game.id);
      });
  
      socket.on('join-game', ({ gameId, playerData }: { gameId: string, playerData: PlayerData }) => {
        console.log("player wants to join game")
        try {
          const game = gameManager.joinGame(gameId, socket, playerData);
          // Broadcast to all players in the room
          io.to(gameId).emit('player-joined', playerData.name);
        } catch (error) {
          socket.emit('error', error instanceof Error ? error.message : 'Unknown error');
        }
      });
  
      socket.on('game-action', (action: GameAction) => {
        gameManager.handleGameAction(io, socket, action);
      });
  
      socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, reason);
        const game = gameManager.leaveGame(socket);
        if (game) {
          // Broadcast to remaining players in the room
          io.to(game.id).emit('player-left', game.serialize());
        }
      });

    });
  }
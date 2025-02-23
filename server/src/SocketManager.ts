import { PlayerData } from "@mazing/util";
import { GameAction, GameManager } from "./GameManager";
import { Server, Socket } from "socket.io";

function listGames(io: Server, socket: Socket, gameManager: GameManager, updateAll: boolean){

  const availableGames = gameManager.getAvailableGames();
  if (updateAll) {
    io.emit('list-games', availableGames);
  }
  else {
    socket.emit('list-games', availableGames);
  }
}

export function setupGameServer(io: Server): void {
    const gameManager = new GameManager(io);
  
    io.on('connection', (socket: Socket) => {

      listGames(io, socket, gameManager, false);
      console.log('Client connected:', socket.id);

      socket.on('req-create-game', (playerData: PlayerData) => {
        console.log('Request to create game from:', playerData.name);

        const game = gameManager.createGame(playerData);
        gameManager.joinGame(game.id, socket, playerData)
        listGames(io, socket, gameManager, true);

        socket.emit('game-joined', game.getLobbyInformation())
        socket.join(game.id);
      });
  
      socket.on('req-join-game', ({ gameId, playerData }: { gameId: string, playerData: PlayerData }) => {
        console.log("player wants to join game")
        try {
          const game = gameManager.joinGame(gameId, socket, playerData);

          io.to(gameId).emit('player-joined', game.getLobbyInformation());
  
          socket.emit('game-joined', game.getLobbyInformation())
          socket.join(game.id);

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
          io.to(game.id).emit('player-update', game.getLobbyInformation());
        }
      });

    });
  }
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { Game, GameStatusEnum, PlayerData } from './Game';
import { defaultGoal, defaultStart, defaultTimeStep, findShortestPath, generateStartingState, simulateRunnerMovement, StartingState, validateRoundResult } from '@mazing/util';

enum GameActionEnum {
  CLIENT_START = 'CLIENT_START',
  CLIENT_SUBMIT_RESULT = 'CLIENT_SUBMIT_RESULT',

  SERVER_START_GAME = 'SERVER_START_GAME',
  SERVER_SEND_ROUND_CONFIG = 'SERVER_SEND_ROUND_CONFIG',
  SERVER_SEND_ROUND_RESULT = 'SERVER_SEND_ROUND_RESULT',
  SERVER_START_NEXT_ROUND = 'SERVER_START_NEXT_ROUND'
}

export interface GameAction {
  type: GameActionEnum;
  payload: any;
}

export class GameManager {
  private games: Map<string, Game>;
  private playerToGame: Map<string, string>;
  private io: Server;

  constructor(io: Server) {
    this.games = new Map();
    this.playerToGame = new Map();
    this.io = io;
    
    // Auto-cleanup of finished games after 5 minutes
    setInterval(() => this.cleanupFinishedGames(), 5 * 60 * 1000);
  }

  createGame(gameId: string = randomUUID()): Game {
    if (this.games.has(gameId)) {
      throw new Error('Game ID already exists');
    }
    const game = new Game(gameId);
    this.games.set(gameId, game);
    return game;
  }

  joinGame(gameId: string, socket: Socket, playerData: PlayerData): Game {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Todo: make sure that player is not already part of a game
    game.addPlayer(socket.id, playerData);
    this.playerToGame.set(socket.id, gameId);
    
    socket.join(gameId);
    
    return game;
  }

  leaveGame(socket: Socket): Game | null {
    const gameId = this.playerToGame.get(socket.id);
    if (!gameId) return null;

    const game = this.games.get(gameId);
    if (!game) return null;

    const remainingPlayers = game.removePlayer(socket.id);
    this.playerToGame.delete(socket.id);
    
    // Leave the Socket.IO room
    socket.leave(gameId);

    // Auto-cleanup empty games
    if (remainingPlayers === 0) {
      this.games.delete(gameId);
    }

    return game;
  }

  getGameByPlayer(socketId: string): Game | null {
    const gameId = this.playerToGame.get(socketId);
    return gameId ? this.games.get(gameId) || null : null;
  }

  getGame(gameId: string): Game | null {
    return this.games.get(gameId) || null;
  }

  private cleanupFinishedGames(): void {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    for (const [gameId, game] of this.games.entries()) {
      const gameState = game.getState();
      if (gameState.status === 'finished' && 
          gameState.lastUpdateTime && 
          gameState.lastUpdateTime < fiveMinutesAgo) {
        // Notify all players in the room before cleanup
        this.io.to(gameId).emit('game-cleaned-up', { gameId });
        
        // Remove all player mappings for this game
        for (const [socketId] of game.serialize().players) {
          this.playerToGame.delete(socketId);
        }
        this.games.delete(gameId);
      }
    }
  }

  getStats() {
    return {
      totalGames: this.games.size,
      totalPlayers: this.playerToGame.size,
      games: Array.from(this.games.values()).map(game => ({
        id: game.id,
        players: game.getPlayerCount(),
        status: game.serialize().state.status
      }))
    };
  }

  handleGameAction(io: Server, socket: Socket, action: GameAction) {

    const game = this.getGameByPlayer(socket.id);
    if (!game){
      throw new Error("Player not part of a game!")
    }

    switch(action.type) {
        case GameActionEnum.CLIENT_START:
            this.handleClientStart(io, socket, game);
            break;
        case GameActionEnum.CLIENT_SUBMIT_RESULT:
            this.handleClientSubmitResult(io, socket, game, action);
            break;

        default:
            throw new Error("No such game action!");
    }
}

  private handleClientStart(io: Server, socket: Socket, game: Game){

    // Todo: only game owner should be able to start
    if (!game.canStart){
      throw new Error ("Game cannot start!");
    }
      
    const config = generateStartingState();
    game.updateGameState({
      status: GameStatusEnum.RUNNING,
      startTime: Date.now(),
      startingConfigs: [config]
    });
    io.to(game.id).emit(GameActionEnum.SERVER_START_GAME);
    io.to(game.id).emit(GameActionEnum.SERVER_SEND_ROUND_CONFIG, config);
  }

  private handleClientSubmitResult(io: Server, socket: Socket, game: Game, action: GameAction){

    if (game.getState().status !== GameStatusEnum.RUNNING) {
      throw new Error("Cannot submit result for game which is not running!");
    }

    const initialConfig = game.getStartingConfig();
    const finalResult = action.payload as StartingState;

    const path = findShortestPath(finalResult.grid, defaultStart, defaultGoal);
    
    if (!validateRoundResult(initialConfig, finalResult) || !path) {
      throw new Error("Invalid round result!");
    }

    const duration = simulateRunnerMovement(false, [], path).length * defaultTimeStep;
    game.setResult(socket.id, { duration, finalMaze: finalResult.grid });
    if (game.allResultsReceived()) {
      io.to(game.id).emit(GameActionEnum.SERVER_SEND_ROUND_RESULT, game.getResultsForCurrentRound);
    }

  }
}

import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { Game } from './Game';
import { defaultGoal, defaultStart, defaultTimeStep, findShortestPath, GameAction, GameActionEnum, GameStatusEnum, generateStartingState,
   LobbyInformation, PlayerData, simulateRunnerMovement, StartingState, UpdateSettingsRequest, validateRoundResult } from '@mazing/util';

export class GameManager {
  private games: Map<string, Game>;
  private playerToGame: Map<string, string>;

  constructor(io: Server) {
    this.games = new Map();
    this.playerToGame = new Map();
    
    setInterval(() => this.cleanupFinishedGames(), 5 * 60 * 1000);
  }

  createGame(host: PlayerData): Game {

    const gameId = randomUUID();
    if (this.games.has(gameId)) {
      throw new Error('Game ID already exists');
    }
    const game = new Game(gameId, host);
    this.games.set(gameId, game);

    this.playerToGame.set(host.id, gameId);
    return game;
  }

  joinGame(gameId: string, socket: Socket, playerData: PlayerData): Game {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.getState().status !== GameStatusEnum.WAITING) {
      throw new Error("Cannot join started game!");
    }
    
    game.addPlayer(socket.id, playerData);
    this.playerToGame.set(socket.id, gameId);
    
    socket.join(gameId);
    return game;
  }

  leaveGame(socket: Socket): Game | null {
    const gameId = this.playerToGame.get(socket.id);

    if (!gameId) {
      return null;
    }

    const game = this.games.get(gameId);
    if (!game) {
      return null;
    }

    const remainingPlayers = game.removePlayer(socket.id);
    this.playerToGame.delete(socket.id);

    if (remainingPlayers === 0) {
      this.games.delete(gameId);
    }

    return game;
  }

  getGameByPlayer(socketId: string): Game | null {
    const gameId = this.playerToGame.get(socketId);
    return gameId ? this.games.get(gameId) || null : null;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  getAvailableGames(): LobbyInformation[] {
    return Array.from(this.games.values()).map(game => game.getLobbyInformation());
  }      

  handleGameAction(io: Server, socket: Socket, action: GameAction) {

    const game = this.getGameByPlayer(socket.id);
    if (!game){
      throw new Error("Player not part of a game!")
    }

    switch(action.type) {
        case GameActionEnum.CLIENT_ROUND_RESULT:
            this.handleClientSubmitResult(io, socket, game, action);
            break;

        default:
            throw new Error("No such game action!");
    }
  }

   startGame(io: Server, socket: Socket, gameId: string) {

    const game = this.getGame(gameId);
    if (!game || !game.canStart(socket.id)) {
      throw new Error ("Game cannot start!");
    }
      
    game.startGame();
    io.to(game.id).emit('game-started', game.getResultsForCurrentRound());
    io.to(game.id).emit(GameActionEnum.SERVER_ROUND_CONFIG, game.getConfig());
  }

  updateSettings(io: Server, socket: Socket, req: UpdateSettingsRequest) {
    const game = this.getGame(req.gameId);
    if (!game) {
      throw new Error("Game not found!");
    }
    if (!game.isHost(socket.id)) {
      throw new Error("Only host can change settings!");
    }
    io.to(req.gameId).emit("update-settings", { rounds: req.settings.rounds, duration: req.settings.duration });
  }

  private cleanupFinishedGames(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [gameId, game] of this.games.entries()) {
      if (game.getState().creationTime < oneHourAgo) {
        this.games.delete(gameId);
      }
    }
  }

  private handleClientSubmitResult(io: Server, socket: Socket, game: Game, action: GameAction){

    console.log("ASDSA")

    if (game.getState().status !== GameStatusEnum.RUNNING) {
      throw new Error("Cannot send result for game which is not running!");
    }

    const finalResult = action.payload as StartingState;
    const path = findShortestPath(finalResult.grid, defaultStart, defaultGoal);
    
    if (!validateRoundResult(game.getConfig(), finalResult) || !path) {
      throw new Error("Invalid round result!");
    }

    const duration = simulateRunnerMovement([], path).length * defaultTimeStep;
    game.setResult(socket.id, { duration, finalMaze: finalResult.grid, player: game.getPlayerData(socket.id) });
    if (game.allResultsReceived()) {
      io.to(game.id).emit(GameActionEnum.SERVER_ROUND_RESULT, game.getResultsForCurrentRound());
      if (game.startNextRound()) {
        io.to(game.id).emit(GameActionEnum.SERVER_ROUND_CONFIG, game.getConfig())
      }
      else{
        io.to(game.id).emit(GameActionEnum.SERVER_GAME_ENDED, game.getFinalResults());
      }
    }
  }
}

import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { Game } from './Game';
import { defaultGoal, defaultStart, defaultTimeStep, findShortestPath, GameAction, GameActionEnum, GameSettingsData, GameStatusEnum, generateStartingState,
   LobbyInformation, PlayerData, simulateRunnerMovement, StartingState, validateRoundResult } from '@mazing/util';

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
    const game = new Game(gameId, host);
    this.games.set(gameId, game);

    this.playerToGame.set(host.id, gameId);
    return game;
  }

  joinGame(gameId: string, socket: Socket, player: PlayerData): Game | undefined{
    const game = this.games.get(gameId);
    if (!game) {
      console.error('Game not found');
      return;
    }

    if (game.getState().status !== GameStatusEnum.WAITING) {
      console.error("Cannot join started game!");
    }
    
    game.addPlayer(player);
    this.playerToGame.set(player.id, gameId);
    
    socket.join(gameId);
    return game;
  }

  leaveGame(socket: Socket, playerId: string): Game | null {
    const gameId = this.playerToGame.get(playerId);

    if (!gameId) {
      return null;
    }

    const game = this.games.get(gameId);
    if (!game) {
      return null;
    }

    const remainingPlayers = game.removePlayer(playerId);
    this.playerToGame.delete(playerId);

    if (remainingPlayers === 0) {
      this.games.delete(gameId);
    }

    return game;
  }

  getGameByPlayer(playerId: string): Game | null {
    const gameId = this.playerToGame.get(playerId);
    return gameId ? this.games.get(gameId) || null : null;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  getAvailableGames(): LobbyInformation[] {
    return Array.from(this.games.values()).map(game => game.getLobbyInformation());
  }      

  handleGameAction(io: Server, socket: Socket, action: GameAction, player: PlayerData) {

    const game = this.getGameByPlayer(player.id);
    if (!game){
      console.error("Player not part of a game!")
      return;
    }

    switch(action.type) {
        case GameActionEnum.CLIENT_ROUND_RESULT:
            this.handleClientSubmitResult(io, socket, game, action, player);
            break;

        default:
            console.error("No such game action!");
    }
  }

   startGame(io: Server, socket: Socket, gameId: string, player: PlayerData) {

    const game = this.getGame(gameId);
    if (!game || !game.canStart(player.id)) {
      console.error ("Game cannot start!");
      return;
    }
      
    game.startGame();
    io.to(game.id).emit('game-started', game.getResultsForCurrentRound());
    io.to(game.id).emit(GameActionEnum.SERVER_ROUND_CONFIG, game.getConfig());
  }

  updateSettings(io: Server, socket: Socket, gameId: string, settings: GameSettingsData, player: PlayerData) {
    const game = this.getGame(gameId);
    if (!game) {
      console.error("Game not found!");
      return;
    }
    if (!game.isHost(player.id)) {
      console.error("Only host can change settings!");
      return;
    }
    game.updateSettings(settings);
    io.to(gameId).emit("update-settings", settings);
  }

  private cleanupFinishedGames(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [gameId, game] of this.games.entries()) {
      if (game.getState().creationTime < oneHourAgo) {
        this.games.delete(gameId);
      }
    }
  }

delay(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

  private async handleClientSubmitResult(io: Server, socket: Socket, game: Game, action: GameAction, player: PlayerData) {
    if (game.getState().status !== GameStatusEnum.RUNNING) {
      console.error("Cannot send result for game which is not running!");
      return;
    }

    const finalResult = action.payload as StartingState;
    const path = findShortestPath(finalResult.grid, defaultStart, defaultGoal);

    if (!validateRoundResult(game.getConfig(), finalResult) || !path) {
      console.error("Invalid round result!");
      // Todo: what should happen here?
      return;
    }

    const duration = simulateRunnerMovement(finalResult.towers, path).length * defaultTimeStep;
    const storedPlayer = game.getPlayerData(player.id);
    if (!storedPlayer) {
      console.error("Player not found!");
      return;
    }

    game.setResult(storedPlayer.id, { duration, finalMaze: finalResult.grid, player, finalTowers: finalResult.towers });

    if (game.allResultsReceived()) {

      const results = game.getResultsForCurrentRound();
      io.to(game.id).emit(GameActionEnum.SERVER_ROUND_RESULT, results);

      const longestDuration = results.reduce((maxDuration, roundResult) => {
        return roundResult.duration > maxDuration ? roundResult.duration : maxDuration;
      }, 0);
      const grace = 2;
      await this.delay(longestDuration + 2);
      
      io.to(game.id).emit(GameActionEnum.SERVER_ROUND_ENDED, results);
      await this.delay(game.getState().roundTransitionDelay);

      if (game.startNextRound()) {
        io.to(game.id).emit(GameActionEnum.SERVER_ROUND_CONFIG, game.getConfig());
      } else {
        io.to(game.id).emit(GameActionEnum.SERVER_GAME_ENDED, game.getFinalResults());
      }
    }
  } 
}

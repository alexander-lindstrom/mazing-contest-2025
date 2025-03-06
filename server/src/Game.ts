import { FinalResult, FinalResults, GameStatusEnum, generateStartingState, GridCell, LobbyInformation, PlayerData, RoundResult, StartingState } from "@mazing/util";

interface GameState {
  status: GameStatusEnum;
  startTime: number | null;
  creationTime: number;
  rounds: number;
  currentRound: number; // zero-indexed
  results: Map<string, Result[]>;
  startingConfigs: StartingState[];
}

export interface Result {
  player: PlayerData;
  duration: number;
  finalMaze: GridCell[][];
}

export class Game {
  public readonly id: string;
  private readonly maxPlayers: number;
  private players: Map<string, PlayerData>;
  private state: GameState;
  private host: PlayerData;

  constructor(id: string, host: PlayerData, maxPlayers: number = 8, rounds: number = 5) {
    this.id = id;
    this.maxPlayers = maxPlayers;
    this.players = new Map([[host.id, host]]);
    this.host = host;
    this.state = {
      status: GameStatusEnum.WAITING,
      startTime: null,
      creationTime: Date.now(),
      rounds: rounds,
      currentRound: 0,
      results: new Map(),
      startingConfigs: [],
    };

    this.state.results.set(host.id, []);
  }

  addPlayer(socketId: string, playerData: PlayerData): number {
    if (this.players.has(socketId)) {
        throw new Error('Player already added');
    }

    if (this.players.size >= this.maxPlayers) {
        throw new Error('Game is full');
    }

    this.players.set(socketId, playerData);
    this.state.results.set(socketId, []);

    return this.players.size;
}

  removePlayer(socketId: string): number {
    this.players.delete(socketId);
    return this.players.size;
  }

  generateRoundConfig() {
    const config = generateStartingState();
    this.state.startingConfigs[this.state.currentRound] = config;
  }

  startNextRound(): boolean {
    if (this.state.currentRound + 1 === this.state.rounds) {
      return false;
    }
    this.state.currentRound++;
    this.generateRoundConfig();
    return true;
  }

  startGame() {
    this.state.status = GameStatusEnum.RUNNING;
    this.state.startTime = Date.now();
    this.generateRoundConfig();
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  isHost(id: string) {
    return id === this.host.id;
  }

  getPlayerData(id: string){
    const player = this.players.get(id);
    if (!player) {
      throw new Error("Couldn't get player!");
    }
    return player;
  }

  getState(): GameState {
    return this.state;
  }

  canStart(playerId: string): boolean {
    return playerId === this.host.id && this.players.size >= 2 && this.state.status === 'waiting';
  }

  getConfig(): StartingState {
    return this.state.startingConfigs[this.state.currentRound];
  }

  setResult(playerId: string, result: Result){
    const player = this.state.results.get(playerId);
    if (!player){
      throw new Error("Player not found!");
    }
    player.push(result);
  }

  allResultsReceived(){
    return Array.from(this.state.results.values()).every(resultsArray => 
      resultsArray[this.state.currentRound] !== undefined
    );
  }

  getResultsForCurrentRound(): RoundResult[] {
    return Array.from(this.state.results.values())
      .map(resultsArray => {
        const currentRound = this.state.currentRound;
        if (!resultsArray[currentRound]) return undefined;
  
        const cumulativeDuration = resultsArray
          .slice(0, currentRound + 1)
          .reduce((sum, result) => sum + result.duration, 0);
  
        return { ...resultsArray[currentRound], cumulativeDuration, round: currentRound };
      })
      .filter((result): result is RoundResult => result !== undefined);
  }

  public getFinalResults(): FinalResults {
    const finalResults: FinalResult[] = [];

    this.state.results.forEach((results, playerId) => {
      const player = this.players.get(playerId);
      if (player) {
        const durations = results.map(result => result.duration);
        
        const finalResult: FinalResult = {
          player,
          durations,
        };

        finalResults.push(finalResult);
      }
    });

    return {
      players: finalResults,
    };
  }
  
  getLobbyInformation(): LobbyInformation {
    return {
      host: this.host,
      gameId: this.id,
      gameStatus: this.state.status,
      numPlayers: this.players.size,
      players: Array.from(this.players.entries()).map(([id, player]) => ({
        id,
        name: player.name,
      })),
    };
  }  
}
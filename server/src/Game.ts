import { GridCell, LobbyInformation, PlayerData, StartingState } from "@mazing/util";

interface Result {
  duration: number;
  finalMaze: GridCell[][];
}

export enum GameStatusEnum {
  WAITING = 'waiting',
  RUNNING = 'running',
  FINISHED = 'finished'
}

interface GameState {
  status: GameStatusEnum;
  startTime: number | null;
  lastUpdateTime: number | null;
  rounds: number;
  currentRound: number; // zero-indexed
  results: Map<string, Result[]>;
  startingConfigs: StartingState[];
}

export class Game {
  public readonly id: string;
  private readonly maxPlayers: number;
  private players: Map<string, PlayerData>;
  private state: GameState;
  private host: PlayerData;

  constructor(id: string, host: PlayerData, maxPlayers: number = 8, rounds: number = 10) {
    this.id = id;
    this.maxPlayers = maxPlayers;
    this.players = new Map([[host.id, host]]);
    this.host = host;
    this.state = {
      status: GameStatusEnum.WAITING,
      startTime: null,
      lastUpdateTime: null,
      rounds: rounds,
      currentRound: 0,
      results: new Map(),
      startingConfigs: [],
    };
  }

  addPlayer(socketId: string, playerData: PlayerData): number {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Game is full');
    }
    this.players.set(socketId, playerData);
    return this.players.size;
  }

  removePlayer(socketId: string): number {
    this.players.delete(socketId);
    return this.players.size;
  }

  updateGameState(newState: Partial<GameState>): void {
    this.state = {
      ...this.state,
      ...newState,
      lastUpdateTime: Date.now()
    };
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  getState(): GameState {
    return this.state;
  }

  canStart(): boolean {
    return this.players.size >= 2 && this.state.status === 'waiting';
  }

  getStartingConfig(): StartingState {
    return this.state.startingConfigs[this.state.currentRound];
  }

  setResult(playerId: string, result: Result){
    this.state.results.get(playerId)?.push(result);
  }

  allResultsReceived(){
    return Array.from(this.state.results.values()).every(resultsArray => 
      resultsArray[this.state.currentRound] !== undefined
    );
  }

  getResultsForCurrentRound(): Result[] {
    return Array.from(this.state.results.values())
      .map(resultsArray => resultsArray[this.state.currentRound])
      .filter(result => result !== undefined);
  }
  
  getLobbyInformation(): LobbyInformation{
    return {
      host: this.host,
      gameId: this.id,
      numPlayers: this.players.size,
      playerNames: Array.from(this.players.values()).map(player => player.name),
    }
  }

  serialize() {
    return {
      id: this.id,
      playerCount: this.players.size,
      players: Array.from(this.players.entries()),
      state: this.state
    };
  }
}
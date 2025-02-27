import { GameStatusEnum, GridCell, LobbyInformation, PlayerData, RoundResult, StartingState } from "@mazing/util";

interface GameState {
  status: GameStatusEnum;
  startTime: number | null;
  lastUpdateTime: number | null;
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
    this.state.results.get(playerId)?.push(result);
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
  
        return { ...resultsArray[currentRound], cumulativeDuration };
      })
      .filter((result): result is RoundResult => result !== undefined);
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

  serialize() {
    return {
      id: this.id,
      playerCount: this.players.size,
      players: Array.from(this.players.entries()),
      state: this.state
    };
  }
}
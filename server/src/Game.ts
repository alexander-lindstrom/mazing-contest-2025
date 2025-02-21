import { GridCell, StartingState } from "@mazing/util";

export interface PlayerData {
  name: string;
}

interface Result {
  duration: number;
  finalMaze: GridCell[][];
}

interface GameState {
  status: 'waiting' | 'running' | 'finished';
  startTime: number | null;
  lastUpdateTime: number | null;
  rounds: number;
  currentRound: number;
  results: Map<string, Result>;
  startingConfigs: StartingState[];
}

export class Game {
  public readonly id: string;
  private readonly maxPlayers: number;
  private players: Map<string, PlayerData>;
  private state: GameState;

  constructor(id: string, maxPlayers: number = 8, rounds: number = 10) {
    this.id = id;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.state = {
      status: 'waiting',
      startTime: null,
      lastUpdateTime: null,
      rounds: rounds,
      currentRound: 1,
      results: new Map(),
      startingConfigs: []
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

  // State updates
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

  serialize() {
    return {
      id: this.id,
      playerCount: this.players.size,
      players: Array.from(this.players.entries()),
      state: this.state
    };
  }
}
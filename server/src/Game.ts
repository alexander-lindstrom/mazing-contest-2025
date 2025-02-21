export interface PlayerData {
  name: string;
}

interface GameState {
  status: 'waiting' | 'running' | 'finished';
  gameData: Record<string, any>;
  startTime: number | null;
  lastUpdateTime: number | null;
}

export enum GameActionEnum {
  CLIENT_START,
  CLIENT_SUBMIT_RESULT,

  SERVER_START_GAME,
  SERVER_SEND_ROUND_CONFIG,
  SERVER_SEND_ROUND_RESULT,
}

export interface GameAction {
  type: GameActionEnum;
  payload: any;
}

export class Game {
  public readonly id: string;
  private readonly maxPlayers: number;
  private players: Map<string, PlayerData>;
  private state: GameState;

  constructor(id: string, maxPlayers: number = 8) {
    this.id = id;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.state = {
      status: 'waiting',
      gameData: {},
      startTime: null,
      lastUpdateTime: null
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

  serialize() {
    return {
      id: this.id,
      playerCount: this.players.size,
      players: Array.from(this.players.entries()),
      state: this.state
    };
  }
}
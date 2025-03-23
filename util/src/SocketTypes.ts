import { GridCell, Tower } from "./Grid";

export enum GameActionEnum {

  CLIENT_ROUND_RESULT = 'client-round-result',

  SERVER_ROUND_CONFIG = 'server-round-config',
  SERVER_ROUND_RESULT = 'server-round-result',
  SERVER_ROUND_ENDED = 'server-round-ended',
  SERVER_GAME_ENDED = 'server-game-ended'
}

export interface PlayerData {
  name: string;
  id: string;
  connected: boolean;
}

export interface LobbyInformation {
  gameId: string,
  gameStatus: GameStatusEnum,
  host: PlayerData,
  numPlayers: number,
  players: PlayerData[],
}

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}

// Rename to something more reasonable
export interface RoundResult {
  round: number;
  player: PlayerData;
  duration: number;
  cumulativeDuration: number
  finalMaze: GridCell[][];
  finalTowers: Tower[];
}

export enum GameStatusEnum {
  WAITING = 'waiting',
  RUNNING = 'running',
  FINISHED = 'finished'
}

export interface GameAction {
  type: GameActionEnum;
  payload: any;
}

export interface FinalResult {
  player: PlayerData;
  durations: number[];
}

export interface FinalResults {
  players: FinalResult[];
}

export interface GameSettingsData {
  rounds: number;
  duration: number;
  roundTransitionDelay: number;
}


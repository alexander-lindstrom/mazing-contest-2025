import { GridCell } from "./Grid";

export enum GameActionEnum {

  CLIENT_ROUND_RESULT = 'client-round-result',

  SERVER_ROUND_CONFIG = 'server-round-config',
  SERVER_ROUND_RESULT = 'server-round-result',
  SERVER_GAME_ENDED = 'server-game-ended'
}

export interface PlayerData {
  name: string;
  id: string;
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

export interface ChatRequest {
  gameId: string;
  message: string;
  sender: string;
}

export interface RoundResult {
  round: number;
  player: PlayerData;
  duration: number;
  cumulativeDuration: number
  finalMaze: GridCell[][];
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
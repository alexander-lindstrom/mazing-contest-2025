export enum GameActionEnum {

  CLIENT_ROUND_RESULT = 'client-round-result',

  SERVER_ROUND_CONFIG = 'server-round-config',
  SERVER_ROUND_RESULT = 'server-round-result',
  SERVER_FINAL_RESULT = 'server-final-result'
}

export interface PlayerData {
  name: string;
  id: string;
}

export interface LobbyInformation {
  gameId: string,
  host: PlayerData,
  numPlayers: number,
  playerNames: string[],
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
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
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
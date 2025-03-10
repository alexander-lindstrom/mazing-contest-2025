import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChatMessage, GameSettingsData, LobbyInformation } from '@mazing/util';
import GameSettings from './GameSettings';
import { GameChat } from './GameChat';
import PlayersList from './PlayersList';

interface GameRoomViewProps {
  game: LobbyInformation;
  playerName: string;
  onLeaveGame: () => void;
  onStartGame: () => void;
  onChatMessage: (message: string) => void;
  chatLog: ChatMessage[];
  gameSettings: GameSettingsData;
  updateGameSettings: (settings: GameSettingsData) => void;
}

export const GameRoomView = ({
  game,
  playerName,
  onLeaveGame,
  onStartGame,
  onChatMessage,
  chatLog,
  gameSettings,
  updateGameSettings,
}: GameRoomViewProps) => {
  const isHost = game.host.name === playerName;

  const handleSettingsChange = (newSettings: GameSettingsData) => {
    updateGameSettings(newSettings);
  };

  const players = game.players.map((player) => ({
    name: player.name,
    isHost: player.name === game.host.name,
  }));

  return (
    <div className="max-w-5xl mx-auto p-8">
      <Card className="w-full bg-slate-800 p-6 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-left text-white font-mono font-bold text-xl">
            Game Room: {game.gameId.substring(0, 8)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PlayersList players={players} />

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <GameChat chatLog={chatLog} onSendMessage={onChatMessage} />
              </div>

              <div className="md:col-span-1">
                <GameSettings
                  settings={gameSettings}
                  onSettingsChange={handleSettingsChange}
                  isHost={isHost}
                />
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-slate-600" />

          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={onLeaveGame}
              className="bg-red-500 text-white font-mono font-bold py-3 px-5 rounded-lg hover:bg-red-600 transition-colors text-lg"
            >
              Leave Game
            </Button>
            {isHost && (
              <Button
                disabled={game.numPlayers < 2}
                onClick={onStartGame}
                className="bg-green-500 text-white font-mono font-bold py-3 px-5 rounded-lg hover:bg-green-600 transition-colors text-lg"
              >
                Start Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
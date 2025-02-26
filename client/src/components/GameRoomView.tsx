import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChatMessage, LobbyInformation } from '@mazing/util';
import { ChatRoom } from './ChatRoom'; // Import the new component

interface GameRoomViewProps {
  game: LobbyInformation;
  playerName: string;
  onLeaveGame: () => void;
  onStartGame: () => void;
  onChatMessage: (message: string) => void;
  chatLog: ChatMessage[];
}

export const GameRoomView = ({
  game,
  playerName,
  onLeaveGame,
  onStartGame,
  onChatMessage,
  chatLog,
}: GameRoomViewProps) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Game Room: {game.gameId.substring(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {game.players.map((name, index) => (
                    <div key={index} className="flex items-center">
                      <span className="flex-1">{name.name}</span>
                      {name.name === game.host.name && (
                        <span className="text-sm text-muted-foreground">(Host)</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <ChatRoom 
              chatLog={chatLog}
              onSendMessage={onChatMessage}
              className="md:col-span-2"
            />
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between">
            <Button variant="destructive" onClick={onLeaveGame}>
              Leave Game
            </Button>
            {game.host.name === playerName && (
              <Button onClick={onStartGame}>
                Start Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
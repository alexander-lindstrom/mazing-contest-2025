import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChatMessage, LobbyInformation } from '@mazing/util';
import { ChatRoom } from './ChatRoom';

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
      <Card className="bg-yellow-300 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">
            Game Room: {game.gameId.substring(0, 8)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1 bg-yellow-300 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-tight">Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {game.players.map((name, index) => (
                    <div key={index} className="flex items-center">
                      <span className="flex-1 font-medium">{name.name}</span>
                      {name.name === game.host.name && (
                        <span className="text-sm text-muted-foreground font-bold">(Host)</span>
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

          <Separator className="my-4 border-2 border-black" />

          <div className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={onLeaveGame}
              className="bg-red-400 text-black hover:bg-red-500 font-bold py-2 px-4 border-3 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Leave Game
            </Button>
            {game.host.name === playerName && (
              <Button 
                onClick={onStartGame}
                className="bg-green-400 text-black hover:bg-green-500 font-bold py-2 px-4 border-3 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
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
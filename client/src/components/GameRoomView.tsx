import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatMessage, LobbyInformation } from '@mazing/util';
import { useEffect, useRef, useState } from 'react';

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
  const [chatMessage, setChatMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current!.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 10);
    }
  }, [chatLog]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) {
      return;
    }
    onChatMessage(chatMessage);
    setChatMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Game Room: {game.gameId.substring(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Player List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {game.playerNames.map((name, index) => (
                    <div key={index} className="flex items-center">
                      <span className="flex-1">{name}</span>
                      {name === game.host.name && (
                        <span className="text-sm text-muted-foreground">(Host)</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 rounded-md border p-4">
                  <div ref={scrollRef}>
                    {chatLog.length > 0 ? (
                      <div className="space-y-1 text-sm">
                        {chatLog.map(({ sender, timestamp, message }, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="font-semibold">{sender}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-gray-800">{message}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Chat messages will appear here...
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 mt-4">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </CardContent>
            </Card>
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
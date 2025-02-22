import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { socket } from '@/socket';

export const GameLobby = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [playerName, setPlayerName] = useState('');
  const [availableGames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleHostGame = () => {
    console.log("Host game client")
    if (!playerName.trim()) {
      setError('Please enter your name first');
      return;
    }
    
    socket?.emit('createGame', {
      playerName: playerName
    });
  };

  const handleJoinGame = (gameId: string) => {
    if (!playerName.trim()) {
      setError('Please enter your name first');
      return;
    }

    socket?.emit('joinGame', {
      gameId: gameId,
      playerName: playerName
    });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Game</CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleHostGame}
                className="w-full"
                disabled={!isConnected}
              >
                Host New Game
              </Button>

              {availableGames.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium my-2">Available Games</h3>
                  <div className="space-y-2">
                    {availableGames.map((gameId) => (
                      <Button
                        key={gameId}
                        onClick={() => handleJoinGame(gameId)}
                        variant="outline"
                        className="w-full"
                        disabled={!isConnected}
                      >
                        Join Game {gameId}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameLobby;
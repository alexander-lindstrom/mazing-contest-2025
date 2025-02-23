import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSocket } from '@/socket';
import { LobbyInformation } from '@mazing/util';

export const GameLobby = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [availableGames, setAvailableGames] = useState<LobbyInformation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const socket = getSocket();
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onGamesList(games: LobbyInformation[]) {
      console.log("Receiving a list of game ids");
      console.log(games)
      setAvailableGames(games);
    }
  
    function onGameCreated(gameId: string) {
      console.log(`Game created with ID: ${gameId}`);
    }
  
    function onGameJoined(gameId: string) {
      console.log(`Joined game with ID: ${gameId}`);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('list-games', onGamesList);
    socket.on('game-created', onGameCreated);
    socket.on('player-joined', onGameJoined);

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
    
    const socket = getSocket()
    socket?.emit('create-game', {
      name: playerName
    });
  };

  const handleRequestJoinGame = (gameId: string) => {
    console.log("Want to join game")
    if (!playerName.trim()) {
      setError('Please enter your name first');
      return;
    }

    const socket = getSocket();
    socket?.emit('join-game', {
      gameId: gameId,
      playerData: {
        name: playerName
      }
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
                    {availableGames.map((lobbyInfo) => (
                      <Button
                        key={lobbyInfo.gameId}
                        onClick={() => handleRequestJoinGame(lobbyInfo.gameId)}
                        variant="outline"
                        className="w-full"
                        disabled={!isConnected}
                      >
                        Join Game {lobbyInfo.gameId.substring(0, 8)} ({lobbyInfo.numPlayers} players)
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
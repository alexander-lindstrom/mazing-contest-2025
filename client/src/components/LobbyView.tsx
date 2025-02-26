import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LobbyInformation, GameStatusEnum } from '@mazing/util';

interface LobbyViewProps {
  isConnected: boolean;
  playerName: string;
  setPlayerName: (name: string) => void;
  error: string | null;
  availableGames: LobbyInformation[];
  onHostGame: () => void;
  onJoinGame: (gameId: string) => void;
}

export const LobbyView = ({
  isConnected,
  playerName,
  setPlayerName,
  error,
  availableGames,
  onHostGame,
  onJoinGame,
}: LobbyViewProps) => {

  const waitingGames = availableGames.filter(game => game.gameStatus === GameStatusEnum.WAITING);
  const startedGames = availableGames.filter(game => game.gameStatus === GameStatusEnum.RUNNING);
  const finishedGames = availableGames.filter(game => game.gameStatus === GameStatusEnum.FINISHED);

  return (
    <div className="max-w-md mx-auto p-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Game</CardTitle>
        </CardHeader>
        <CardContent>
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
                onClick={onHostGame}
                className="w-full"
                disabled={!isConnected}
              >
                Host New Game
              </Button>

              {waitingGames.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium my-2">Available Games</h3>
                  <div className="space-y-2">
                    {waitingGames.map((lobbyInfo) => (
                      <Button
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        variant="outline"
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        disabled={!isConnected}
                      >
                        {lobbyInfo.gameId.substring(0, 8)} ({lobbyInfo.numPlayers} players)
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {startedGames.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium my-2">Ongoing Games</h3>
                  <div className="space-y-2">
                    {startedGames.map((lobbyInfo) => (
                      <Button
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        variant="outline"
                        className="w-full"
                        disabled={!isConnected}
                      >
                        {lobbyInfo.gameId.substring(0, 8)} ({lobbyInfo.numPlayers} players)
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {finishedGames.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium my-2">Completed Games</h3>
                  <div className="space-y-2">
                    {finishedGames.map((lobbyInfo) => (
                      <Button
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        variant="outline"
                        className="w-full"
                        disabled={!isConnected}
                      >
                        {lobbyInfo.gameId.substring(0, 8)} ({lobbyInfo.numPlayers} players)
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
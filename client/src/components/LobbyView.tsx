import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LobbyInformation, GameStatusEnum } from '@mazing/util';
import SoundButton from './SoundButton';

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
        <Alert variant="destructive" className="bg-red-600 border-2 border-red-800 rounded-lg shadow-lg">
          <AlertDescription className="text-white font-mono font-bold">{error}</AlertDescription>
        </Alert>
      )}
      <Card className="bg-slate-800 border-2 border-slate-700 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-mono font-bold tracking-tight text-white">
            Join or host a game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border-2 border-slate-700 rounded-lg p-3 font-mono bg-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <SoundButton
                onClick={onHostGame}
                className="w-full bg-green-600 text-white hover:bg-green-700 font-mono font-bold py-3 px-6 border-2 border-green-800 rounded-lg shadow-lg hover:translate-y-1 transition-all"
                disabled={!isConnected}
              >
                Host New Game
              </SoundButton>

              {waitingGames.length > 0 && (
                <div>
                  <h3 className="text-lg font-mono font-medium my-2 text-white">Available Games</h3>
                  <div className="space-y-2">
                    {waitingGames.map((lobbyInfo) => (
                      <SoundButton
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 font-mono font-bold py-3 px-6 border-2 border-blue-800 rounded-lg shadow-lg hover:translate-y-1 transition-all"
                        disabled={!isConnected || lobbyInfo.numPlayers > 8}
                      >
                        {lobbyInfo.gameId.substring(0, 8)} ({lobbyInfo.numPlayers} players)
                      </SoundButton>
                    ))}
                  </div>
                </div>
              )}

              {startedGames.length > 0 && (
                <div>
                  <h3 className="text-lg font-mono font-medium my-2 text-white">Ongoing Games</h3>
                  <div className="space-y-2">
                    {startedGames.map((lobbyInfo) => (
                      <Button
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        className="w-full bg-orange-600 text-white hover:bg-orange-700 font-mono font-bold py-3 px-6 border-2 border-orange-800 rounded-lg shadow-lg hover:translate-y-1 transition-all"
                        disabled={true}
                      >
                        {lobbyInfo.gameId.substring(0, 8)} ({lobbyInfo.numPlayers} players)
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {finishedGames.length > 0 && (
                <div>
                  <h3 className="text-lg font-mono font-medium my-2 text-white">Completed Games</h3>
                  <div className="space-y-2">
                    {finishedGames.map((lobbyInfo) => (
                      <Button
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        className="w-full bg-purple-600 text-white hover:bg-purple-700 font-mono font-bold py-3 px-6 border-2 border-purple-800 rounded-lg shadow-lg hover:translate-y-1 transition-all"
                        disabled={true}
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
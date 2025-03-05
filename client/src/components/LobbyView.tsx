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
        <Alert variant="destructive" className="bg-red-400 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <AlertDescription className="text-black font-bold">{error}</AlertDescription>
        </Alert>
      )}
      <Card className="bg-yellow-300 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Welcome to the Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Your Name
              </label>
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border-3 border-black rounded-lg p-3 font-medium bg-white"
              />
            </div>

            <div className="space-y-2">
              <SoundButton
                onClick={onHostGame}
                className="w-full bg-green-400 text-black hover:bg-green-500 font-bold py-3 px-6 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                disabled={!isConnected}
              >
                Host New Game
              </SoundButton>

              {waitingGames.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium my-2 text-black">Available Games</h3>
                  <div className="space-y-2">
                    {waitingGames.map((lobbyInfo) => (
                      <SoundButton
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        className="w-full bg-blue-400 text-black hover:bg-blue-500 font-bold py-3 px-6 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
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
                  <h3 className="text-lg font-medium my-2 text-black">Ongoing Games</h3>
                  <div className="space-y-2">
                    {startedGames.map((lobbyInfo) => (
                      <Button
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        className="w-full bg-orange-400 text-black hover:bg-orange-500 font-bold py-3 px-6 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
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
                  <h3 className="text-lg font-medium my-2 text-black">Completed Games</h3>
                  <div className="space-y-2">
                    {finishedGames.map((lobbyInfo) => (
                      <Button
                        key={lobbyInfo.gameId}
                        onClick={() => onJoinGame(lobbyInfo.gameId)}
                        className="w-full bg-purple-400 text-black hover:bg-purple-500 font-bold py-3 px-6 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
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
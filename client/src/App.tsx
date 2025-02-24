import { useState } from "react";
import { SinglePlayerGame } from "./pages/SinglePlayerGame";
import { Button } from "@/components/ui/button";
import GameLobby from "./pages/GameLobby";

function App() {
  const [gameMode, setGameMode] = useState<"single" | "multi" | null>(null);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white font-bold text-lg">
      <h1 className="text-4xl mb-6 drop-shadow-lg">Mazing Contest!</h1>
      {gameMode === null && (
        <div className="flex flex-col items-center space-y-4 bg-white/20 p-8 rounded-2xl shadow-xl backdrop-blur-lg border-4 border-white">
          <h1 className="text-3xl mb-4 drop-shadow-lg">Select Game Mode</h1>
          <Button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black text-xl rounded-xl" onClick={() => setGameMode("single")}>
            Single Player
          </Button>
          <Button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-black text-xl rounded-xl" onClick={() => setGameMode("multi")}>
            Multiplayer
          </Button>
        </div>
      )}

      {gameMode === "single" && <SinglePlayerGame />}
      {gameMode === "multi" && <GameLobby />}
    </div>
  );
}

export default App;

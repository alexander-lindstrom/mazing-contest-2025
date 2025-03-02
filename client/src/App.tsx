import { useState } from "react";
import { SinglePlayerGame } from "./pages/SinglePlayerGame";
import { Button } from "@/components/ui/button";
import { MultiPlayerGameController } from "./pages/MultiPlayerGameController";

function App() {
  const [gameMode, setGameMode] = useState<"single" | "multi" | null>(null);

  return (
    <div className="relative min-h-screen flex flex-col justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-orange-800 text-white font-bold text-lg">
      <div className="absolute inset-0 bg-black/20"></div>

      <h1 className="absolute top-8 left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl font-press-start text-yellow-300 text-shadow-retro text-center">
        Mazing Contest!
      </h1>

      <div className="relative z-10">
        {gameMode === null && (
          <div className="flex flex-col items-center space-y-4 bg-white/20 p-8 rounded-2xl shadow-xl backdrop-blur-lg border-4 border-white mx-4 sm:mx-auto sm:max-w-md">
            <h2 className="text-3xl mb-4 drop-shadow-lg font-press-start text-yellow-300 text-shadow-retro">
              Select Game Mode
            </h2>
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-3 px-6 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              onClick={() => setGameMode("single")}
            >
              Single Player
            </Button>
            <Button
              className="bg-red-400 text-black hover:bg-red-500 font-bold py-3 px-6 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              onClick={() => setGameMode("multi")}
            >
              Multiplayer
            </Button>
          </div>
        )}

        {gameMode === "single" && <SinglePlayerGame />}
        {gameMode === "multi" && <MultiPlayerGameController />}
      </div>
    </div>
  );
}

export default App;
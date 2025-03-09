import { useState, useEffect } from "react";
import { SinglePlayerGame } from "./pages/SinglePlayerGame";
import { MultiPlayerGameController } from "./pages/MultiPlayerGameController";
import SoundButton from "./components/SoundButton";
import { getParamFromUrl, removeParamFromUrl } from "./util/url";

function App() {
  const [gameMode, setGameMode] = useState<"single" | "multi" | null>(null);

  useEffect(() => {

    const mode = getParamFromUrl("mode");
    if (mode === "single") {
      setGameMode("single");
    } else if (mode === "multi") {
      setGameMode("multi");
    }
    removeParamFromUrl("mode");
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-orange-800 text-white font-bold text-lg">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10">
        {gameMode === null && (
          <div className="flex flex-col items-center space-y-4 bg-white/20 p-8 rounded-2xl shadow-xl backdrop-blur-lg border-4 border-white mx-4 sm:mx-auto sm:max-w-md">
            <h2 className="text-3xl mb-4 drop-shadow-lg font-press-start text-yellow-300 text-shadow-retro">
              Choose mode
            </h2>
            <SoundButton
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-3 px-6 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              onClick={() => setGameMode('single')}
            >
              Single Player
            </SoundButton>
            <SoundButton
              className="bg-red-400 text-black hover:bg-red-500 font-bold py-3 px-6 border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              onClick={() => {
                setGameMode('multi');
              }}
            >
              Multiplayer
            </SoundButton>
          </div>
        )}

        {gameMode === "single" && <SinglePlayerGame />}
        {gameMode === "multi" && <MultiPlayerGameController />}
      </div>
    </div>
  );
}

export default App;
import { useState } from 'react';
import GridRenderer from '../components/GridRenderer';
import { generateStartingState } from '../util/RandomGeneration';

export function GamePage() {
  const startingState = generateStartingState();
  const [grid, setGrid] = useState(() => {
    return startingState.grid;
  });
  const [towers, setTowers] = useState(() => {
    return startingState.towers;
  });

  return (
    <div className="game-page">
      <h1>Tower Defense Grid</h1>
      <GridRenderer
        width={startingState.width}
        height={startingState.height}
        towers={towers}
        setTowers={setTowers}
        grid={grid}
        setGrid={setGrid}
      />
    </div>
  );
}
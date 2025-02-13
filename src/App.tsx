import { useState } from 'react';
import { defaultGridParams } from './types/grid';
import GridRenderer from './components/gridRenderer';

function App() {
  const gridParams = defaultGridParams;
  const [grid, setGrid] = useState(() => {
    return gridParams.grid;
  });
  const [towers, setTowers] = useState(() => {
    return gridParams.towers;
  });

  return (
    <div className="App">
      <h1>Tower Defense Grid</h1>
      <GridRenderer
        width={gridParams.width}
        height={gridParams.height}
        towers={towers}
        setTowers={setTowers}
        grid={grid}
        setGrid={setGrid}
      />
    </div>
  );
}

export default App;
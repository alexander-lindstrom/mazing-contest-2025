import { useState } from 'react';
import { canPlaceTower, canSellTower, defaultGridParams, GridCell } from './types/grid';
import GridRenderer from './components/gridRenderer';

function App() {
  const gridParams = defaultGridParams;
  const [grid, setGrid] = useState(() => {
    return gridParams.grid;
  });
  
  const handleCellClick = (x: number, y: number) => {
    const newGrid = grid.map(row => [...row]);

    if (canSellTower(grid, x, y)) {
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          newGrid[y + dy][x + dx] = GridCell.GRASS;
        }
      }
      setGrid(newGrid);
      return;
    }
    
    if (canPlaceTower(grid, x, y)) {
      const selectedTower = GridCell.BLOCK_TOWER;
      
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          newGrid[y + dy][x + dx] = selectedTower;
        }
      }
      setGrid(newGrid);
    }
  };

  return (
    <div className="App">
      <h1>Tower Defense Grid</h1>
      <GridRenderer
        width={gridParams.width}
        height={gridParams.height}
        towers={gridParams.towers}
        grid={grid}
        onCellClick={handleCellClick}
      />
    </div>
  );
}

export default App;
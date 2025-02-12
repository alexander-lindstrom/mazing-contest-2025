import { useState } from 'react';
import { canPlaceTower, canSellTower, defaultGridState, GridCell } from './types/grid';
import GridRenderer from './components/gridRenderer';

function App() {
  const gridState = defaultGridState;
  const [grid, setGrid] = useState(() => {
    return gridState.grid;
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
        {...gridState}
        onCellClick={handleCellClick}
      />
    </div>
  );
}

export default App;
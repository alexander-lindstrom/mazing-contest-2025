export interface Position {
  x: number;
  y: number;
}

export interface Tower {
  type: TowerType;
  positions: [Position, Position, Position, Position];
}

export enum GridCell {
    GRASS,
    GRASS_NOBUILD,
    SAND,
    BLOCK_TOWER,
    CLAP_TOWER,
    BLOCK_TOWER_NOSELL,
    CLAP_TOWER_NOSELL,
  }
  
export enum TowerType {
    BLOCK_TOWER,
    CLAP_TOWER,
    BLOCK_TOWER_NOSELL,
    CLAP_TOWER_NOSELL,
}

//towers 2x2
const defaultHeight = 20;
const defaultWidth = 20;

const centerMid = Math.floor(defaultWidth / 2);
const centerLeft = centerMid - 1;
const centerRight = centerMid + 1;

const emptyGrid = Array(defaultHeight).fill(null).map((_, rowIndex) => {
  const row = Array(defaultWidth).fill(GridCell.GRASS);
  
  if (rowIndex === 0 || rowIndex === defaultHeight - 1) {
    row.fill(GridCell.SAND);
    
    row[centerLeft] = GridCell.GRASS_NOBUILD;
    row[centerMid] = GridCell.GRASS_NOBUILD;
    row[centerRight] = GridCell.GRASS_NOBUILD;
  }
  else {
    row[0] = GridCell.SAND;                 
    row[defaultWidth - 1] = GridCell.SAND;
  }
  
  return row;
});

export interface GridParams {
  height: number;
  width: number;
  grid: GridCell[][];
  towers: Tower[];
}

export const defaultGridParams: GridParams = {
  height: defaultHeight,
  width: defaultWidth,
  grid: emptyGrid,
  towers: []
};

export const getCellColor = (cell: GridCell): string => {
  switch (cell) {
    case GridCell.GRASS:
      return '#90EE90'; // Light green
    case GridCell.GRASS_NOBUILD:
      return '#698269'; // Darker green
    case GridCell.SAND:
      return '#F4D03F'; // Sand yellow
    case GridCell.BLOCK_TOWER:
      return '#E74C3C'; // Bright red
    case GridCell.BLOCK_TOWER_NOSELL:
      return '#922B21'; // Darker red
    case GridCell.CLAP_TOWER:
      return '#3498DB'; // Bright blue
    case GridCell.CLAP_TOWER_NOSELL:
      return '#1F618D'; // Darker blue
    default:
      return '#FFFFFF';
  }
};

export const canPlaceTower = (grid: GridCell[][], x: number, y: number): boolean => {
  if (x < 0 || y < 0 || x + 1 >= grid[0].length || y + 1 >= grid.length) {
    return false;
  }

  for (let dy = 0; dy < 2; dy++) {
    for (let dx = 0; dx < 2; dx++) {
      const cell = grid[y + dy][x + dx];
      if (cell !== GridCell.GRASS) {
        return false;
      }
    }
  }
  
  return true;
};

export const canSellTower = (grid: GridCell[][], x: number, y: number): boolean => {
  const cell = grid[y][x];
  return cell === GridCell.BLOCK_TOWER || cell === GridCell.CLAP_TOWER;
};

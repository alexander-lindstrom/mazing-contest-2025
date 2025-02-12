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
  
export type GridProperties = {
    height: number;
    width: number;
    grid: GridCell[][];
    towers: TowerType[];
    onCellClick: (x: number, y: number) => void;
}

//towers 2x2
const defaultHeight = 40;
const defaultWidth = 40;

const centerMid = Math.floor(defaultWidth / 2);
const centerLeft = centerMid - 1;
const centerRight = centerMid + 1;

export const emptyGrid = Array(defaultHeight).fill(null).map((_, rowIndex) => {
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

export const defaultGrid = {
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

export const getTowerSymbol = (type: TowerType): string => {
  switch (type) {
    case TowerType.BLOCK_TOWER:
    case TowerType.BLOCK_TOWER_NOSELL:
      return '▣'; // Block symbol
    case TowerType.CLAP_TOWER:
    case TowerType.CLAP_TOWER_NOSELL:
      return '◈'; // Diamond symbol
    default:
      return '?';
  }
};

export const getTowerSymbolColor = (cell: GridCell): string => {
  switch (cell) {
    case GridCell.BLOCK_TOWER:
    case GridCell.CLAP_TOWER:
      return '#FFFFFF'; // White
    case GridCell.BLOCK_TOWER_NOSELL:
    case GridCell.CLAP_TOWER_NOSELL:
      return '#A0A0A0'; // Gray
    default:
      return '#000000';
  }
};

export interface Position {
  x: number;
  y: number;
}

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

export const getTowerPlacementPosition = (x: number, y: number): Position => {
  return {
    x: Math.floor(x / 2) * 2,
    y: Math.floor(y / 2) * 2
  };
};

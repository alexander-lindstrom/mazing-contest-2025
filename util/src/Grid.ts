import { StartingState } from "./RandomGeneration";

export interface Position {
  x: number;
  y: number;
}

export interface Tower {
  type: GridCell;
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
  BLOCK_TOWER_NOSELL_UPGRADED,
}

export const defaultHeight = 20;
export const defaultWidth = 21;

export const defaultStart: Position = {
  x: Math.floor((defaultWidth-1)/2),
  y: 0,
}

export const defaultGoal: Position = {
  x: Math.floor((defaultWidth-1)/2),
  y: defaultHeight-1,
}

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
      return '#E74C3C'; // Bright red
    case GridCell.CLAP_TOWER:
      return '#3498DB'; // Bright blue
    case GridCell.CLAP_TOWER_NOSELL:
      return '#3498DB'; // Bright blue
    case GridCell.BLOCK_TOWER_NOSELL_UPGRADED:
      return '#3498DB'; // Bright blue
    default:
      return '#FFFFFF';
  }
};

export const getBaseCellColor = (cell: GridCell): string => {
  switch (cell) {
    case GridCell.GRASS:
      return '#2fd753'; // Light green
    case GridCell.GRASS_NOBUILD:
      return '#006400'; // Darker green
    case GridCell.SAND:
      return '#FFBF00'; // Sand yellow
    case GridCell.BLOCK_TOWER_NOSELL:
      return '#5C4033';
    case GridCell.CLAP_TOWER_NOSELL:
      return '#5C4033';
    case GridCell.BLOCK_TOWER_NOSELL_UPGRADED:
      return '#5C4033';
    case GridCell.BLOCK_TOWER:
      return '#8B5A2B';
    case GridCell.CLAP_TOWER:
      return '#8B5A2B';
  }
};

export function get2x2Positions(pos: Position): [Position, Position, Position, Position] {
  return [
    { x: pos.x, y: pos.y },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x + 1, y: pos.y + 1 }
  ];
}

export const canPlaceTower = (grid: GridCell[][], x: number, y: number): boolean => {
  if (x < 0 || y < 0 || x + 1 >= grid[0].length || y + 1 >= grid.length) {
    return false;
  }

  const positions = get2x2Positions({ x, y });
  for (let i = 0; i < positions.length; i++) {
    const { x: posX, y: posY } = positions[i];
    const cell = grid[posY][posX];
    if (cell !== GridCell.GRASS) {
      return false;
    }
  }
  
  return true;
};

export const canSellTower = (grid: GridCell[][], x: number, y: number): boolean => {
  const cell = grid[y][x];
  return cell === GridCell.BLOCK_TOWER || cell === GridCell.CLAP_TOWER;
};

export const canDowngradeTower = (grid: GridCell[][], x: number, y: number): boolean => {
  const cell = grid[y][x];
  return cell === GridCell.BLOCK_TOWER_NOSELL_UPGRADED;
};

export const canUpgradeTower = (grid: GridCell[][], x: number, y: number): boolean => {
  const cell = grid[y][x];
  return cell === GridCell.BLOCK_TOWER_NOSELL || cell == GridCell.BLOCK_TOWER;
};

export function distance2D(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isTower(g: GridCell){
  return g === GridCell.BLOCK_TOWER || g === GridCell.BLOCK_TOWER_NOSELL ||
    g === GridCell.CLAP_TOWER || g === GridCell.CLAP_TOWER_NOSELL || g === GridCell.BLOCK_TOWER_NOSELL_UPGRADED;
}

function getTotalTowerValue(grid: GridCell[][]): { gold: number; lumber: number } {
  let gold = 0;
  let lumber = 0;

  for (const row of grid) {
    for (const cell of row) {
      if (cell === GridCell.BLOCK_TOWER || cell === GridCell.BLOCK_TOWER_NOSELL) {
        gold += 1;
      } else if (cell === GridCell.CLAP_TOWER || cell === GridCell.CLAP_TOWER_NOSELL || cell === GridCell.BLOCK_TOWER_NOSELL_UPGRADED) {
        gold += 1;
        lumber += 1;
      }
    }
  }
  return { gold, lumber };
}

function checkNonSellableTowers(initialGrid: GridCell[][], finalGrid: GridCell[][]): boolean {
  for (let i = 0; i < initialGrid.length; i++) {
    for (let j = 0; j < initialGrid[i].length; j++) {
      const initialCell = initialGrid[i][j];
      const finalCell = finalGrid[i][j];

      if (
        initialCell === GridCell.BLOCK_TOWER_NOSELL &&
        finalCell !== GridCell.BLOCK_TOWER_NOSELL &&
        finalCell !== GridCell.BLOCK_TOWER_NOSELL_UPGRADED
      ) {
        return false;
      }

      if (
        initialCell === GridCell.CLAP_TOWER_NOSELL &&
        initialCell !== finalCell
      ) {
        return false;
      }
    }
  }
  return true;
}

export function validateRoundResult(initial: StartingState, final: StartingState): boolean {
  const initialTotal = getTotalTowerValue(initial.grid);
  const finalTotal = getTotalTowerValue(final.grid);

  const goldDifference = (finalTotal.gold - initialTotal.gold) / 4;
  const lumberDifference = (finalTotal.lumber - initialTotal.lumber) / 4;

  const hasEnoughGold = goldDifference <= initial.gold;
  const hasEnoughLumber = lumberDifference <= initial.lumber;

  const nonSellablePreserved = checkNonSellableTowers(initial.grid, final.grid);

  return hasEnoughGold && hasEnoughLumber && nonSellablePreserved;
}

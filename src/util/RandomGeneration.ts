import { canPlaceTower, defaultGoal, defaultGridParams, defaultStart, GridCell, GridParams, Position, Tower } from './Grid';
import { findShortestPath } from './Pathfinding';

const maxClap = 3
const minClap = 0
const maxBlock = 17
const minBlock = 5
const minGold = 5
const maxGold = 20
const minLumber = 0
const maxLumber = 3

export type StartingState = GridParams & {
  gold: number,
  lumber: number,
}

function getRandomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeTowers(grid: GridCell[][], towers: Tower[], count: number, type: GridCell) {
    let placed = 0;
    while (placed < count) {
      const x = getRandomInRange(1, grid.length - 3);
      const y = getRandomInRange(1, grid[0].length - 3);
  
      if (canPlaceTower(grid, x, y)) {
        const positions: [Position, Position, Position, Position] = [
            { x: x, y: y },
            { x: x + 1, y: y },
            { x: x, y: y + 1 },
            { x: x + 1, y: y + 1 }
        ];
        positions.forEach(pos => {
            grid[pos.y][pos.x] = type;
        });
        towers.push({ type, positions });
        placed++;
      }
    }
  }

  export function generateStartingState() {
    let path: Position[] | null = null;
    let height: number, width: number, grid: GridCell[][], towers: Tower[];
    let gold: number, lumber: number, clap: number, block: number;
  
    do {
      ({ height, width, grid, towers } = defaultGridParams);
      gold = getRandomInRange(minGold, maxGold);
      lumber = getRandomInRange(minLumber, maxLumber);
      clap = getRandomInRange(minClap, maxClap);
      block = getRandomInRange(minBlock, maxBlock);
  
      placeTowers(grid, towers, clap, GridCell.CLAP_TOWER_NOSELL);
      placeTowers(grid, towers, block, GridCell.BLOCK_TOWER_NOSELL);
  
      path = findShortestPath(grid, defaultStart, defaultGoal);
    } while (path === null);
  
    return { height, width, grid, towers, gold, lumber };
  }
  
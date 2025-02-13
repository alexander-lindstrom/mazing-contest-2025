import { canPlaceTower, defaultGridParams, GridCell, GridParams, Position, Tower } from './Grid';

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

export function generateStartingState(){

    const {height, width, grid, towers} = defaultGridParams;
    const gold = getRandomInRange(minGold, maxGold);
    const lumber = getRandomInRange(minLumber, maxLumber);
    const clap = getRandomInRange(minClap, maxClap);
    const block = getRandomInRange(minBlock, maxBlock);

    placeTowers(grid, towers, clap, GridCell.CLAP_TOWER);
    placeTowers(grid, towers, block, GridCell.BLOCK_TOWER);

    return {height, width, grid, towers, gold, lumber};
}
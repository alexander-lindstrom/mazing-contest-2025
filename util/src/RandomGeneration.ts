import { canPlaceTower, defaultGoal, defaultGridParams, defaultStart, GridCell, GridParams, Position, Tower } from './Grid';
import { findShortestPath } from './Pathfinding';
import seedrandom from 'seedrandom';

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
  seed: string,
}

function getRandomInRange(min: number, max: number, rng: () => number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function placeTowers(grid: GridCell[][], towers: any[], count: number, type: GridCell, rng: () => number) {
  let placed = 0;
  while (placed < count) {
      const x = getRandomInRange(1, grid.length - 3, rng);
      const y = getRandomInRange(1, grid[0].length - 3, rng);
      if (canPlaceTower(grid, x, y)) {
          const positions = [
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

export function generateStartingState(seed?: string) {

  const actualSeed = seed || Math.random().toString(36).substring(2, 10);
  const rng = seedrandom(actualSeed);

  let path = null;
  let height, width, grid, towers;
  let gold, lumber, clap, block;
  do {
      ({ height, width, grid, towers } = structuredClone(defaultGridParams));
      gold = getRandomInRange(minGold, maxGold, rng);
      lumber = getRandomInRange(minLumber, maxLumber, rng);
      clap = getRandomInRange(minClap, maxClap, rng);
      block = getRandomInRange(minBlock, maxBlock, rng);
      placeTowers(grid, towers, clap, GridCell.CLAP_TOWER_NOSELL, rng);
      placeTowers(grid, towers, block, GridCell.BLOCK_TOWER_NOSELL, rng);
      path = findShortestPath(grid, defaultStart, defaultGoal);
  } while (path === null);

  return { height, width, grid, towers, gold, lumber, seed: actualSeed };
}
  
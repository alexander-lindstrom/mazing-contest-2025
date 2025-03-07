import PF from "pathfinding";
import { GridCell, Position } from "./Grid";

export function findShortestPath(
  grid: GridCell[][],
  start: Position,
  goal: Position,
): Position[] | null {

  const matrix = grid.map((row) =>
    row.map((cell) => (cell === GridCell.GRASS || cell === GridCell.GRASS_NOBUILD ? 0 : 1))
  );

  const finder = PF.JumpPointFinder({
    diagonalMovement: PF.DiagonalMovement.IfAtMostOneObstacle,
  });

  const pfGrid = new PF.Grid(matrix);
  const path = finder.findPath(start.x, start.y, goal.x, goal.y, pfGrid);
  const positionArray: Position[] = path.map(coordinates => {
    if (coordinates.length !== 2) {
        throw new Error('Invalid path coordinates');
    }
    const [x, y] = coordinates;
    return { x, y };
});

  return positionArray.length > 0 ? positionArray : null;
}

export function pathExists(grid: GridCell[][], start: Position, goal: Position, towerLocation: Position): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
  ];

  const queue: Position[] = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;

    if (x === goal.x && y === goal.y) {
      return true;
    }

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (
        onGrid(newX, newY, rows, cols) &&
        !visited.has(`${newX},${newY}`) &&
        isWalkable(grid[newY][newX], newX, newY, towerLocation)
      ) {
        queue.push({ x: newX, y: newY });
        visited.add(`${newX},${newY}`);
      }
    }
  }

  return false;
}

function onGrid(x: number, y: number, rows: number, cols: number): boolean {
  return x >= 0 && x < cols && y >= 0 && y < rows;
}

function isWalkable(cell: GridCell, x: number, y: number, tower: Position): boolean {
  const isBlocked = 
    x >= tower.x && x < tower.x + 2 &&
    y >= tower.y && y < tower.y + 2;

  return !isBlocked && (cell === GridCell.GRASS || cell === GridCell.GRASS_NOBUILD);
}


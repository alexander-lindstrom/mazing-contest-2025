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

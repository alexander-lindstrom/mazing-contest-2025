import PF from "pathfinding";
import { GridCell, Position } from "./Grid";

export function findShortestPath(
  grid: GridCell[][],
  start: Position,
  goal: Position,
): number[][] | null {

  const matrix = grid.map((row) =>
    row.map((cell) => (cell === GridCell.GRASS || cell === GridCell.GRASS_NOBUILD ? 0 : 1))
  );

  const finder = new PF.AStarFinder({
    diagonalMovement: 3, // If at most one obstacle
  });

  const pfGrid = new PF.Grid(matrix);
  const path = finder.findPath(start.x, start.y, goal.x, goal.y, pfGrid);

  return path.length > 0 ? path : null;
}

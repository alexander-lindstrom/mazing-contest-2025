import { GridCell, Position, Tower } from "./Grid";

export function simulateRunnerMovement(
    towers: Tower[],
    shortestPath: Position[],
    dt: number = 0.1,
    baseSpeed: number = 1,
    slowMultiplier: number = 0.5,
    slowDuration: number = 2,
    clapRange: number = 1.5,
    clapCooldown: number = 5
  ) {
    let time = 0;
    let pathIndex = 0;
    let runnerX = shortestPath[0].x;
    let runnerY = shortestPath[0].y;
    let speed = baseSpeed;
    let slowTimeRemaining = 0;
    const lastClapTimes = new Map<Tower, number>();
    const runnerPositions: Position[] = [];
  
    while (pathIndex < shortestPath.length - 1) {
      const nextNode = shortestPath[pathIndex + 1];
      const dx = nextNode.x - runnerX;
      const dy = nextNode.y - runnerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) {
        pathIndex++;
        continue;
      }
      
      if (slowTimeRemaining > 0) {
        speed = baseSpeed * slowMultiplier;
        slowTimeRemaining -= dt;
      } else {
        speed = baseSpeed;
      }
      
      const moveDistance = speed * dt;
      const moveRatio = Math.min(1, moveDistance / distance);
      runnerX += dx * moveRatio;
      runnerY += dy * moveRatio;
      
      for (const tower of towers) {
        if (tower.type === GridCell.CLAP_TOWER || tower.type === GridCell.CLAP_TOWER_NOSELL) {

          const getCenterPoint = (positions: [Position, Position, Position, Position]): Position => {
            const sumX = positions.reduce((sum, pos) => sum + pos.x, 0);
            const sumY = positions.reduce((sum, pos) => sum + pos.y, 0);
            return {
              x: sumX / positions.length,
              y: sumY / positions.length
            };
          };
          
          const centerPoint = getCenterPoint(tower.positions);
          const towerDistance = Math.sqrt(
            (centerPoint.x - runnerX) ** 2 + (centerPoint.y - runnerY) ** 2
          );
          if (towerDistance <= clapRange) {
            const lastClap = lastClapTimes.get(tower) ?? -Infinity;
            if (time - lastClap >= clapCooldown) {
              slowTimeRemaining = slowDuration;
              lastClapTimes.set(tower, time);
            }
          }
        }
      }
      
      runnerPositions.push({ x: runnerX, y: runnerY });
      time += dt;
    }
  
    return runnerPositions;
  }
  
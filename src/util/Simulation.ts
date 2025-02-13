import { GridCell, GridParams, Tower } from "./Grid";

export function simulateRunnerMovement(
    gridParams: GridParams,
    shortestPath: { x: number; y: number }[],
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
    const runnerPositions: { x: number; y: number }[] = [];
  
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
      
      for (const tower of gridParams.towers) {
        if (tower.type === GridCell.CLAP_TOWER || tower.type === GridCell.CLAP_TOWER_NOSELL) {
          const towerDistance = Math.sqrt(
            // Need to have a central position available to use here
            (tower.x - runnerX) ** 2 + (tower.y - runnerY) ** 2
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
  
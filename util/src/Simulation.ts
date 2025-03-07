import { GridCell, Position, Tower } from "./Grid";
import { randomUUID } from 'crypto';

export const defaultTimeStep = 0.001;
export const defaultClapRange = 3;
export const defaultBaseSpeed = 2;
const defaultSlowMultiplier = 0.5;

export const getCenterPoint = (positions: Position[]): Position => {
  const sumX = positions.reduce((sum, pos) => sum + pos.x, 0);
  const sumY = positions.reduce((sum, pos) => sum + pos.y, 0);
  return {
    x: sumX / positions.length,
    y: sumY / positions.length
  };
};

interface TimeStep {
  position: Position;
  claps: ClapEvent[];
}

export interface ClapEvent {
  x: number;
  y: number;
  time: number;
  id: string;
}

export function simulateRunnerMovement(
  towers: Tower[],
  shortestPath: Position[],
  dt: number = defaultTimeStep,
  baseSpeed: number = defaultBaseSpeed,
  slowMultiplier: number = defaultSlowMultiplier,
  slowDuration: number = 4,
  clapRange: number = defaultClapRange,
  clapCooldown: number = 5
): TimeStep[] {
  let time = 0;
  let pathIndex = 0;
  let runnerX = shortestPath[0].x;
  let runnerY = shortestPath[0].y;
  let speed = baseSpeed;
  let slowTimeRemaining = 0;
  const lastClapTimes = new Map<Tower, number>();
  const timeSteps: TimeStep[] = [];

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
    
    const clapsThisStep: ClapEvent[] = [];

    for (const tower of towers) {
      if (tower.type === GridCell.CLAP_TOWER || tower.type === GridCell.CLAP_TOWER_NOSELL) {
        const centerPoint = getCenterPoint(tower.positions);
        const towerDistance = Math.sqrt(
          (centerPoint.x - runnerX) ** 2 + (centerPoint.y - runnerY) ** 2
        );
        
        if (towerDistance <= clapRange) {
          const lastClap = lastClapTimes.get(tower) ?? -Infinity;
          if (time - lastClap >= clapCooldown) {
            slowTimeRemaining = slowDuration;
            lastClapTimes.set(tower, time);

            clapsThisStep.push({
              x: centerPoint.x,
              y: centerPoint.y,
              time: time,
              id: randomUUID(),
            });
          }
        }
      }
    }
    
    timeSteps.push({
      position: { x: runnerX, y: runnerY },
      claps: clapsThisStep
    });
    
    time += dt;
  }

  return timeSteps;
}

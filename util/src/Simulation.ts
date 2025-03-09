import { GridCell, Position, Tower } from "./Grid";
import { v4 as uuidv4 } from 'uuid';

export const defaultTimeStep = 0.001;
export const defaultClapRange = 3;
export const defaultBaseSpeed = 2;
const defaultSlowMultiplier = 0.5;
const defaultTurnRate = Math.PI * 6;

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
  angle: number;
  isSlowed: boolean;
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
  clapCooldown: number = 5,
  turnRate: number = defaultTurnRate
): TimeStep[] {
  let time = 0;
  let pathIndex = 0;
  let runnerX = shortestPath[0].x;
  let runnerY = shortestPath[0].y;
  let runnerAngle = Math.PI / 2;
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

    const targetAngle = Math.atan2(dy, dx);
    let angleDiff = targetAngle - runnerAngle;

    angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;

    if (Math.abs(angleDiff) > 0.001) {
      const maxTurnStep = turnRate * dt;
      runnerAngle += Math.sign(angleDiff) * Math.min(maxTurnStep, Math.abs(angleDiff));
    } else {
      runnerAngle = targetAngle;

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
    }

    const clapsThisStep: ClapEvent[] = [];
    let isSlowed = slowTimeRemaining > 0;

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
              id: uuidv4(),
            });
          }
        }
      }
    }

    timeSteps.push({
      position: { x: runnerX, y: runnerY },
      angle: runnerAngle,
      isSlowed: isSlowed,
      claps: clapsThisStep
    });

    time += dt;
  }

  return timeSteps;
}
import { ClapEvent } from "../components/ClapAnimation";
import { GridCell, Position, Tower } from "./Grid";

export const defaultTimeStep = 0.01;

const getCenterPoint = (positions: Position[]): Position => {
  const sumX = positions.reduce((sum, pos) => sum + pos.x, 0);
  const sumY = positions.reduce((sum, pos) => sum + pos.y, 0);
  return {
    x: sumX / positions.length,
    y: sumY / positions.length
  };
};

interface TimeStep {
  position: Position;  // Runner position at this timestep
  claps: ClapEvent[];  // Clap events triggered at this timestep
}

export function simulateRunnerMovement(
  towers: Tower[],
  shortestPath: Position[],
  dt: number = defaultTimeStep,
  baseSpeed: number = 2,
  slowMultiplier: number = 0.5,
  slowDuration: number = 4,
  clapRange: number = 3,
  clapCooldown: number = 5
): TimeStep[] {  // Return TimeStep[] containing both position and clap events
  let time = 0;
  let pathIndex = 0;
  let runnerX = shortestPath[0].x;
  let runnerY = shortestPath[0].y;
  let speed = baseSpeed;
  let slowTimeRemaining = 0;
  const lastClapTimes = new Map<Tower, number>();
  const timeSteps: TimeStep[] = [];  // Store timeSteps that include both position and clap events

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
    
    const clapsThisStep: ClapEvent[] = [];  // Store clap events for the current step

    // Check each tower for clap events
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

            // Create ClapEvent for this tower at the current time
            clapsThisStep.push({
              x: centerPoint.x,
              y: centerPoint.y,
              time: time
            });
          }
        }
      }
    }
    
    // Push the timeStep (position + claps) to the array
    timeSteps.push({
      position: { x: runnerX, y: runnerY },
      claps: clapsThisStep
    });
    
    time += dt;
  }

  return timeSteps;  // Return timeSteps that include both runner position and claps
}

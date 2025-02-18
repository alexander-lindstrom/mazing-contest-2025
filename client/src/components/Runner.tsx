import { useEffect, useRef, useState } from 'react';
import { Circle } from 'react-konva';
import { distance2D, Position } from '../../../util/Grid';
import { defaultBaseSpeed } from '../../../util/Simulation';

type RunnerProps = {
  runnerPath: Position[];
  cellSize: number;
  timestep: number;
};

const Runner: React.FC<RunnerProps> = ({ runnerPath, cellSize, timestep }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isSlowed, setIsSlowed] = useState(false);
  const totalDuration = runnerPath.length * timestep;

  useEffect(() => {
    if (runnerPath.length < 2){
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const progress = elapsed / totalDuration;
      const index = Math.min(Math.floor(progress * runnerPath.length), runnerPath.length - 1);
      setCurrentPosition(runnerPath[index]);
      if (index + 1 < runnerPath.length){
        const slowedMovement = distance2D(runnerPath[index], runnerPath[index + 1]) < defaultBaseSpeed * 0.75 * timestep;
        if (slowedMovement !== isSlowed) {
          setIsSlowed(slowedMovement);
        }
      }

      if (index < runnerPath.length - 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSlowed, runnerPath, timestep, totalDuration]);

  if (!currentPosition) return null;

  return (
    <Circle
      x={currentPosition.x * cellSize + cellSize / 2}
      y={currentPosition.y * cellSize + cellSize / 2}
      radius={cellSize / 3}
      fill={isSlowed ? "blue" : "red"}
    />
  );
};

export default Runner;

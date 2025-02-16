import { useEffect, useRef, useState } from 'react';
import { Circle } from 'react-konva';
import { Position } from '../util/Grid';

type RunnerProps = {
  runnerPath: Position[];
  cellSize: number;
  timestep: number;
};

const Runner: React.FC<RunnerProps> = ({ runnerPath, cellSize, timestep }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (runnerPath.length < 2) return;

    const totalDuration = runnerPath.length * timestep; // Dynamic duration

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = (timestamp - startTimeRef.current) / 1000; // Convert to seconds

      const progress = elapsed / totalDuration; // 0 to 1
      const index = Math.min(Math.floor(progress * runnerPath.length), runnerPath.length - 1);

      setCurrentPosition(runnerPath[index]);

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
  }, [runnerPath, timestep]);

  if (!currentPosition) return null;

  return (
    <Circle
      x={currentPosition.x * cellSize + cellSize / 2}
      y={currentPosition.y * cellSize + cellSize / 2}
      radius={cellSize / 4}
      fill="red"
    />
  );
};

export default Runner;

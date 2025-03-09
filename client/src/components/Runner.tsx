import { Position } from '@mazing/util';
import { useEffect, useRef, useState } from 'react';
import { Circle, Line } from 'react-konva';

type RunnerProps = {
  runnerPath: Position[];
  runnerStatus: boolean[];
  runnerAngle: number[];
  cellSize: number;
  timestep: number;
};

const Runner: React.FC<RunnerProps> = ({ runnerPath, cellSize, timestep, runnerStatus, runnerAngle }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isSlowed, setIsSlowed] = useState(false);
  const totalDuration = runnerPath.length * timestep;

  useEffect(() => {
    if (runnerPath.length < 2) {
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

      setIsSlowed(runnerStatus[index]);

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
  }, [runnerPath, timestep, totalDuration, runnerStatus]);

  if (!currentPosition) return null;

  const angle = runnerAngle[runnerPath.indexOf(currentPosition)];

  const lineLength = cellSize / 3;

  return (
    <>
      <Circle
        x={currentPosition.x * cellSize + cellSize / 2}
        y={currentPosition.y * cellSize + cellSize / 2}
        radius={cellSize / 3}
        fill={isSlowed ? "blue" : "red"}
        stroke="black"
        strokeWidth={2}
        rotation={angle * (180 / Math.PI)}
      />
      <Line
        points={[
          currentPosition.x * cellSize + cellSize / 2,
          currentPosition.y * cellSize + cellSize / 2,
          currentPosition.x * cellSize + cellSize / 2 + lineLength * Math.cos(angle),
          currentPosition.y * cellSize + cellSize / 2 + lineLength * Math.sin(angle),
        ]}
        stroke="black"
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
      />
    </>
  );
};

export default Runner;

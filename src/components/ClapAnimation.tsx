import { useState, useEffect } from "react";
import { Circle } from "react-konva";

export interface ClapEvent {
  x: number;
  y: number;
  time: number;
}

interface ClapAnimationProps {
  clapEvents: ClapEvent[];
  cellSize: number;
  duration?: number;
}

const ClapAnimation: React.FC<ClapAnimationProps> = ({
  clapEvents,
  cellSize,
  duration = 500,
}) => {
  const [activeClaps, setActiveClaps] = useState<{ x: number; y: number; id: number }[]>([]);
  const [nextId, setNextId] = useState(0); // Unique ID for animations

  console.log(nextId)

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    clapEvents.forEach(({ x, y, time }) => {
      const timeout = setTimeout(() => {
        setActiveClaps((prev) => [...prev, { x, y, id: nextId }]);
        setNextId((id) => id + 1);

        // Remove the animation after `duration`
        setTimeout(() => {
          setActiveClaps((prev) => prev.filter((clap) => clap.id !== nextId));
        }, duration);
      }, time);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [clapEvents, duration, nextId]);

  return (
    <>
      {activeClaps.map(({ x, y, id }) => (
        <Circle
          key={id}
          x={x * cellSize + cellSize / 2}
          y={y * cellSize + cellSize / 2}
          radius={0}
          fill="blue"
          opacity={0.5}
          listening={false}
          scale={{ x: 1, y: 1 }}
          animation="ease-out"
          duration={duration}
          stroke="blue"
          strokeWidth={2}
        />
      ))}
    </>
  );
};

export default ClapAnimation;

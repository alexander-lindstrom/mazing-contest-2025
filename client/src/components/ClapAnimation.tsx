import React, { useEffect, useState } from "react";
import { Circle, Group } from "react-konva";
import { defaultClapRange } from "../../../util/Simulation";

export interface ClapEvent {
  x: number;
  y: number;
  time: number;
}

interface ClapAnimationProps {
  events: ClapEvent[];
  cellSize: number;
}

const duration = 0.5
const persistenceDuration = 1;
const radius = defaultClapRange;

const ClapAnimation: React.FC<ClapAnimationProps> = ({
  events,
  cellSize,
}) => {
  const [activeClaps, setActiveClaps] = useState<{ id: number; x: number; y: number; progress: number }[]>([]);

  useEffect(() => {
    let animationFrame: number;
    const startTime = performance.now();

    const update = () => {
      const currentTime = (performance.now() - startTime) / 1000;
      const newClaps = events
        .filter((event) => currentTime >= event.time && currentTime <= event.time + duration + persistenceDuration)
        .map((event, index) => {
          const timeInEvent = currentTime - event.time;
          let progress = 0;

          if (timeInEvent <= duration) {
            progress = timeInEvent / duration;
          }
          else if (timeInEvent <= duration + persistenceDuration) {
            progress = 1;
          }

          return {
            id: index,
            x: event.x * cellSize + cellSize / 2,
            y: event.y * cellSize + cellSize / 2,
            progress,
          };
        });

      setActiveClaps(newClaps);
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [cellSize, events]);

  return (
    <Group>
      {activeClaps.map(({ id, x, y, progress }) => (
        <Circle
          key={id}
          x={x}
          y={y}
          radius={progress * cellSize * radius}
          stroke="blue"
          strokeWidth={2}
          opacity={1}
        />
      ))}
    </Group>
  );
};

export default ClapAnimation;

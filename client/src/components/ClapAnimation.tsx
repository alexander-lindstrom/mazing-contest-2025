import useSound from "@/hooks/useSound";
import { ClapEvent, defaultClapRange } from "@mazing/util";
import React, { useEffect, useRef, useState } from "react";
import { Circle, Group } from "react-konva";
import clapTowerSound from "../sounds/clap_tower_effect.wav";

interface ClapAnimationProps {
  events: ClapEvent[];
  cellSize: number;
}

const duration = 0.5;
const persistenceDuration = 1;
const radius = defaultClapRange;

const ClapAnimation: React.FC<ClapAnimationProps> = ({
  events,
  cellSize,
}) => {
  const [activeClaps, setActiveClaps] = useState<{ id: string; x: number; y: number; progress: number; opacity: number }[]>([]);
  const playedEventIds = useRef<Set<string>>(new Set());
  const playClapTowerSound = useSound(clapTowerSound, 0.5);

  useEffect(() => {
    let animationFrame: number;
    const startTime = performance.now();

    const update = () => {
      const currentTime = (performance.now() - startTime) / 1000;
      const newClaps = events
        .filter((event) => currentTime >= event.time && currentTime <= event.time + duration + persistenceDuration)
        .map((event) => {
          const timeInEvent = currentTime - event.time;
          let progress = 0;
          let opacity = 1;

          if (timeInEvent <= duration) {
            progress = timeInEvent / duration;
          } else if (timeInEvent <= duration + persistenceDuration) {
            progress = 1;
            opacity = 1 - (timeInEvent - duration) / persistenceDuration;
          }

          if (timeInEvent >= 0 && timeInEvent <= 0.05 && !playedEventIds.current.has(event.id)) {
            playClapTowerSound();
            playedEventIds.current.add(event.id);
          }

          return {
            id: event.id,
            x: event.x * cellSize + cellSize / 2,
            y: event.y * cellSize + cellSize / 2,
            progress,
            opacity,
          };
        });

      setActiveClaps(newClaps);
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellSize, events]);

  return (
    <Group>
      {activeClaps.map(({ id, x, y, progress, opacity }) => (
        <Circle
          key={id}
          x={x}
          y={y}
          radius={progress * cellSize * radius}
          stroke="blue"
          strokeWidth={2}
          opacity={opacity}
        />
      ))}
    </Group>
  );
};

export default ClapAnimation;
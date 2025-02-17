import { useState, useEffect, useRef } from "react";
import { Circle } from "react-konva";
import Konva from "konva";
import { defaultClapRange } from "../util/Simulation";

export interface ClapEvent {
  x: number;
  y: number;
  time: number;
}

interface ClapAnimationProps {
  clapEvents: ClapEvent[];
  cellSize: number;
  duration?: number;
  currentSimulationTime?: number;
}

const ClapAnimation: React.FC<ClapAnimationProps> = ({
  clapEvents,
  cellSize,
  duration = 2000,
  currentSimulationTime = 0,
}) => {
  const [activeClaps, setActiveClaps] = useState<{ x: number; y: number; id: number }[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevClapEventsRef = useRef<ClapEvent[]>([]);
  
  useEffect(() => {
    // Find only new clap events (simple comparison approach)
    const newClapEvents = clapEvents.filter(
      event => !prevClapEventsRef.current.some(
        prev => prev.x === event.x && prev.y === event.y && prev.time === event.time
      )
    );
    
    // Update our tracked clap events
    prevClapEventsRef.current = [...prevClapEventsRef.current, ...newClapEvents];
    
    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    
    newClapEvents.forEach(({ x, y, time }) => {
      // Calculate delay - use 0 if the clap time is in the past
      const delay = Math.max(0, time - currentSimulationTime);
      console.log(delay)
      const clapId = Date.now() + Math.random();
      
      const timeout = setTimeout(() => {
        setActiveClaps((prev) => [...prev, { x, y, id: clapId }]);
        
        // Remove the animation after `duration`
        const cleanupTimeout = setTimeout(() => {
          setActiveClaps((prev) => prev.filter((clap) => clap.id !== clapId));
        }, duration);
        
        timeoutsRef.current.push(cleanupTimeout);
      }, delay);
      
      timeoutsRef.current.push(timeout);
    });
    
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [clapEvents, duration, currentSimulationTime]);

  return (
    <>
      {activeClaps.map(({ x, y, id }) => (
        <Circle
          key={id}
          x={x * cellSize + cellSize / 2}
          y={y * cellSize + cellSize / 2}
          radius={cellSize / 10}
          fill="rgba(0, 0, 255, 0.3)"
          listening={false}
          ref={(node) => {
            if (node) {
              node.to({
                radius: cellSize * defaultClapRange,
                opacity: 1,
                duration: duration / 1000,
                easing: Konva.Easings.EaseOut
              });
            }
          }}
        />
      ))}
    </>
  );
};

export default ClapAnimation;
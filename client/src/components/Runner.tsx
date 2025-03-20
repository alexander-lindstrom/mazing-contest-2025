import { Position } from '@mazing/util';
import { useEffect, useRef, useState } from 'react';
import { Group, Circle, Rect } from 'react-konva';

type RunnerProps = {
  runnerPath: Position[];
  runnerStatus: boolean[];
  runnerAngle: number[];
  cellSize: number;
  timestep: number;
  startIndex?: number;
};

const Runner: React.FC<RunnerProps> = ({ 
  runnerPath,
  cellSize,
  timestep, 
  runnerStatus, 
  runnerAngle,
  startIndex = 0,
 }) => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isSlowed, setIsSlowed] = useState(false);

  useEffect(() => {
    if (runnerPath.length < 2) {
      return;
    }
    
    if (runnerPath.length <= startIndex) {
      const lastIndex = runnerPath.length - 1;
      setCurrentPosition(runnerPath[lastIndex]);
      setCurrentIndex(lastIndex);
      setIsSlowed(false);
      return;
    }
  
    startTimeRef.current = null;
  
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const progress = (elapsed / (runnerPath.length * timestep)) + (startIndex / runnerPath.length);
      const index = Math.min(Math.floor(progress * runnerPath.length), runnerPath.length - 1);
      
      setCurrentPosition(runnerPath[index]);
      setCurrentIndex(index);
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
  }, [runnerPath, timestep, runnerStatus, startIndex]);
  

  if (!currentPosition) {
    return null;
  }

  const angle = runnerAngle[currentIndex];
  
  const renderCharacter = () => {
    const centerX = currentPosition.x * cellSize + cellSize / 2;
    const centerY = currentPosition.y * cellSize + cellSize / 2;
    const size = cellSize * 0.6;
    
    return (
      <Group
        x={centerX}
        y={centerY}
        rotation={angle * (180 / Math.PI)}
      >
        <Rect
          x={-size/2}
          y={-size/3}
          width={size}
          height={size/1.5}
          cornerRadius={5}
          fill={isSlowed ? "#4169E1" : "#FF4500"}
          shadowColor="black"
          shadowBlur={3}
          shadowOffset={{ x: 1, y: 1 }}
          shadowOpacity={0.3}
        />
        
        <Rect
          x={-size/4}
          y={-size/3}
          width={size/2}
          height={size/4}
          cornerRadius={3}
          fill={isSlowed ? "#87CEFA" : "#FFD700"}
        />
        
        <Circle x={-size/3} y={-size/5} radius={size/10} fill="#333" />
        <Circle x={size/3} y={-size/5} radius={size/10} fill="#333" />
        <Circle x={-size/3} y={size/5} radius={size/10} fill="#333" />
        <Circle x={size/3} y={size/5} radius={size/10} fill="#333" />
        
        <Circle x={size/2 - 2} y={-size/6} radius={size/12} fill="yellow" />
        <Circle x={size/2 - 2} y={size/6} radius={size/12} fill="yellow" />
      </Group>
    );
  };
  
  const renderGlow = () => {
    if (!isSlowed) {
      return null;
    }
    
    return (
      <Circle
        x={currentPosition.x * cellSize + cellSize / 2}
        y={currentPosition.y * cellSize + cellSize / 2}
        radius={cellSize * 0.5}
        fill="rgba(0, 100, 255, 0.2)"
        shadowColor="blue"
        shadowBlur={10}
        shadowOpacity={0.6}
      />
    );
  };

  return (
    <>
      {renderGlow()}
      {renderCharacter()}
    </>
  );
};

export default Runner;
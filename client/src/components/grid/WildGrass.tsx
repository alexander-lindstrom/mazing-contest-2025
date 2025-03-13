import { Group, Line, Rect } from "react-konva";
import { BasePositionProps } from "../GridRenderer";

export const WildGrass: React.FC<BasePositionProps> = ({ x, y, size, id }) => {
  const tileSize = size;
  const halfSize = tileSize / 2;
  
  const grassBaseColor = "#3a7a28";
  const grassStalkColor = "#4e9636";
  
  const grassPatterns = [
    { points: [0, 0, -3, -halfSize * 0.7], width: 2.2 },
    { points: [0, 0, 0, -halfSize * 0.8], width: 2.5 },
    { points: [0, 0, 3, -halfSize * 0.75], width: 2.2 },
    
    { points: [-halfSize * 0.5, 0, -halfSize * 0.6, -halfSize * 0.5], width: 2 },
    { points: [-halfSize * 0.5, 0, -halfSize * 0.45, -halfSize * 0.6], width: 2 },
    { points: [-halfSize * 0.5, 0, -halfSize * 0.35, -halfSize * 0.55], width: 1.8 },
    
    { points: [halfSize * 0.5, 0, halfSize * 0.6, -halfSize * 0.5], width: 2 },
    { points: [halfSize * 0.5, 0, halfSize * 0.45, -halfSize * 0.6], width: 2 },
    { points: [halfSize * 0.5, 0, halfSize * 0.35, -halfSize * 0.55], width: 1.8 },
    
    { points: [-halfSize * 0.4, halfSize * 0.3, -halfSize * 0.5, -halfSize * 0.2], width: 1.8 },
    { points: [-halfSize * 0.4, halfSize * 0.3, -halfSize * 0.35, -halfSize * 0.3], width: 1.8 },
    
    { points: [halfSize * 0.4, halfSize * 0.3, halfSize * 0.5, -halfSize * 0.2], width: 1.8 },
    { points: [halfSize * 0.4, halfSize * 0.3, halfSize * 0.35, -halfSize * 0.3], width: 1.8 },
  ];
  
  return (
    <Group 
      x={x} 
      y={y} 
      id={id} 
    >
      <Rect
        x={-halfSize}
        y={-halfSize}
        width={tileSize}
        height={tileSize}
        fill={grassBaseColor}
      />
      
      {grassPatterns.map((grass, i) => (
        <Line
          key={i}
          points={grass.points}
          stroke={grassStalkColor}
          strokeWidth={grass.width}
          lineCap="round"
          tension={0.3}
        />
      ))}
      
      <Line
        points={[-5, -halfSize * 0.3, -8, -halfSize * 0.5, -4, -halfSize * 0.55]}
        stroke={grassStalkColor}
        strokeWidth={1.5}
        lineCap="round"
        tension={0.5}
      />
      <Line
        points={[5, -halfSize * 0.3, 8, -halfSize * 0.5, 4, -halfSize * 0.55]}
        stroke={grassStalkColor}
        strokeWidth={1.5}
        lineCap="round"
        tension={0.5}
      />
    </Group>
  );
};
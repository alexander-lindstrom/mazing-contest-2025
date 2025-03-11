import { Group, Line, Rect } from "react-konva";
import { BasePositionProps } from "../GridRenderer";

export const WildGrass: React.FC<BasePositionProps> = ({ x, y, size, id }) => {
  const tileSize = size;
  const halfSize = tileSize / 2;
  
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
        fill="#60a048"
      />
      
      {[...Array(12)].map((_, i) => {
        const angle = Math.PI * 2 * (i / 12);
        const distance = (Math.random() * 0.3 + 0.2) * halfSize;
        const tuftX = Math.cos(angle) * distance;
        const tuftY = Math.sin(angle) * distance;
        const tuftHeight = (Math.random() * 0.2 + 0.1) * tileSize;
        
        return (
          <Line
            key={i}
            points={[tuftX, tuftY, tuftX, tuftY - tuftHeight]}
            stroke="#88c075"
            strokeWidth={2}
            lineCap="round"
          />
        );
      })}
      
      <Line
        points={[0, 0, 0, -halfSize * 0.4]}
        stroke="#88c075"
        strokeWidth={2.5}
        lineCap="round"
      />
    </Group>
  );
};
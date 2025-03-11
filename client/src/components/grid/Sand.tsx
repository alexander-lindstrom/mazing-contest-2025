import { Circle, Group, Rect } from "react-konva";
import { BasePositionProps } from "../GridRenderer";

export const Sand: React.FC<BasePositionProps> = ({ x, y, size, id }) => {
    return (
      <Group
        x={x}
        y={y}
        id={id}
      >
        <Rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          fill="#e5c39c"
        />
        
        {[...Array(15)].map((_, i) => {
          const dotX = (Math.random() - 0.5) * size * 0.8;
          const dotY = (Math.random() - 0.5) * size * 0.8;
          const dotSize = Math.random() * 1.5 + 0.5;
          
          return (
            <Circle
              key={i}
              x={dotX}
              y={dotY}
              radius={dotSize}
              fill="#d9b38c"
            />
          );
        })}
      </Group>
    );
  };
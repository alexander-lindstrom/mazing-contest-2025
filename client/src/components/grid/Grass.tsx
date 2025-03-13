import { Group, Rect } from "react-konva";
import { BasePositionProps } from "../GridRenderer";

export const Grass: React.FC<BasePositionProps> = ({ x, y, size, id }) => {
  const baseColor = "#7cad68";
  const accentColor = "#6a9b58";
  const patchSize = size / 4;
  
  const grassPattern = [
    { x: 0, y: 0 },
    { x: patchSize, y: -patchSize },
    { x: -patchSize, y: patchSize },
  ];
  
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
        fill={baseColor}
      />
      
      
      {grassPattern.map((patch, i) => (
        <Rect
          key={i}
          x={patch.x - patchSize / 2}
          y={patch.y - patchSize / 2}
          width={patchSize}
          height={patchSize}
          fill={accentColor}
          opacity={0.2}
          cornerRadius={2}
        />
      ))}
      
    </Group>
  );
};
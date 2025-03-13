import { Group, Rect, Line } from "react-konva";
import { BasePositionProps } from "../GridRenderer";

export const Sand: React.FC<BasePositionProps> = ({ x, y, size, id }) => {
  const sandBaseColor = "#e6c878";
  const sandShadowColor = "#d4ad60";
  
  const createDuneCurve = (offsetY: number, amplitude:number, width: number) => {
    const points = [];
    
    for (let i = 0; i <= 12; i++) {
      const xPos = (i / 12) * width - width / 2;
      const yValue = Math.sin(i * 0.5) * amplitude + offsetY;
      points.push(xPos, yValue);
    }
    
    return points;
  };
  
  const dunePositions = [
    { offsetY: -size * 0.3, amplitude: size * 0.06, width: size },
    { offsetY: -size * 0.1, amplitude: size * 0.04, width: size },
    { offsetY: size * 0.1, amplitude: size * 0.05, width: size },
    { offsetY: size * 0.3, amplitude: size * 0.07, width: size },
  ];

  return (
    <Group x={x} y={y} id={id}>
      <Rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        fill={sandBaseColor}
      />
      
      {dunePositions.map((dune, index) => (
        <Line
          key={index}
          points={createDuneCurve(dune.offsetY, dune.amplitude, dune.width)}
          stroke={sandShadowColor}
          strokeWidth={size * 0.03}
          lineCap="round"
          lineJoin="round"
          tension={0.3}
          opacity={0.7}
        />
      ))}
    </Group>
  );
};
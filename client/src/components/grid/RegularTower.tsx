import { Circle, Group, Rect, RegularPolygon } from "react-konva";

export const RegularTower: React.FC<{
    x: number;
    y: number;
    towerRadius: number;
    sellable: boolean;
    effectRadius?: number;
    showEffectBorder?: boolean;
    id?: string;
  }> = ({ 
    x, 
    y, 
    towerRadius, 
    sellable = false,
    id, 
  }) => {

    const scale = towerRadius / 42; 
    
    const outerHexRadius = 20 * scale;
    const innerHexRadius = 15 * scale;
    const middleCircleRadius = 15 * scale;
    const innerCircleRadius = 8 * scale;
    const centerDotRadius = 4 * scale;
    const indicatorRadius = 2 * scale;
    const highlightRadius = 2 * scale;
    
    const bgColor = sellable ? "#4CAF50" : "#607D8B";
    const bgOpacity = sellable ? 0.5 : 0.4;
    
    return (
      <Group x={x} y={y} id={id}>

        <Rect
          width={towerRadius}
          height={towerRadius}
          offsetX={towerRadius / 2}
          offsetY={towerRadius / 2}
          fill={bgColor}
          opacity={bgOpacity}
        />
       
        <RegularPolygon
          sides={6}
          radius={outerHexRadius}
          fill="#5d4037"
          stroke="#3e2723"
          strokeWidth={2 * scale}
          rotation={30}
        />
        
        <RegularPolygon
          sides={6}
          radius={innerHexRadius}
          fill="#795548"
          stroke="#5d4037"
          strokeWidth={1 * scale}
          rotation={30}
        />
        
        <Circle
          radius={middleCircleRadius}
          fill="#e57373"
          stroke="#ef5350"
          strokeWidth={2 * scale}
        />
        
        <Circle
          radius={innerCircleRadius}
          fill="#ffcdd2"
          stroke="#ef9a9a"
          strokeWidth={1 * scale}
        />
        
        <Circle
          radius={centerDotRadius}
          fill="#b71c1c"
          stroke="#b71c1c"
          strokeWidth={1 * scale}
        />
        
        <Circle
          x={-5 * scale}
          y={-5 * scale}
          radius={highlightRadius}
          fill="white"
          opacity={0.7}
        />
        
        <Circle
          y={-12 * scale}
          radius={indicatorRadius}
          fill="#ef5350"
        />
        <Circle
          x={12 * scale}
          radius={indicatorRadius}
          fill="#ef5350"
        />
        <Circle
          y={12 * scale}
          radius={indicatorRadius}
          fill="#ef5350"
        />
        <Circle
          x={-12 * scale}
          radius={indicatorRadius}
          fill="#ef5350"
        />
      </Group>
    );
  };
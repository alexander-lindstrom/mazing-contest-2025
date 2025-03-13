import { Group, Rect, Circle } from "react-konva";

export const BlockingTower: React.FC<{
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
    
    const baseColor = "#78909C";
    const borderColor = "#455A64";
    const sellIndicatorColor = "#4CAF50";
    
    const scale = towerRadius / 40;
    
    return (
      <Group x={x} y={y} id={id}>
        <Rect
          width={towerRadius}
          height={towerRadius}
          offsetX={towerRadius / 2}
          offsetY={towerRadius / 2}
          fill={baseColor}
          stroke={borderColor}
          strokeWidth={2 * scale}
          cornerRadius={3 * scale}
        />
        
        <Rect
          width={towerRadius * 0.7}
          height={towerRadius * 0.7}
          offsetX={towerRadius * 0.35}
          offsetY={towerRadius * 0.35}
          fill={baseColor}
          stroke={borderColor}
          strokeWidth={3 * scale}
          cornerRadius={2 * scale}
          rotation={45}
        />
        
        <Circle
          radius={towerRadius * 0.12}
          fill={baseColor}
          stroke={borderColor}
          strokeWidth={2 * scale}
        />
        
        {sellable && (
          <>
            <Circle
              radius={towerRadius * 0.1}
              x={towerRadius * 0.3}
              y={-towerRadius * 0.3}
              fill={sellIndicatorColor}
              stroke={borderColor}
              strokeWidth={1 * scale}
            />
            <Rect
              width={towerRadius * 0.12}
              height={towerRadius * 0.02}
              x={towerRadius * 0.3}
              y={-towerRadius * 0.3}
              offsetX={towerRadius * 0.06}
              offsetY={towerRadius * 0.01}
              fill={baseColor}
            />
            <Rect
              width={towerRadius * 0.02}
              height={towerRadius * 0.12}
              x={towerRadius * 0.3}
              y={-towerRadius * 0.3}
              offsetX={towerRadius * 0.01}
              offsetY={towerRadius * 0.06}
              fill={baseColor}
            />
          </>
        )}
      </Group>
    );
  };
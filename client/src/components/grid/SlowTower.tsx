import React, { useEffect, useRef, useState } from 'react';
import { Group, Circle, RegularPolygon, Arc, Rect } from 'react-konva';

interface SlowTowerProps {
  x: number;
  y: number;
  towerRadius: number;
  sellable: boolean;
  effectRadius?: number;
  showEffectBorder?: boolean;
  id?: string;
}

const SlowTower: React.FC<SlowTowerProps> = ({ 
  x, 
  y, 
  towerRadius, 
  effectRadius, 
  sellable,
  showEffectBorder = true, 
  id, 
}) => {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  
  const actualEffectRadius = effectRadius || towerRadius * 2;
  
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;
      
      rotationRef.current = (rotationRef.current + deltaTime * 0.05) % 360;
      setRotation(rotationRef.current);
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  const scale = towerRadius / 42;
  

  const outerHexRadius = 20 * scale;
  const innerHexRadius = 15 * scale;
  const middleCircleRadius = 15 * scale;
  const innerCircleRadius = 8 * scale;
  const centerDotRadius = 4 * scale;
  const indicatorRadius = 2 * scale;
  const highlightRadius = 2 * scale;
  
  const radarLength = 22 * scale;

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

      {showEffectBorder && (
        <Circle
          radius={actualEffectRadius}
          fill="rgba(100, 181, 246, 0.15)"
          stroke="#64b5f6"
          strokeWidth={1 * scale}
          dash={[3 * scale, 2 * scale]}
        />
      )}
      
      <RegularPolygon
        sides={6}
        radius={outerHexRadius}
        fill="#546e7a"
        stroke="#37474f"
        strokeWidth={2 * scale}
        rotation={30}
      />
      
      <RegularPolygon
        sides={6}
        radius={innerHexRadius}
        fill="#78909c"
        stroke="#546e7a"
        strokeWidth={1 * scale}
        rotation={30}
      />
      
      <Circle
        radius={middleCircleRadius}
        fill="#90caf9"
        stroke="#64b5f6"
        strokeWidth={2 * scale}
      />
      
      <Circle
        radius={innerCircleRadius}
        fill="#e1f5fe"
        stroke="#b3e5fc"
        strokeWidth={1 * scale}
      />
      
      <Group rotation={rotation}>
        <Arc
          angle={120}
          innerRadius={0}
          outerRadius={radarLength}
          fill="#bbdefb"
          stroke="#64b5f6"
          strokeWidth={1.5 * scale}
          opacity={0.8}
        />
        
        <Circle
          radius={centerDotRadius}
          fill="#0d47a1"
          stroke="#0d47a1"
          strokeWidth={1 * scale}
        />
      </Group>
      
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
        fill="#29b6f6"
      />
      <Circle
        x={12 * scale}
        radius={indicatorRadius}
        fill="#29b6f6"
      />
      <Circle
        y={12 * scale}
        radius={indicatorRadius}
        fill="#29b6f6"
      />
      <Circle
        x={-12 * scale}
        radius={indicatorRadius}
        fill="#29b6f6"
      />
    </Group>
  );
};

export default SlowTower;
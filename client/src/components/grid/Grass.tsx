import { Rect } from "react-konva";
import { BasePositionProps } from "../GridRenderer";

export const Grass: React.FC<BasePositionProps> = ({ x, y, size, id }) => {
    return (
      <Rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill="#7cad68"
        id={id}
      />
    );
  };
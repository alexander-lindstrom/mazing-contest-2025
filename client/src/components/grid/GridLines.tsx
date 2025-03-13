import { Line } from "react-konva";

interface GridLinesProps {
  width: number;
  height: number;
  cellSize: number;
}

export const GridLines: React.FC<GridLinesProps> = ({ width, height, cellSize }) => {
  const lines = [];

  for (let x = 0; x <= width; x += cellSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke="black"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }

  for (let y = 0; y <= height; y += cellSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke="black"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
};

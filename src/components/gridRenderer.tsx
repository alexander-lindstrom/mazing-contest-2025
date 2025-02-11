// src/components/GridRenderer.tsx
import { Stage, Layer, Rect, Text } from 'react-konva';
import { GridCell, GridProperties, TowerType } from '../types/grid';


const CELL_SIZE = 50;
const CELL_PADDING = 1;

const getCellColor = (cell: GridCell): string => {
    switch (cell) {
      case GridCell.GRASS:
        return '#90EE90'; // Light green
      case GridCell.GRASS_NOBUILD:
        return '#698269'; // Darker green
      case GridCell.SAND:
        return '#F4D03F'; // Sand yellow
      case GridCell.BLOCK_TOWER:
        return '#E74C3C'; // Bright red for sellable block tower
      case GridCell.BLOCK_TOWER_NOSELL:
        return '#922B21'; // Darker red for non-sellable block tower
      case GridCell.CLAP_TOWER:
        return '#3498DB'; // Bright blue for sellable clap tower
      case GridCell.CLAP_TOWER_NOSELL:
        return '#1F618D'; // Darker blue for non-sellable clap tower
      default:
        return '#FFFFFF';
    }
  };

const getTowerSymbol = (type: TowerType): string => {
  switch (type) {
    case TowerType.BLOCK_TOWER:
    case TowerType.BLOCK_TOWER_NOSELL:
      return '▣'; // Block symbol
    case TowerType.CLAP_TOWER:
    case TowerType.CLAP_TOWER_NOSELL:
      return '◈'; // Diamond symbol
    default:
      return '?';
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GridRenderer: React.FC<GridProperties> = ({ height, width, grid, towers }) => {
  const canvasWidth = width * CELL_SIZE;
  const canvasHeight = height * CELL_SIZE;

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <Rect
              key={`${x}-${y}`}
              x={x * CELL_SIZE + CELL_PADDING}
              y={y * CELL_SIZE + CELL_PADDING}
              width={CELL_SIZE - 2 * CELL_PADDING}
              height={CELL_SIZE - 2 * CELL_PADDING}
              fill={getCellColor(cell)}
              strokeWidth={1}
              stroke="#000"
              cornerRadius={2}
            />
          ))
        )}

        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (
              cell === GridCell.BLOCK_TOWER ||
              cell === GridCell.CLAP_TOWER ||
              cell === GridCell.BLOCK_TOWER_NOSELL ||
              cell === GridCell.CLAP_TOWER_NOSELL
            ) {
              const towerType = cell === GridCell.BLOCK_TOWER || cell === GridCell.BLOCK_TOWER_NOSELL
                ? TowerType.BLOCK_TOWER
                : TowerType.CLAP_TOWER;
              
              return (
                <Text
                  key={`tower-${x}-${y}`}
                  x={x * CELL_SIZE}
                  y={y * CELL_SIZE}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  text={getTowerSymbol(towerType)}
                  fontSize={30}
                  fill="#000"
                  align="center"
                  verticalAlign="middle"
                />
              );
            }
            return null;
          })
        )}
      </Layer>
    </Stage>
  );
};

export default GridRenderer;
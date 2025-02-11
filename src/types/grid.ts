export enum GridCell {
    GRASS,
    GRASS_NOBUILD,
    SAND,
    BLOCK_TOWER,
    CLAP_TOWER,
    BLOCK_TOWER_NOSELL,
    CLAP_TOWER_NOSELL,
  }
  
export enum TowerType {
    BLOCK_TOWER,
    CLAP_TOWER,
    BLOCK_TOWER_NOSELL,
    CLAP_TOWER_NOSELL,
}
  
export type GridProperties = {
    height: number;
    width: number;
    grid: GridCell[][];
    towers: TowerType[];
}

//20x20 - towers 2x2
const defaultHeight = 40;
const defaultWidth = 40;

const centerMid = Math.floor(defaultWidth / 2);
const centerLeft = centerMid - 1;
const centerRight = centerMid + 1;

const emptyGrid = Array(defaultHeight).fill(null).map((_, rowIndex) => {
  const row = Array(defaultWidth).fill(GridCell.GRASS);
  
  if (rowIndex === 0 || rowIndex === defaultHeight - 1) {
    row.fill(GridCell.SAND);
    
    row[centerLeft] = GridCell.GRASS_NOBUILD;
    row[centerMid] = GridCell.GRASS_NOBUILD;
    row[centerRight] = GridCell.GRASS_NOBUILD;
  }
  else {
    row[0] = GridCell.SAND;                 
    row[defaultWidth - 1] = GridCell.SAND;
  }
  
  return row;
});


export const defaultGrid = {
    height: defaultHeight,
    width: defaultWidth,
    grid: emptyGrid,
    towers: []
};

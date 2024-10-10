import { Point, Tile } from "./index";
import eastWest from "/paths/Road 1.png";
import northSouth from "/paths/Road 2.png";
// import northSouthEastWest from "/paths/Road 3 crossing.png";
import northSouthWest from "/paths/Road 10 Detour.png";
import northSouthEast from "/paths/Road 11 Detour.png";
import southEast from "/paths/Road 4 Turn.png";
import southWest from "/paths/Road 5 Turn.png";
import northWest from "/paths/Road 6 Turn.png";
import northEast from "/paths/Road 7 Turn.png";
import southEastWest from "/paths/Road 8 Detour.png";
import northEastWest from "/paths/Road 9 Detour.png";
import grass from "/paths/Terrain 1.png";

// If paths are connected increase the depth of the tile
// This hard coded array is used to determine the paths of the tiles
// Works only with 7x7 grid
const SE_PATHS = new Array(4).fill([southEast, ["SOUTH", "EAST"]]);
const SW_PATHS = new Array(4).fill([southWest, ["SOUTH", "WEST"]]);
const NW_PATHS = new Array(4).fill([northWest, ["NORTH", "WEST"]]);
const NE_PATHS = new Array(3).fill([northEast, ["NORTH", "EAST"]]);
const movablePaths1 = SE_PATHS.concat(SW_PATHS, NW_PATHS, NE_PATHS);

const EW_PATHS = new Array(6).fill([eastWest, ["EAST", "WEST"]]);
const NS_PATHS = new Array(7).fill([northSouth, ["NORTH", "SOUTH"]]);
const movablePaths2 = EW_PATHS.concat(NS_PATHS);

const SEW_PATHS = new Array(1).fill([southEastWest, ["SOUTH", "EAST", "WEST"]]);
const NEW_PATHS = new Array(2).fill([northEastWest, ["NORTH", "EAST", "WEST"]]);
const NSW_PATHS = new Array(1).fill([
  northSouthWest,
  ["NORTH", "SOUTH", "WEST"],
]);
const NSE_PATHS = new Array(2).fill([
  northSouthEast,
  ["NORTH", "SOUTH", "EAST"],
]);
const movablePaths3 = SEW_PATHS.concat(NEW_PATHS, NSW_PATHS, NSE_PATHS);

const movablePaths4 = movablePaths1.concat(movablePaths2, movablePaths3);

class Grid {
  worldWidth: number;
  rows: number;
  cols: number;
  tileWidth: number;
  tileHeight: number;
  tileDepth: number;
  tiles: Tile[][];
  hoveredTile: Tile | null = null;
  extraTile: Tile | null = null;
  images: Map<string, HTMLImageElement> = new Map();

  constructor(
    worldWidth: number,
    rows: number,
    cols: number,
    tileWidth: number,
    tileHeight: number,
    tileDepth: number
  ) {
    this.worldWidth = worldWidth;
    this.rows = rows + 2; // Add two rows as action tiles, from where extra room slides in
    this.cols = cols + 2; // Add two cols as action tiles, from where extra room slides in
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tileDepth = tileDepth;
    this.tiles = new Array(this.rows)
      .fill(null)
      .map(() => new Array(this.cols).fill(null));
  }

  async init() {
    await this.preloadImages().then(() => {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          const [imgSrc, paths] = !this.isEdge(row, col)
            ? this.imageSelector(row - 1, col - 1)
            : [grass, []];

          this.tiles[row][col] = new Tile(
            new Point(row, col),
            this.tileWidth,
            this.tileHeight,
            this.tileDepth,
            this.images.get(decodeURIComponent(imgSrc)) as HTMLImageElement,
            paths,
            this.getTileType(row, col)
          );
        }
      }
      const [imgSrc, paths] = this.getRandomMovablePath();
      console.log(imgSrc, paths);
      this.extraTile = new Tile(
        new Point(4, -2),
        this.tileWidth,
        this.tileHeight,
        this.tileDepth,
        this.images.get(decodeURIComponent(imgSrc)) as HTMLImageElement,
        paths,
        "MOVABLE"
      );
    });
  }

  private preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
  }

  private async preloadImages() {
    const images = [
      "/paths/Road 1.png",
      "/paths/Road 2.png",
      "/paths/Road 4 Turn.png",
      "/paths/Road 5 Turn.png",
      "/paths/Road 6 Turn.png",
      "/paths/Road 7 Turn.png",
      "/paths/Road 8 Detour.png",
      "/paths/Road 9 Detour.png",
      "/paths/Road 10 Detour.png",
      "/paths/Road 11 Detour.png",
      "/paths/Terrain 1.png",
    ];

    for (const src of images) {
      await this.preloadImage(src).then((img) => {
        this.images.set(src, img);
      });
    }
  }

  private getTileType(x: number, y: number) {
    if (this.isCorner(x, y) || (this.isEdge(x, y) && !this.isEvenTile(x, y))) {
      return "EMPTY";
    } else if (this.isEdge(x, y) && this.isEvenTile(x, y)) {
      return "ACTION";
    } else if (this.isOddTile(x, y)) {
      return "FIXED";
    }
    return "MOVABLE";
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.tiles[row][col].draw(ctx, this.worldWidth);
      }
    }
    this.extraTile?.draw(ctx, this.worldWidth);
  }

  private imageSelector(x: number, y: number): [string, string[]] {
    switch (true) {
      case x === 0 && y === 0:
        return [southEast, ["SOUTH", "EAST"]];
      case x === 0 && y === this.cols - 3:
        return [northEast, ["NORTH", "EAST"]];
      case x === this.rows - 3 && y === 0:
        return [southWest, ["SOUTH", "WEST"]];
      case x === this.rows - 3 && y === this.cols - 3:
        return [northWest, ["NORTH", "WEST"]];
      case x === 0 && y % 2 === 0:
        return [northSouthEast, ["NORTH", "SOUTH", "EAST"]];
      case x === this.rows - 3 && y % 2 === 0:
        return [northSouthWest, ["NORTH", "SOUTH", "WEST"]];
      case y === 0 && x % 2 === 0:
        return [southEastWest, ["SOUTH", "EAST", "WEST"]];
      case y === this.cols - 3 && x % 2 === 0:
        return [northEastWest, ["NORTH", "EAST", "WEST"]];
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x < (this.rows - 3) / 2 &&
        y < (this.cols - 3) / 2:
        return [northSouthEast, ["NORTH", "SOUTH", "EAST"]];
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x > (this.rows - 3) / 2 &&
        y > (this.cols - 3) / 2:
        return [northSouthWest, ["NORTH", "SOUTH", "WEST"]];
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x < (this.rows - 3) / 2 &&
        y > (this.cols - 3) / 2:
        return [northEastWest, ["NORTH", "EAST", "WEST"]];
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x > (this.rows - 3) / 2 &&
        y < (this.cols - 3) / 2:
        return [southEastWest, ["SOUTH", "EAST", "WEST"]];
      default:
        // return [grass, []];
        return this.getRandomMovablePath();
    }
  }

  private getRandomMovablePath(): [string, string[]] {
    const randomIndex = Math.random() * movablePaths4.length;
    const [removedPath] = movablePaths4.splice(randomIndex, 1);

    return removedPath;
  }

  getTile(screenX: number, screenY: number): Tile | null {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const { x, y } = this.tiles[row][col].screenToIso(
          screenX,
          screenY,
          this.worldWidth
        );
        if (this.isWithinGrid(x, y)) {
          return this.tiles[x][y];
        }
      }
    }
    return null;
  }

  isWithinGrid(row: number, col: number) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  isCorner(row: number, col: number) {
    return (
      (row === 0 && col === 0) ||
      (row === 0 && col === this.cols - 1) ||
      (row === this.rows - 1 && col === 0) ||
      (row === this.rows - 1 && col === this.cols - 1)
    );
  }

  isEdge(row: number, col: number) {
    return (
      row === 0 || row === this.rows - 1 || col === 0 || col === this.cols - 1
    );
  }

  isEvenTile(row: number, col: number) {
    return row % 2 === 0 && col % 2 === 0;
  }

  isOddTile(row: number, col: number) {
    return row % 2 === 1 && col % 2 === 1;
  }

  isActionTile(tile: Tile) {
    return tile.tileType === "ACTION";
  }

  swapWithExtraTile(tile: Tile) {
    const { pos: pos1 } = tile;

    if (this.extraTile) {
      const { pos } = this.extraTile;
      this.extraTile.pos = pos1;
      this.tiles[pos1.x][pos1.y] = this.extraTile;

      this.extraTile = tile;
      tile.pos = pos;
    }

    return this.tiles[pos1.x][pos1.y];
  }
}

export default Grid;

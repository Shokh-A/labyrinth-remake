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
import { preloadImages } from "../services/imageLoader";

const imgRotationMap: { [key: string]: string } = {
  "/paths/Road 1.png": northSouth,
  "/paths/Road 2.png": eastWest,
  "/paths/Road 4 Turn.png": southWest,
  "/paths/Road 5 Turn.png": northWest,
  "/paths/Road 6 Turn.png": northEast,
  "/paths/Road 7 Turn.png": southEast,
  "/paths/Road 8 Detour.png": northSouthWest,
  "/paths/Road 9 Detour.png": northSouthEast,
  "/paths/Road 10 Detour.png": northEastWest,
  "/paths/Road 11 Detour.png": southEastWest,
  "/paths/Terrain 1.png": grass,
};

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
  tiles: Tile[][];
  hoveredTile: Tile | null = null;
  extraTile: Tile;
  disabledTile: Tile | null = null;
  images: Map<string, HTMLImageElement> = new Map();
  constructor(
    public worldWidth: number,
    public rows: number,
    public cols: number,
    public tileWidth: number,
    public tileHeight: number,
    public tileDepth: number
  ) {
    this.rows += 2; // Add two rows as action tiles
    this.cols += 2; // Add two cols as action tiles
    this.tiles = new Array(this.rows)
      .fill(null)
      .map(() => new Array(this.cols).fill(null));
    this.extraTile = new Tile(
      new Point(4, -2),
      this.tileWidth,
      this.tileHeight,
      this.tileDepth,
      null as any,
      [],
      "MOVABLE"
    );
  }

  async init() {
    this.images = await preloadImages();
    this.initializeTiles();
    this.initializeExtraTile();
  }

  private initializeTiles() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const [imgSrc, paths] = this.isEdge(row, col)
          ? ["/paths/Terrain 1.png", []]
          : this.imageSelector(row - 1, col - 1);
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
  }

  private initializeExtraTile() {
    const [imgSrc, paths] = this.getRandomMovablePath();
    this.extraTile = new Tile(
      new Point(4, -2),
      this.tileWidth,
      this.tileHeight,
      this.tileDepth,
      this.images.get(decodeURIComponent(imgSrc)) as HTMLImageElement,
      paths,
      "MOVABLE"
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.tiles.flat().forEach((tile) => tile.draw(ctx, this.worldWidth));
    this.extraTile?.draw(ctx, this.worldWidth);
  }

  getTile(screenX: number, screenY: number): Tile | null {
    for (const tile of this.tiles.flat()) {
      const { x, y } = tile.screenToIso(screenX, screenY, this.worldWidth);
      if (this.isWithinGrid(x, y)) {
        return this.tiles[x][y];
      }
    }
    return null;
  }

  getExtraTile(screenX: number, screenY: number): Tile | null {
    if (!this.extraTile) return null;

    const { x: row, y: col } = this.extraTile.screenToIso(
      screenX,
      screenY,
      this.worldWidth
    );

    if (this.extraTile.pos.x === row && this.extraTile.pos.y === col)
      return this.extraTile;
    return null;
  }

  rotateTile(tile: Tile) {
    const rotationMap: { [key: string]: string } = {
      NORTH: "EAST",
      EAST: "SOUTH",
      SOUTH: "WEST",
      WEST: "NORTH",
    };
    tile.paths = tile.paths.map(
      (direction) => rotationMap[direction] || direction
    );
    const imgSrc = decodeURIComponent(
      "/" + tile.pathImg.src.split("/").slice(-2).join("/")
    );
    tile.pathImg = this.images.get(
      decodeURIComponent(imgRotationMap[imgSrc])
    ) as HTMLImageElement;
  }

  shiftAndDisable(tile: Tile) {
    const { x: row, y: col } = tile.pos;
    if (this.disabledTile) this.disabledTile.tileType = "ENABLED";
    if (col === 0) {
      this.shiftRow(tile, "SOUTH");
      this.tiles[row][this.cols - 1].tileType = "DISABLED";
      this.disabledTile = this.tiles[row][this.cols - 1];
    } else if (col === this.cols - 1) {
      this.shiftRow(tile, "NORTH");
      this.tiles[row][0].tileType = "DISABLED";
      this.disabledTile = this.tiles[row][0];
    } else if (row === 0) {
      this.shiftCol(tile, "EAST");
      this.tiles[this.rows - 1][col].tileType = "DISABLED";
      this.disabledTile = this.tiles[this.rows - 1][col];
    } else if (row === this.rows - 1) {
      this.shiftCol(tile, "WEST");
      this.tiles[0][col].tileType = "DISABLED";
      this.disabledTile = this.tiles[0][col];
    }
  }

  shiftRow(tile: Tile, direction: "NORTH" | "SOUTH") {
    const tiles = this.tiles;
    const { x: row, y: col } = tile.pos;

    if (direction === "SOUTH") {
      const lastTile = tiles[row][this.cols - 2];
      for (let i = this.cols - 2; i > 0; i--) {
        tiles[row][i].pos = new Point(row, (i % (this.cols - 2)) + 1);
        if (i === 1) {
          tile.pos = new Point(row, i);
          tiles[row][i] = tile;
          break;
        }
        tiles[row][i] = tiles[row][i - 1];
      }
      lastTile.pos = new Point(row, 0);
      this.hoveredTile = lastTile;
      tiles[row][col] = this.hoveredTile;
    } else if (direction === "NORTH") {
      const lastTile = tiles[row][1];
      for (let i = 1; i < this.cols - 1; i++) {
        tiles[row][i].pos = new Point(row, (i - 1) % (this.cols - 2));
        if (i === this.cols - 2) {
          tile.pos = new Point(row, i);
          tiles[row][i] = tile;
          break;
        }
        tiles[row][i] = tiles[row][i + 1];
      }
      lastTile.pos = new Point(row, this.cols - 1);
      this.hoveredTile = lastTile;
      tiles[row][col] = this.hoveredTile;
    }
  }

  shiftCol(tile: Tile, direction: "EAST" | "WEST") {
    const tiles = this.tiles;
    const { x: row, y: col } = tile.pos;
    if (direction === "EAST") {
      const lastTile = tiles[this.rows - 2][col];
      for (let i = this.rows - 2; i > 0; i--) {
        tiles[i][col].pos = new Point((i % (this.rows - 2)) + 1, col);
        if (i === 1) {
          tile.pos = new Point(i, col);
          tiles[i][col] = tile;
          break;
        }
        tiles[i][col] = tiles[i - 1][col];
      }
      lastTile.pos = new Point(0, col);
      this.hoveredTile = lastTile;
      tiles[row][col] = this.hoveredTile;
    } else if (direction === "WEST") {
      const lastTile = tiles[1][col];
      for (let i = 1; i < this.rows - 1; i++) {
        tiles[i][col].pos = new Point((i - 1) % (this.rows - 2), col);
        if (i === this.rows - 2) {
          tile.pos = new Point(i, col);
          tiles[i][col] = tile;
          break;
        }
        tiles[i][col] = tiles[i + 1][col];
      }
      lastTile.pos = new Point(this.rows - 1, col);
      this.hoveredTile = lastTile;
      tiles[row][col] = this.hoveredTile;
    }
  }

  private isWithinGrid(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  public isCorner(row: number, col: number): boolean {
    return (
      (row === 0 && col === 0) ||
      (row === 0 && col === this.cols - 1) ||
      (row === this.rows - 1 && col === 0) ||
      (row === this.rows - 1 && col === this.cols - 1)
    );
  }

  public isEdge(row: number, col: number): boolean {
    return (
      row === 0 || row === this.rows - 1 || col === 0 || col === this.cols - 1
    );
  }

  public isEvenTile(row: number, col: number): boolean {
    return row % 2 === 0 && col % 2 === 0;
  }

  private isOddTile(row: number, col: number): boolean {
    return row % 2 === 1 && col % 2 === 1;
  }

  public getTileType(row: number, col: number) {
    if (
      this.isCorner(row, col) ||
      (this.isEdge(row, col) && !this.isEvenTile(row, col))
    ) {
      return "EMPTY";
    } else if (this.isEdge(row, col) && this.isEvenTile(row, col)) {
      return "ENABLED";
    } else if (this.isOddTile(row, col)) {
      return "FIXED";
    }
    return "MOVABLE";
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

  swapWithExtraTile(tile: Tile): Tile {
    const tilePos = tile.pos;
    const extraTilePos = this.extraTile.pos;

    this.extraTile.pos = tilePos;
    tile.pos = extraTilePos;

    this.tiles[tilePos.x][tilePos.y] = this.extraTile;
    this.extraTile = tile;

    return this.tiles[tilePos.x][tilePos.y];
  }
}

export default Grid;

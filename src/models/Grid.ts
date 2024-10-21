import crystals from "../assets/images/crystals/Crystals.png";
import northEastWest from "../assets/images/paths/Detour_NEW.png";
import northSouthEast from "../assets/images/paths/Detour_NSE.png";
import northSouthWest from "../assets/images/paths/Detour_NSW.png";
import southEastWest from "../assets/images/paths/Detour_SEW.png";
import eastWest from "../assets/images/paths/Straight_EW.png";
import northSouth from "../assets/images/paths/Straight_NS.png";
import northEast from "../assets/images/paths/Turn_NE.png";
import northWest from "../assets/images/paths/Turn_NW.png";
import southEast from "../assets/images/paths/Turn_SE.png";
import southWest from "../assets/images/paths/Turn_SW.png";
import { preloadImage, preloadImages } from "../services/imageLoader";
import { Collectible, Player, Point, Tile } from "./index";

class Grid {
  tileHeight: number;
  tiles: Tile[][];
  hoveredTile: Tile | null = null;
  extraTile: Tile;
  disabledTiles: Tile[] = [];
  images: Map<string, HTMLImageElement> = new Map();
  crystalsImg: HTMLImageElement = new Image();
  collectibles: Collectible[] = [];

  constructor(
    public worldWidth: number,
    public gridSize: number,
    public tileWidth: number,
    public tileDepth: number
  ) {
    this.gridSize += 2; // Add two rows and cols as action tiles
    this.tileHeight = this.tileWidth / 2;
    this.tiles = new Array(this.gridSize)
      .fill(null)
      .map(() => new Array(this.gridSize).fill(null));
    this.extraTile = new Tile(
      new Point(4, -2),
      this.tileWidth,
      this.tileHeight,
      this.tileDepth,
      new Image(),
      [],
      "MOVABLE"
    );
  }

  async init(players: Player[], numOfCollectibles: number) {
    this.images = await preloadImages([
      eastWest,
      northSouth,
      northEast,
      northWest,
      southEast,
      southWest,
      northSouthEast,
      southEastWest,
      northSouthWest,
      northEastWest,
    ]);
    this.crystalsImg = await preloadImage(crystals);
    this.initializeTiles();
    this.initializeExtraTile();
    this.initializeCollectibles(numOfCollectibles);

    for (const player of players) {
      const playerPos = player.pos;
      this.tiles[playerPos.x][playerPos.y].player = player;
    }
  }

  private initializeTiles() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const tileType = this.getTileType(row, col);
        if (tileType === "EMPTY") continue;

        const [imgSrc, paths] = this.imageSelector(row - 1, col - 1);
        this.tiles[row][col] = new Tile(
          new Point(row, col),
          this.tileWidth,
          this.tileHeight,
          this.tileDepth,
          this.images.get(imgSrc) as HTMLImageElement,
          paths,
          tileType
        );
      }
    }
  }

  private initializeExtraTile() {
    const [imgSrc, paths] = this.getRandomMovablePath();
    this.extraTile.pathImg = this.images.get(imgSrc) as HTMLImageElement;
    this.extraTile.paths = paths;
  }

  private initializeCollectibles(numOfCollectibles: number) {
    if (numOfCollectibles > 24) throw new Error("Max collectibles is 24");

    const randomPositions: string[] = [];
    for (let i = 0; i < numOfCollectibles; i++) {
      let [row, col] = this.getRandomTile();
      while (
        randomPositions.includes(`${row},${col}`) ||
        this.isCorner(row, col)
      ) {
        [row, col] = this.getRandomTile();
      }
      randomPositions.push(`${row},${col}`);

      const collectible = new Collectible(
        new Point(0, i),
        new Point(row, col),
        40,
        40,
        this.crystalsImg
      );
      this.tiles[row][col].collectible = collectible;
      this.collectibles.push(collectible);
    }
  }

  private imageSelector(x: number, y: number): [string, string[]] {
    switch (true) {
      case x === 0 && y === 0:
        return [southEast, ["SOUTH", "EAST"]];
      case x === 0 && y === this.gridSize - 3:
        return [northEast, ["NORTH", "EAST"]];
      case x === this.gridSize - 3 && y === 0:
        return [southWest, ["SOUTH", "WEST"]];
      case x === this.gridSize - 3 && y === this.gridSize - 3:
        return [northWest, ["NORTH", "WEST"]];
      case x === 0 && y % 2 === 0:
        return [northSouthEast, ["NORTH", "SOUTH", "EAST"]];
      case x === this.gridSize - 3 && y % 2 === 0:
        return [northSouthWest, ["NORTH", "SOUTH", "WEST"]];
      case y === 0 && x % 2 === 0:
        return [southEastWest, ["SOUTH", "EAST", "WEST"]];
      case y === this.gridSize - 3 && x % 2 === 0:
        return [northEastWest, ["NORTH", "EAST", "WEST"]];
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x < (this.gridSize - 3) / 2 &&
        y < (this.gridSize - 3) / 2:
        return [northSouthEast, ["NORTH", "SOUTH", "EAST"]];
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x > (this.gridSize - 3) / 2 &&
        y > (this.gridSize - 3) / 2:
        return [northSouthWest, ["NORTH", "SOUTH", "WEST"]];
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x < (this.gridSize - 3) / 2 &&
        y > (this.gridSize - 3) / 2:
        return [northEastWest, ["NORTH", "EAST", "WEST"]];
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x > (this.gridSize - 3) / 2 &&
        y < (this.gridSize - 3) / 2:
        return [southEastWest, ["SOUTH", "EAST", "WEST"]];
      default:
        return this.getRandomMovablePath();
    }
  }

  private getRandomMovablePath(): [string, string[]] {
    // If paths are connected increase the depth of the tile
    // This hard coded array is used to determine the paths of the tiles
    // Works only with 7x7 grid
    const movablePathsTurn = [
      ...this.createPaths(4, southEast, ["SOUTH", "EAST"]),
      ...this.createPaths(4, southWest, ["SOUTH", "WEST"]),
      ...this.createPaths(4, northWest, ["NORTH", "WEST"]),
      ...this.createPaths(3, northEast, ["NORTH", "EAST"]),
    ];

    const movablePathsStraight = [
      ...this.createPaths(6, eastWest, ["EAST", "WEST"]),
      ...this.createPaths(7, northSouth, ["NORTH", "SOUTH"]),
    ];

    const movablePathsDetour = [
      ...this.createPaths(1, southEastWest, ["SOUTH", "EAST", "WEST"]),
      ...this.createPaths(2, northEastWest, ["NORTH", "EAST", "WEST"]),
      ...this.createPaths(1, northSouthWest, ["NORTH", "SOUTH", "WEST"]),
      ...this.createPaths(2, northSouthEast, ["NORTH", "SOUTH", "EAST"]),
    ];

    const movablePaths = [
      ...movablePathsTurn,
      ...movablePathsStraight,
      ...movablePathsDetour,
    ];
    const randomIndex = Math.random() * movablePaths.length;
    const [removedPath] = movablePaths.splice(randomIndex, 1);

    return removedPath;
  }

  private createPaths(count: number, pathSrc: string, directions: string[]) {
    return new Array(count).fill([pathSrc, directions]);
  }

  private getTileType(row: number, col: number) {
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

  private getRandomTile() {
    const randomRow = Math.floor(Math.random() * (this.gridSize - 4)) + 2;
    const randomCol = Math.floor(Math.random() * (this.gridSize - 4)) + 2;
    return [randomRow, randomCol];
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.tiles
      .flat()
      .forEach((tile) => tile && tile.draw(ctx, this.isoToScreen(tile.pos)));
    this.extraTile?.draw(ctx, this.isoToScreen(new Point(4, -2)));
    this.drawCrystals(ctx);
  }

  drawCrystals(ctx: CanvasRenderingContext2D) {
    this.collectibles.forEach((collectible) => {
      const pos = this.isoToScreen(collectible.pos);
      pos.x = pos.x - 40 / 2;
      pos.y = pos.y - 2;
      collectible.draw(ctx, pos);
    });
  }

  public swapWithExtraTile(tile: Tile): Tile {
    const tilePos = tile.pos;
    const extraTilePos = this.extraTile.pos;

    this.extraTile.setPos(tilePos);
    tile.setPos(extraTilePos);

    this.tiles[tilePos.x][tilePos.y] = this.extraTile;
    this.extraTile = tile;

    return this.tiles[tilePos.x][tilePos.y];
  }

  rotateTile(tile: Tile) {
    const rotationMap: { [key: string]: string } = {
      NORTH: "EAST",
      EAST: "SOUTH",
      SOUTH: "WEST",
      WEST: "NORTH",
    };

    tile.paths = tile.paths.map((direction) => rotationMap[direction]);

    const imgRotationMap: { [key: string]: string } = {
      "Straight_EW.png": northSouth,
      "Straight_NS.png": eastWest,
      "Turn_NW.png": northEast,
      "Turn_NE.png": southEast,
      "Turn_SE.png": southWest,
      "Turn_SW.png": northWest,
      "Detour_NEW.png": northSouthEast,
      "Detour_NSE.png": southEastWest,
      "Detour_SEW.png": northSouthWest,
      "Detour_NSW.png": northEastWest,
    };

    const pathName = tile.pathImg.src.split("/").slice(-1)[0];
    tile.pathImg = this.images.get(
      imgRotationMap[pathName]
    ) as HTMLImageElement;
  }

  shiftAndDisable(tile: Tile) {
    this.enableDisabledTiles();
    const { x: row, y: col } = tile.pos;
    let disabledTile: Tile | null = null;
    if (col === 0) {
      this.shiftRow(tile, "SOUTH");
      disabledTile = this.tiles[row][this.gridSize - 1];
    } else if (col === this.gridSize - 1) {
      this.shiftRow(tile, "NORTH");
      disabledTile = this.tiles[row][0];
    } else if (row === 0) {
      this.shiftCol(tile, "EAST");
      disabledTile = this.tiles[this.gridSize - 1][col];
    } else if (row === this.gridSize - 1) {
      this.shiftCol(tile, "WEST");
      disabledTile = this.tiles[0][col];
    }
    if (disabledTile) {
      disabledTile.tileType = "DISABLED";
      this.disabledTiles.push(disabledTile);
    }
  }

  shiftRow(tile: Tile, direction: "NORTH" | "SOUTH") {
    const tiles = this.tiles;
    const { x: row, y: col } = tile.pos;

    if (direction === "SOUTH") {
      tile.setPos(new Point(row, 1));
      const lastTile = tiles[row][this.gridSize - 2];

      for (let i = this.gridSize - 2; i > 0; i--) {
        tiles[row][i].setPos(new Point(row, (i % (this.gridSize - 2)) + 1));
        tiles[row][i] = tiles[row][i - 1];
      }

      lastTile.setPos(new Point(row, 0));
      this.hoveredTile = lastTile;
      tiles[row][col] = this.hoveredTile;
    } else if (direction === "NORTH") {
      tile.setPos(new Point(row, this.gridSize - 2));
      const lastTile = tiles[row][1];

      for (let i = 1; i < this.gridSize - 1; i++) {
        tiles[row][i].setPos(new Point(row, (i - 1) % (this.gridSize - 2)));
        tiles[row][i] = tiles[row][i + 1];
      }

      lastTile.setPos(new Point(row, this.gridSize - 1));
      this.hoveredTile = lastTile;
      tiles[row][col] = this.hoveredTile;
    }
  }

  shiftCol(tile: Tile, direction: "EAST" | "WEST") {
    const tiles = this.tiles;
    const { x: row, y: col } = tile.pos;

    if (direction === "EAST") {
      tile.setPos(new Point(1, col));
      const lastTile = tiles[this.gridSize - 2][col];

      for (let i = this.gridSize - 2; i > 0; i--) {
        tiles[i][col].setPos(new Point((i % (this.gridSize - 2)) + 1, col));
        tiles[i][col] = tiles[i - 1][col];
      }

      lastTile.setPos(new Point(0, col));
      this.hoveredTile = lastTile;
      tiles[row][col] = this.hoveredTile;
    } else if (direction === "WEST") {
      tile.setPos(new Point(this.gridSize - 2, col));
      const lastTile = tiles[1][col];

      for (let i = 1; i < this.gridSize - 1; i++) {
        tiles[i][col].setPos(new Point((i - 1) % (this.gridSize - 2), col));
        tiles[i][col] = tiles[i + 1][col];
      }

      lastTile.setPos(new Point(this.gridSize - 1, col));
      this.hoveredTile = lastTile;
      tiles[row][col] = this.hoveredTile;
    }
  }

  public riseConnectedTiles(tile: Tile, visited: Set<string> = new Set()) {
    const { pos, paths } = tile;
    const x = pos.x;
    const y = pos.y;

    const key = `${x},${y}`;
    if (visited.has(key)) return;
    visited.add(key);

    tile.setIsConnected(true);

    if (
      paths.includes("NORTH") &&
      y > 1 &&
      this.tiles[x][y - 1].paths.includes("SOUTH")
    ) {
      this.riseConnectedTiles(this.tiles[x][y - 1], visited);
    }

    if (
      paths.includes("SOUTH") &&
      y < this.gridSize - 2 &&
      this.tiles[x][y + 1].paths.includes("NORTH")
    ) {
      this.riseConnectedTiles(this.tiles[x][y + 1], visited);
    }

    if (
      paths.includes("EAST") &&
      x < this.gridSize - 2 &&
      this.tiles[x + 1][y].paths.includes("WEST")
    ) {
      this.riseConnectedTiles(this.tiles[x + 1][y], visited);
    }

    if (
      paths.includes("WEST") &&
      x > 1 &&
      this.tiles[x - 1][y].paths.includes("EAST")
    ) {
      this.riseConnectedTiles(this.tiles[x - 1][y], visited);
    }
  }

  public lowerTiles() {
    this.tiles.flat().forEach((tile) => tile && tile.setIsConnected(false));
  }

  public getTile(screenX: number, screenY: number): Tile | null {
    const { x, y } = this.screenToIso(screenX, screenY);
    if (this.isWithinGrid(x, y)) {
      return this.tiles[x][y];
    } else if (this.extraTile.pos.x === x && this.extraTile.pos.y === y) {
      return this.extraTile;
    }
    return null;
  }

  private isWithinGrid(row: number, col: number): boolean {
    return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
  }

  public isCorner(row: number, col: number): boolean {
    return (
      (row === 0 && col === 0) ||
      (row === 0 && col === this.gridSize - 1) ||
      (row === this.gridSize - 1 && col === 0) ||
      (row === this.gridSize - 1 && col === this.gridSize - 1)
    );
  }

  public isEdge(row: number, col: number): boolean {
    return (
      row === 0 ||
      row === this.gridSize - 1 ||
      col === 0 ||
      col === this.gridSize - 1
    );
  }

  public isEvenTile(row: number, col: number): boolean {
    return row % 2 === 0 && col % 2 === 0;
  }

  private isOddTile(row: number, col: number): boolean {
    return row % 2 === 1 && col % 2 === 1;
  }

  isoToScreen(pos: Point): Point {
    return new Point(
      (pos.x - pos.y) * (this.tileWidth / 2) + this.worldWidth / 2,
      (pos.x + pos.y) * (this.tileHeight / 2)
    );
  }

  screenToIso(screenX: number, screenY: number): { x: number; y: number } {
    const centeredX = screenX - this.worldWidth / 2;
    const x =
      (centeredX / (this.tileWidth / 2) + screenY / (this.tileHeight / 2)) / 2;
    const y =
      (screenY / (this.tileHeight / 2) - centeredX / (this.tileWidth / 2)) / 2;
    return { x: Math.floor(x), y: Math.floor(y) };
  }

  disableTileNextToPlayer(player: Player) {
    const playerPos = player.pos;
    if (playerPos.x % 2 !== 0 && playerPos.y % 2 !== 0) {
      return;
    }
    let tile: Tile | null = null;
    if (this.isEdge(playerPos.x - 1, playerPos.y)) {
      tile = this.tiles[this.gridSize - 1][playerPos.y];
    } else if (this.isEdge(playerPos.x + 1, playerPos.y)) {
      tile = this.tiles[0][playerPos.y];
    } else if (this.isEdge(playerPos.x, playerPos.y - 1)) {
      tile = this.tiles[playerPos.x][this.gridSize - 1];
    } else if (this.isEdge(playerPos.x, playerPos.y + 1)) {
      tile = this.tiles[playerPos.x][0];
    }
    if (tile) {
      tile.tileType = "DISABLED";
      this.disabledTiles.push(tile);
    }
  }

  enableDisabledTiles() {
    this.disabledTiles.forEach((tile) => (tile.tileType = "ENABLED"));
  }
}

export default Grid;

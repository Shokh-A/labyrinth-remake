import crystalsImg from "../assets/images/crystals/Crystals.png";
import playerImg from "../assets/images/sprites/CharacterSheet_CharacterFront.png";
import { Path, pathsMap, preloadImages } from "../services/imageLoader";
import { Collectible, Player, Point, Tile } from "./index";

class Grid {
  tileHeight: number;
  private movablePaths: Path[] = [];
  images: Map<string, HTMLImageElement> = new Map();
  hoveredTile: Tile | null = null;
  extraTile: Tile;
  disabledTiles: Tile[] = [];
  tiles: Tile[][];
  players: Player[] = [];

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

    const movablePathsTurn = [
      ...this.createPaths(4, pathsMap.southEast),
      ...this.createPaths(4, pathsMap.southWest),
      ...this.createPaths(4, pathsMap.northWest),
      ...this.createPaths(3, pathsMap.northEast),
    ];

    const movablePathsStraight = [
      ...this.createPaths(6, pathsMap.eastWest),
      ...this.createPaths(7, pathsMap.northSouth),
    ];

    const movablePathsDetour = [
      ...this.createPaths(1, pathsMap.southEastWest),
      ...this.createPaths(2, pathsMap.northEastWest),
      ...this.createPaths(1, pathsMap.northSouthWest),
      ...this.createPaths(2, pathsMap.northSouthEast),
    ];

    // This array contains paths to fill out the 7x7 grid with movable tiles
    this.movablePaths = [
      ...movablePathsTurn,
      ...movablePathsStraight,
      ...movablePathsDetour,
    ];
  }

  async init(numOfPlayers: number, numOfCollectibles: number) {
    const imgSources = [
      ...Object.values(pathsMap).map((path) => path.imgSrc),
      crystalsImg,
      playerImg,
    ];
    this.images = await preloadImages(imgSources);

    this.initializeTiles();
    this.initializeCollectibles(numOfCollectibles);
    this.initializePlayers(numOfPlayers);
  }

  private initializeTiles() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const tileType = this.getTileType(row, col);
        if (tileType === "EMPTY") continue;

        const { imgSrc, paths }: Path = this.isEdge(row, col)
          ? { imgSrc: "", paths: [] }
          : this.imageSelector(row - 1, col - 1);

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
    this.initializeExtraTile();
  }

  private initializeExtraTile() {
    const { imgSrc, paths } = this.getRandomMovablePath();
    this.extraTile.pathImg = this.images.get(imgSrc) as HTMLImageElement;
    this.extraTile.paths = paths;
  }

  private initializeCollectibles(numOfCollectibles: number) {
    if (numOfCollectibles > 24) throw new Error("Collectibles number exceeded");

    const uniquePositions: Set<string> = new Set();
    for (let i = 0; i < numOfCollectibles; i++) {
      let [row, col] = this.getRandomTilePos();
      while (uniquePositions.has(`${row},${col}`)) {
        [row, col] = this.getRandomTilePos();
      }
      uniquePositions.add(`${row},${col}`);

      const collectible = new Collectible(
        new Point(row, col),
        40,
        40,
        i,
        this.images.get(crystalsImg) as HTMLImageElement
      );
      this.tiles[row][col].setCollectible(collectible);
    }
  }

  private initializePlayers(numOfPlayers: number) {
    const spawnPoints = [
      new Point(1, 1),
      new Point(7, 7),
      new Point(1, 7),
      new Point(7, 1),
    ];

    for (let i = 0; i < numOfPlayers; i++) {
      const player = new Player(
        spawnPoints[i],
        this.images.get(playerImg) as HTMLImageElement
      );
      this.tiles[spawnPoints[i].x][spawnPoints[i].y].setPlayer(player);
      this.players.push(player);
    }
  }

  private createPaths(count: number, path: Path) {
    return new Array(count).fill(path);
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

  private imageSelector(x: number, y: number): Path {
    switch (true) {
      case x === 0 && y === 0:
        return pathsMap.southEast;
      case x === 0 && y === this.gridSize - 3:
        return pathsMap.northEast;
      case x === this.gridSize - 3 && y === 0:
        return pathsMap.southWest;
      case x === this.gridSize - 3 && y === this.gridSize - 3:
        return pathsMap.northWest;
      case x === 0 && y % 2 === 0:
        return pathsMap.northSouthEast;
      case x === this.gridSize - 3 && y % 2 === 0:
        return pathsMap.northSouthWest;
      case y === 0 && x % 2 === 0:
        return pathsMap.southEastWest;
      case y === this.gridSize - 3 && x % 2 === 0:
        return pathsMap.northEastWest;
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x < (this.gridSize - 3) / 2 &&
        y < (this.gridSize - 3) / 2:
        return pathsMap.northSouthEast;
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x > (this.gridSize - 3) / 2 &&
        y > (this.gridSize - 3) / 2:
        return pathsMap.northSouthWest;
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x < (this.gridSize - 3) / 2 &&
        y > (this.gridSize - 3) / 2:
        return pathsMap.northEastWest;
      case x % 2 === 0 &&
        y % 2 === 0 &&
        x > (this.gridSize - 3) / 2 &&
        y < (this.gridSize - 3) / 2:
        return pathsMap.southEastWest;
      default:
        return this.getRandomMovablePath();
    }
  }

  private getRandomMovablePath(): Path {
    const randomIndex = Math.random() * this.movablePaths.length;
    const [removedPath] = this.movablePaths.splice(randomIndex, 1);
    if (removedPath === undefined) throw new Error("Not enough movable paths");
    return removedPath;
  }

  private getRandomTilePos() {
    const randomRow = Math.floor(Math.random() * (this.gridSize - 4)) + 2;
    const randomCol = Math.floor(Math.random() * (this.gridSize - 4)) + 2;
    return [randomRow, randomCol];
  }

  private isWithinGrid(row: number, col: number): boolean {
    return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
  }

  private isCorner(row: number, col: number): boolean {
    return (
      (row === 0 && col === 0) ||
      (row === 0 && col === this.gridSize - 1) ||
      (row === this.gridSize - 1 && col === 0) ||
      (row === this.gridSize - 1 && col === this.gridSize - 1)
    );
  }

  private isEdge(row: number, col: number): boolean {
    return (
      row === 0 ||
      row === this.gridSize - 1 ||
      col === 0 ||
      col === this.gridSize - 1
    );
  }

  private isEvenTile(row: number, col: number): boolean {
    return row % 2 === 0 && col % 2 === 0;
  }

  private isOddTile(row: number, col: number): boolean {
    return row % 2 === 1 && col % 2 === 1;
  }

  private isoToScreen(pos: Point): Point {
    return new Point(
      (pos.x - pos.y) * (this.tileWidth / 2) + this.worldWidth / 2,
      (pos.x + pos.y) * (this.tileHeight / 2)
    );
  }

  private screenToIso(
    screenX: number,
    screenY: number
  ): { x: number; y: number } {
    const centeredX = screenX - this.worldWidth / 2;
    const x =
      (centeredX / (this.tileWidth / 2) + screenY / (this.tileHeight / 2)) / 2;
    const y =
      (screenY / (this.tileHeight / 2) - centeredX / (this.tileWidth / 2)) / 2;
    return { x: Math.floor(x), y: Math.floor(y) };
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.tiles
      .flat()
      .forEach((tile) => tile && tile.draw(ctx, this.isoToScreen(tile.pos)));
    this.extraTile?.draw(ctx, this.isoToScreen(this.extraTile.pos));
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

  public swapWithExtraTile(tile: Tile) {
    const tilePos = tile.pos;
    const extraTilePos = this.extraTile.pos;

    this.extraTile.setPos(tilePos);
    tile.setPos(extraTilePos);

    this.tiles[tilePos.x][tilePos.y] = this.extraTile;
    this.extraTile = tile;

    if (tile === this.hoveredTile) {
      this.hoveredTile = null;
    } else {
      this.hoveredTile = this.tiles[tilePos.x][tilePos.y];
    }
  }

  public rotateTile(tile: Tile) {
    const imgRotationMap: {
      [key: string]: Path;
    } = {
      "Straight_EW.png": pathsMap.northSouth,
      "Straight_NS.png": pathsMap.eastWest,
      "Turn_NW.png": pathsMap.northEast,
      "Turn_NE.png": pathsMap.southEast,
      "Turn_SE.png": pathsMap.southWest,
      "Turn_SW.png": pathsMap.northWest,
      "Detour_NEW.png": pathsMap.northSouthEast,
      "Detour_NSE.png": pathsMap.southEastWest,
      "Detour_SEW.png": pathsMap.northSouthWest,
      "Detour_NSW.png": pathsMap.northEastWest,
    };

    const [pathName] = tile.pathImg.src.split("/").slice(-1);
    tile.pathImg = this.images.get(
      imgRotationMap[pathName].imgSrc
    ) as HTMLImageElement;
    tile.paths = imgRotationMap[pathName].paths;
  }

  public enableDisabledTiles() {
    this.disabledTiles.forEach((tile) => (tile.tileType = "ENABLED"));
  }

  public disableTileNextToPlayer(player: Player) {
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

  public shiftAndDisable(tile: Tile) {
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
    this.swapWithExtraTile(this.hoveredTile!);
  }

  private shiftRow(tile: Tile, direction: "NORTH" | "SOUTH") {
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

  private shiftCol(tile: Tile, direction: "EAST" | "WEST") {
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

  public riseConnectedTiles(player: Player) {
    const pos = player.pos;
    this.riseTiles(this.tiles[pos.x][pos.y]);
  }

  private riseTiles(tile: Tile, visited: Set<string> = new Set()) {
    const { pos, paths } = tile;
    const { x, y } = pos;

    const key = `${x},${y}`;
    if (visited.has(key)) return;
    visited.add(key);

    tile.setIsConnected(true);

    if (
      paths.includes("NORTH") &&
      y > 1 &&
      this.tiles[x][y - 1].paths.includes("SOUTH")
    ) {
      this.riseTiles(this.tiles[x][y - 1], visited);
    }

    if (
      paths.includes("SOUTH") &&
      y < this.gridSize - 2 &&
      this.tiles[x][y + 1].paths.includes("NORTH")
    ) {
      this.riseTiles(this.tiles[x][y + 1], visited);
    }

    if (
      paths.includes("EAST") &&
      x < this.gridSize - 2 &&
      this.tiles[x + 1][y].paths.includes("WEST")
    ) {
      this.riseTiles(this.tiles[x + 1][y], visited);
    }

    if (
      paths.includes("WEST") &&
      x > 1 &&
      this.tiles[x - 1][y].paths.includes("EAST")
    ) {
      this.riseTiles(this.tiles[x - 1][y], visited);
    }
  }

  public lowerTiles() {
    this.tiles.flat().forEach((tile) => tile && tile.setIsConnected(false));
  }

  public getPlayer(index: number): Player {
    return this.players[index];
  }
}

export default Grid;

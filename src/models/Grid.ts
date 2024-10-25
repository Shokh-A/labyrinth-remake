import crystalsImg from "../assets/images/crystals/Crystals.png";
import playerImgSouth from "../assets/images/sprites/Front_S.png";
import playerImgEast from "../assets/images/sprites/Front_E.png";
import playerImgNorth from "../assets/images/sprites/Back_N.png";
import playerImgWest from "../assets/images/sprites/Back_W.png";
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
  animationDirection: "NORTH" | "SOUTH" | "EAST" | "WEST" = "NORTH";

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
      this.isoToScreen(new Point(4, -2)),
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
      playerImgSouth,
      playerImgEast,
      playerImgNorth,
      playerImgWest,
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
          this.isoToScreen(new Point(row, col)),
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
        this.isoToScreen(new Point(row, col)),
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

    const playerImgs: {
      [key: string]: HTMLImageElement;
    } = {
      SOUTH: this.images.get(playerImgSouth) as HTMLImageElement,
      EAST: this.images.get(playerImgEast) as HTMLImageElement,
      NORTH: this.images.get(playerImgNorth) as HTMLImageElement,
      WEST: this.images.get(playerImgWest) as HTMLImageElement,
    };

    for (let i = 0; i < numOfPlayers; i++) {
      const player = new Player(this.isoToScreen(spawnPoints[i]), playerImgs);
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

  public screenToIso(
    screenPos: Point,
    hasOffset: boolean = false
  ): { x: number; y: number } {
    const screenY = screenPos.y + (hasOffset ? 10 : 0);
    const centeredX = screenPos.x - this.worldWidth / 2;
    const x =
      (centeredX / (this.tileWidth / 2) + screenY / (this.tileHeight / 2)) / 2;
    const y =
      (screenY / (this.tileHeight / 2) - centeredX / (this.tileWidth / 2)) / 2;
    return { x: Math.floor(x), y: Math.floor(y) };
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.worldWidth, this.worldWidth);
    if (
      this.animationDirection === "NORTH" ||
      this.animationDirection === "SOUTH"
    ) {
      this.tiles.flat().forEach((tile) => {
        if (tile) {
          tile.update();
          tile.draw(ctx);
        }
      });
    } else if (
      this.animationDirection === "EAST" ||
      this.animationDirection === "WEST"
    ) {
      for (let col = 0; col < this.gridSize; col++) {
        for (let row = 0; row < this.gridSize; row++) {
          const tile = this.tiles[row][col];
          if (tile) {
            tile.update();
            tile.draw(ctx);
          }
        }
      }
    }

    this.extraTile.draw(ctx);
  }

  public animate(ctx: CanvasRenderingContext2D): Promise<void> {
    return new Promise((resolve) => {
      const animationStep = (timestamp: number) => {
        this.draw(ctx);
        if (this.players[0].target) {
          this.players[0].update(timestamp);
          this.players[0].draw(ctx);
        }
        if (
          this.tiles.flat().some((tile) => tile && tile.target) ||
          this.players[0].target
        ) {
          requestAnimationFrame(animationStep);
        } else {
          console.log("Animation finished");
          resolve();
        }
      };

      requestAnimationFrame(animationStep);
    });
  }

  public getTile(screenPos: Point, hasOffset: boolean = false): Tile | null {
    const { x, y } = this.screenToIso(screenPos, hasOffset);
    if (this.isWithinGrid(x, y)) {
      return this.tiles[x][y];
    } else {
      const { x: extraRow, y: extraCol } = this.screenToIso(this.extraTile.pos);
      if (extraRow === x && extraCol === y) {
        return this.extraTile;
      }
    }
    return null;
  }

  public swapWithExtraTile(tile: Tile) {
    const { x: row, y: col } = this.screenToIso(tile.pos);
    const tilePos = tile.pos;
    const extraTilePos = this.extraTile.pos;

    this.extraTile.setPos(tilePos);
    tile.setPos(extraTilePos);

    this.tiles[row][col] = this.extraTile;
    this.extraTile = tile;

    if (tile === this.hoveredTile) {
      this.hoveredTile = null;
    } else {
      this.hoveredTile = this.tiles[row][col];
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

  public async shiftAndRise(ctx: CanvasRenderingContext2D, tile: Tile) {
    this.enableDisabledTiles();
    const { x: row, y: col } = this.screenToIso(tile.pos);
    if (col === 0) this.shiftRow(tile, "SOUTH");
    else if (col === this.gridSize - 1) this.shiftRow(tile, "NORTH");
    else if (row === 0) this.shiftCol(tile, "EAST");
    else if (row === this.gridSize - 1) this.shiftCol(tile, "WEST");

    await this.animate(ctx).then(() => {
      this.swapWithExtraTile(this.hoveredTile!);
      this.riseConnectedTiles(ctx, this.players[0]);
    });
  }

  private shiftRow(tile: Tile, direction: "NORTH" | "SOUTH") {
    const tiles = this.tiles;
    const { x: row, y: col } = this.screenToIso(tile.pos);
    this.animationDirection = direction;

    const lastTile = tiles[row][(this.gridSize - 1 - col) % this.gridSize];
    lastTile.setPos(this.isoToScreen(new Point(row, col)));
    this.hoveredTile = tiles[row][col === 0 ? this.gridSize - 2 : 1];

    if (direction === "SOUTH") {
      for (let i = this.gridSize - 2; i >= 0; i--) {
        const newPos = new Point(row, (i % (this.gridSize - 1)) + 1);
        tiles[row][i].setTargetPos(this.isoToScreen(newPos), "SOUTH");
        tiles[row][i] = tiles[row][(this.gridSize - 1 + i) % this.gridSize];
      }
    } else if (direction === "NORTH") {
      for (let i = 1; i < this.gridSize; i++) {
        const newPos = new Point(row, (i - 1) % (this.gridSize - 1));
        tiles[row][i].setTargetPos(this.isoToScreen(newPos), "NORTH");
        tiles[row][i] = tiles[row][(i + 1) % this.gridSize];
      }
    }

    tiles[row][(this.gridSize - 1 - col) % this.gridSize] = this.hoveredTile!;
  }

  private shiftCol(tile: Tile, direction: "EAST" | "WEST") {
    const tiles = this.tiles;
    const { x: row, y: col } = this.screenToIso(tile.pos);
    this.animationDirection = direction;

    const lastTile = tiles[(this.gridSize - 1 - row) % this.gridSize][col];
    lastTile.setPos(this.isoToScreen(new Point(row, col)));
    this.hoveredTile = tiles[row === 0 ? this.gridSize - 2 : 1][col];

    if (direction === "EAST") {
      for (let i = this.gridSize - 2; i >= 0; i--) {
        const newPos = new Point((i % (this.gridSize - 1)) + 1, col);
        tiles[i][col].setTargetPos(this.isoToScreen(newPos), "EAST");
        tiles[i][col] = tiles[(this.gridSize - 1 + i) % this.gridSize][col];
      }
    } else if (direction === "WEST") {
      for (let i = 1; i < this.gridSize; i++) {
        const newPos = new Point((i - 1) % (this.gridSize - 1), col);
        tiles[i][col].setTargetPos(this.isoToScreen(newPos), "WEST");
        tiles[i][col] = tiles[(i + 1) % this.gridSize][col];
      }
    }

    tiles[(this.gridSize - 1 - row) % this.gridSize][col] = this.hoveredTile;
  }

  public async riseConnectedTiles(
    ctx: CanvasRenderingContext2D,
    player: Player
  ) {
    const { x: row, y: col } = this.screenToIso(player.pos);
    this.riseTiles(this.tiles[row][col]);
    this.setColorAnimation();
    await this.animate(ctx);
  }

  private setColorAnimation() {
    this.tiles.flat().forEach((tile) => {
      if (tile && !tile.isConnected) {
        tile.setTargetPos(tile.pos, "DARKER", 0.7);
      }
    });
  }

  private riseTiles(tile: Tile, visited: Set<string> = new Set()) {
    const { pos, paths } = tile;
    const { x: row, y: col } = this.screenToIso(pos);

    const key = `${row},${col}`;
    if (visited.has(key)) return;
    visited.add(key);

    tile.setIsConnected(true);

    if (
      paths.includes("NORTH") &&
      col > 1 &&
      this.tiles[row][col - 1].paths.includes("SOUTH")
    ) {
      this.riseTiles(this.tiles[row][col - 1], visited);
    }

    if (
      paths.includes("SOUTH") &&
      col < this.gridSize - 2 &&
      this.tiles[row][col + 1].paths.includes("NORTH")
    ) {
      this.riseTiles(this.tiles[row][col + 1], visited);
    }

    if (
      paths.includes("EAST") &&
      row < this.gridSize - 2 &&
      this.tiles[row + 1][col].paths.includes("WEST")
    ) {
      this.riseTiles(this.tiles[row + 1][col], visited);
    }

    if (
      paths.includes("WEST") &&
      row > 1 &&
      this.tiles[row - 1][col].paths.includes("EAST")
    ) {
      this.riseTiles(this.tiles[row - 1][col], visited);
    }
  }

  public async lowerTiles(ctx: CanvasRenderingContext2D) {
    this.tiles.flat().forEach((tile) => {
      if (tile && tile.isConnected) tile.setIsConnected(false);
      else if (tile) tile.setTargetPos(tile.pos, "BRIGHTER", 0);
    });
    await this.animate(ctx);
  }

  public getPlayer(index: number): Player {
    return this.players[index];
  }

  public async movePlayer(
    ctx: CanvasRenderingContext2D,
    tile: Tile,
    player: Player
  ) {
    const { x: row, y: col } = this.screenToIso(player.pos, true);
    const shortestPath = this.findShortestPath(this.tiles[row][col], tile);

    const directionalSegments = [];
    if (shortestPath) {
      for (const path of shortestPath) {
        const result = this.screenToIso(path.pos, true);
        directionalSegments.push({ row: result.x, col: result.y });
      }
    } else {
      console.error("No path found");
    }

    console.log("Path:", directionalSegments);
    console.log(
      "Directional segments:",
      this.getDirectionalSegments(directionalSegments)
    );

    const segments = this.getDirectionalSegments(directionalSegments);
    for (const segment of segments) {
      const [row, col] = [segment.row, segment.col];
      const { x: playerRow, y: playerCol } = this.screenToIso(player.pos, true);
      const direction = this.getDirection(playerRow, playerCol, row, col);
      console.log("Moving to:", row, col, "Direction:", direction);
      this.tiles[playerRow][playerCol].setPlayer(null);
      player.setTargetPos(this.isoToScreen(new Point(row, col)), direction);
      await this.animate(ctx);
    }
    const { x: playerRow, y: playerCol } = this.screenToIso(player.pos, true);
    this.tiles[playerRow][playerCol].setPlayer(player);
    this.lowerTiles(ctx);
  }

  getDirection(
    currentRow: number,
    currentCol: number,
    targetRow: number,
    targetCol: number
  ) {
    if (targetRow > currentRow) {
      return "EAST";
    } else if (targetRow < currentRow) {
      return "WEST";
    } else if (targetCol > currentCol) {
      return "SOUTH";
    } else if (targetCol < currentCol) {
      return "NORTH";
    }
    return "Same Position"; // if currentRow === targetRow and currentCol === targetCol
  }

  private getDirectionalSegments(
    result: { row: number; col: number }[]
  ): { row: number; col: number }[] {
    if (result.length < 2) return result;

    const filtered: { row: number; col: number }[] = [];
    let start = result[0];

    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const curr = result[i];

      // Determine the direction between previous and current
      const direction = {
        row: curr.row - prev.row,
        col: curr.col - prev.col,
      };

      // Check if the direction changes
      if (
        i === result.length - 1 ||
        direction.row !== result[i + 1].row - curr.row ||
        direction.col !== result[i + 1].col - curr.col
      ) {
        // filtered.push(start); // Start of the segment
        filtered.push(curr); // End of the segment
        start = curr;
      }
    }

    return filtered;
  }

  private findShortestPath(startTile: Tile, targetTile: Tile): Tile[] | null {
    const queue: { tile: Tile; path: Tile[] }[] = [
      { tile: startTile, path: [startTile] },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { tile, path } = queue.shift()!;
      const { pos, paths } = tile;
      const { x: row, y: col } = this.screenToIso(pos, true);
      const key = `${row},${col}`;

      if (visited.has(key)) continue;
      visited.add(key);

      // Check if we reached the target
      if (tile === targetTile) {
        return path;
      }

      // Add neighbors to queue
      if (
        paths.includes("NORTH") &&
        col > 1 &&
        this.tiles[row][col - 1].paths.includes("SOUTH")
      ) {
        queue.push({
          tile: this.tiles[row][col - 1],
          path: [...path, this.tiles[row][col - 1]],
        });
      }
      if (
        paths.includes("SOUTH") &&
        col < this.gridSize - 2 &&
        this.tiles[row][col + 1].paths.includes("NORTH")
      ) {
        queue.push({
          tile: this.tiles[row][col + 1],
          path: [...path, this.tiles[row][col + 1]],
        });
      }
      if (
        paths.includes("EAST") &&
        row < this.gridSize - 2 &&
        this.tiles[row + 1][col].paths.includes("WEST")
      ) {
        queue.push({
          tile: this.tiles[row + 1][col],
          path: [...path, this.tiles[row + 1][col]],
        });
      }
      if (
        paths.includes("WEST") &&
        row > 1 &&
        this.tiles[row - 1][col].paths.includes("EAST")
      ) {
        queue.push({
          tile: this.tiles[row - 1][col],
          path: [...path, this.tiles[row - 1][col]],
        });
      }
    }

    // Return null if no path is found
    return null;
  }
}

export default Grid;

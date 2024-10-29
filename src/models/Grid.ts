import crystalsImg from "../assets/images/crystals/Crystals.png";
import playerImgSouth from "../assets/images/sprites/Front_S.png";
import playerImgEast from "../assets/images/sprites/Front_E.png";
import playerImgNorth from "../assets/images/sprites/Back_N.png";
import playerImgWest from "../assets/images/sprites/Back_W.png";
import {
  movalePaths,
  Path,
  pathsMap,
  preloadImages,
} from "../services/imageLoader";
import { Collectible, Player, Point, Tile } from "./index";
import { DIRECTION } from "./GameObject";

class Grid {
  private tileHeight: number;
  private movablePaths: Path[] = [];
  private images: Map<string, HTMLImageElement> = new Map();
  private tiles: Tile[][];
  hoveredTile: Tile | null = null;
  extraTile: Tile;
  private disabledTile: Tile | null = null;
  private collectibles: Collectible[] = [];
  private players: Player[] = [];
  private animationDirection: "NORTH" | "SOUTH" | "EAST" | "WEST" = "NORTH";

  constructor(
    private worldWidth: number,
    private worldHeight: number,
    private gridSize: number,
    private tileWidth: number,
    private tileDepth: number
  ) {
    this.gridSize += 2; // Add two rows and cols as action tiles
    this.tileHeight = this.tileWidth / 2;
    this.tiles = new Array(this.gridSize)
      .fill(null)
      .map(() => new Array(this.gridSize).fill(null));
    this.extraTile = new Tile(
      this.isoToScreen(new Point(4, -2)),
      tileWidth,
      this.tileHeight,
      tileDepth,
      new Image(),
      [],
      "MOVABLE"
    );
    this.movablePaths = movalePaths;
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
    this.initializeCollectibles(numOfPlayers * numOfCollectibles);
    this.initializePlayers(numOfPlayers);

    this.distributeCollectibles(numOfCollectibles);
  }

  private distributeCollectibles(numOfCollectibles: number) {
    let i = 0;
    for (const player of this.players) {
      for (let j = 0; j < numOfCollectibles; j++) {
        player.targetCollectible = this.collectibles[i];
        player.collectibles.push(this.collectibles[i]);
        i++;
      }
    }
    this.players.forEach((player) =>
      console.log(
        "To collect:",
        this.screenToIso(player.targetCollectible!.pos)
      )
    );
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
        i,
        this.images.get(crystalsImg) as HTMLImageElement
      );
      this.tiles[row][col].setCollectible(collectible);
      this.collectibles.push(collectible);
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
    const gridWidth = (this.tileWidth / 2) * this.gridSize;
    const offsetY = (this.worldHeight - gridWidth) / 2;
    return new Point(
      (pos.x - pos.y) * (this.tileWidth / 2) + this.worldWidth / 2,
      (pos.x + pos.y) * (this.tileHeight / 2) + offsetY
    );
  }

  public screenToIso(
    screenPos: Point,
    hasOffset: boolean = false
  ): { row: number; col: number } {
    const gridWidth = (this.tileWidth / 2) * this.gridSize;
    const offsetY = (this.worldHeight - gridWidth) / 2;

    const screenY = screenPos.y + (hasOffset ? 10 : 0);

    const centeredX = screenPos.x - this.worldWidth / 2;
    const centeredY = screenY - offsetY;

    const x =
      (centeredX / (this.tileWidth / 2) + centeredY / (this.tileHeight / 2)) /
      2;
    const y =
      (centeredY / (this.tileHeight / 2) - centeredX / (this.tileWidth / 2)) /
      2;
    return { row: Math.floor(x), col: Math.floor(y) };
  }

  render(ctx: CanvasRenderingContext2D, timestamp: number = 0) {
    ctx.clearRect(0, 0, this.worldWidth, this.worldWidth);
    this.drawTiles(ctx);
    this.drawPlayers(ctx, timestamp);
  }

  private drawTiles(ctx: CanvasRenderingContext2D) {
    if (
      this.animationDirection === "NORTH" ||
      this.animationDirection === "SOUTH"
    ) {
      this.tiles.flat().forEach((tile) => {
        if (tile) tile.render(ctx);
      });
    } else if (
      this.animationDirection === "EAST" ||
      this.animationDirection === "WEST"
    ) {
      for (let col = 0; col < this.gridSize; col++) {
        for (let row = 0; row < this.gridSize; row++) {
          const tile = this.tiles[row][col];
          if (tile) tile.render(ctx);
        }
      }
    }

    this.extraTile.draw(ctx);
  }

  private drawPlayers(ctx: CanvasRenderingContext2D, timestamp: number) {
    for (const player of this.players) {
      player.render(ctx, timestamp);
    }
  }

  private animate(ctx: CanvasRenderingContext2D): Promise<void> {
    return new Promise((resolve) => {
      const animationStep = (timestamp: number) => {
        this.render(ctx, timestamp);
        if (
          this.tiles.flat().some((tile) => tile && tile.hasTarget()) ||
          this.players.some((player) => player.hasTarget())
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

  getTile(screenPos: Point, hasOffset: boolean = false): Tile | null {
    const { row, col } = this.screenToIso(screenPos, hasOffset);
    if (this.isWithinGrid(row, col)) {
      return this.tiles[row][col];
    } else {
      const { row: extraRow, col: extraCol } = this.screenToIso(
        this.extraTile.pos
      );
      if (extraRow === row && extraCol === col) {
        return this.extraTile;
      }
    }
    return null;
  }

  swapWithExtraTile(tile: Tile) {
    const { row, col } = this.screenToIso(tile.pos);
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

  rotateTile(tile: Tile) {
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

  async shiftAndRise(
    ctx: CanvasRenderingContext2D,
    tile: Tile,
    playerIndex: number
  ) {
    const { row, col } = this.screenToIso(tile.pos);
    if (col === 0) this.shiftRow(tile, DIRECTION.SOUTH);
    else if (col === this.gridSize - 1) this.shiftRow(tile, DIRECTION.NORTH);
    else if (row === 0) this.shiftCol(tile, DIRECTION.EAST);
    else if (row === this.gridSize - 1) this.shiftCol(tile, DIRECTION.WEST);

    await this.animate(ctx).then(() => {
      this.disableAndEnableTile();
      this.swapWithExtraTile(this.hoveredTile!);
      this.riseConnectedTiles(ctx, playerIndex);
    });
  }

  private disableAndEnableTile() {
    if (this.disabledTile) this.disabledTile.tileType = "ENABLED";
    this.extraTile.tileType = "DISABLED";
    this.disabledTile = this.extraTile;
  }

  private shiftRow(tile: Tile, direction: DIRECTION.SOUTH | DIRECTION.NORTH) {
    const tiles = this.tiles;
    const { row, col } = this.screenToIso(tile.pos);
    this.animationDirection = direction;

    const lastTileIndex = (this.gridSize - 1 - col) % this.gridSize;
    tiles[row][lastTileIndex].setPos(this.isoToScreen(new Point(row, col)));
    this.hoveredTile = tiles[row][Math.abs(lastTileIndex - 1)];

    if (direction === DIRECTION.SOUTH) {
      for (let i = this.gridSize - 2; i >= 0; i--) {
        const newPos = new Point(row, (i % (this.gridSize - 1)) + 1);
        tiles[row][i].setTargetPos(this.isoToScreen(newPos), direction);
        tiles[row][i] = tiles[row][(this.gridSize - 1 + i) % this.gridSize];
      }
    } else if (direction === DIRECTION.NORTH) {
      for (let i = 1; i < this.gridSize; i++) {
        const newPos = new Point(row, (i - 1) % (this.gridSize - 1));
        tiles[row][i].setTargetPos(this.isoToScreen(newPos), direction);
        tiles[row][i] = tiles[row][(i + 1) % this.gridSize];
      }
    }

    tiles[row][lastTileIndex] = this.hoveredTile!;
    if (this.tiles[row][lastTileIndex].player) {
      this.tiles[row][Math.abs(lastTileIndex - 7)].setPlayer(
        this.tiles[row][lastTileIndex].player
      );
      this.tiles[row][lastTileIndex].setPlayer(null);
    }
  }

  private shiftCol(tile: Tile, direction: DIRECTION.EAST | DIRECTION.WEST) {
    const tiles = this.tiles;
    const { row, col } = this.screenToIso(tile.pos);
    this.animationDirection = direction;

    const lastTileIndex = (this.gridSize - 1 - row) % this.gridSize;
    const lastTile = tiles[lastTileIndex][col];
    lastTile.setPos(this.isoToScreen(new Point(row, col)));
    this.hoveredTile = tiles[Math.abs(lastTileIndex - 1)][col];

    if (direction === DIRECTION.EAST) {
      for (let i = this.gridSize - 2; i >= 0; i--) {
        const newPos = new Point((i % (this.gridSize - 1)) + 1, col);
        tiles[i][col].setTargetPos(this.isoToScreen(newPos), direction);
        tiles[i][col] = tiles[(this.gridSize - 1 + i) % this.gridSize][col];
      }
    } else if (direction === DIRECTION.WEST) {
      for (let i = 1; i < this.gridSize; i++) {
        const newPos = new Point((i - 1) % (this.gridSize - 1), col);
        tiles[i][col].setTargetPos(this.isoToScreen(newPos), direction);
        tiles[i][col] = tiles[(i + 1) % this.gridSize][col];
      }
    }

    tiles[lastTileIndex][col] = this.hoveredTile;
    if (this.tiles[lastTileIndex][col].player) {
      this.tiles[Math.abs(lastTileIndex - 7)][col].setPlayer(
        this.tiles[lastTileIndex][col].player
      );
      this.tiles[lastTileIndex][col].setPlayer(null);
    }
  }

  async riseConnectedTiles(ctx: CanvasRenderingContext2D, playerIndex: number) {
    const player = this.getPlayer(playerIndex);
    const { row, col } = this.screenToIso(player.pos);
    this.riseTiles(this.tiles[row][col]);
    this.setColorAnimation();
    await this.animate(ctx);
  }

  private setColorAnimation() {
    this.tiles.flat().forEach((tile) => {
      if (tile && !tile.isConnected) {
        tile.setTargetPos(tile.pos, DIRECTION.DARKER, 0.5);
      }
    });
  }

  private riseTiles(tile: Tile, visited: Set<string> = new Set()) {
    const { pos, paths } = tile;
    const { row, col } = this.screenToIso(pos);

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

  async lowerTiles(ctx: CanvasRenderingContext2D) {
    this.tiles.flat().forEach((tile) => {
      if (tile && tile.isConnected) tile.setIsConnected(false);
      else if (tile) tile.setTargetPos(tile.pos, DIRECTION.BRIGHTER, 0);
    });
    await this.animate(ctx);
  }

  private getPlayer(index: number): Player {
    return this.players[index];
  }

  async movePlayer(
    ctx: CanvasRenderingContext2D,
    targetTile: Tile,
    playerIndex: number
  ) {
    const player = this.getPlayer(playerIndex);

    const startPos = this.screenToIso(player.pos, true);
    const shortestPath = this.findShortestPath(
      this.tiles[startPos.row][startPos.col],
      targetTile
    );

    if (!shortestPath) {
      console.error("No path found");
      return;
    }

    const pathCoordinates = shortestPath.map((tile) =>
      this.screenToIso(tile.pos, true)
    );
    const directionalSegments = this.getDirectionalSegments(pathCoordinates);

    for (const segment of directionalSegments) {
      const playerPos = this.screenToIso(player.pos, true);
      this.tiles[playerPos.row][playerPos.col].setPlayer(null);
      player.setTargetPos(
        this.isoToScreen(new Point(segment.row, segment.col)),
        this.getTargetDirection(playerPos, segment)
      );
      await this.animate(ctx);
    }

    player.resetDirectionAndFrame();
    const finalPos = this.screenToIso(player.pos, true);
    this.tiles[finalPos.row][finalPos.col].setPlayer(player);
    this.collectCollectible(
      player,
      this.tiles[finalPos.row][finalPos.col].collectible!
    );

    this.lowerTiles(ctx);
  }

  private findShortestPath(startTile: Tile, targetTile: Tile): Tile[] | null {
    const queue: { tile: Tile; path: Tile[] }[] = [
      { tile: startTile, path: [startTile] },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { tile, path } = queue.shift()!;
      const { pos, paths } = tile;
      const { row, col } = this.screenToIso(pos, true);
      const key = `${row},${col}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (tile === targetTile) {
        return path;
      }

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

    return null;
  }

  private getTargetDirection(
    curPos: { row: number; col: number },
    targetPos: { row: number; col: number }
  ) {
    if (targetPos.row > curPos.row) return DIRECTION.EAST;
    if (targetPos.row < curPos.row) return DIRECTION.WEST;
    if (targetPos.col > curPos.col) return DIRECTION.SOUTH;
    if (targetPos.col < curPos.col) return DIRECTION.NORTH;
    return DIRECTION.NONE;
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

      const direction = {
        row: curr.row - prev.row,
        col: curr.col - prev.col,
      };

      if (
        i === result.length - 1 ||
        direction.row !== result[i + 1].row - curr.row ||
        direction.col !== result[i + 1].col - curr.col
      ) {
        // filtered.push(start);
        filtered.push(curr);
        start = curr;
      }
    }

    return filtered;
  }

  private collectCollectible(player: Player, collectible: Collectible) {
    if (player.targetCollectible === collectible) {
      console.log("Collected collectible");
      player.collectCollectible(collectible);
      console.log(this.screenToIso(player.targetCollectible.pos));
    }
  }
}

export default Grid;

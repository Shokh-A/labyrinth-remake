import playerImg from "../assets/images/sprites/CharacterSheet_CharacterFront.png";
import { preloadImage } from "../services/imageLoader";
import { Grid, Player, Tile } from "./index";

class GameEngine {
  private readonly grid: Grid;
  private players: Player[] = [];
  private curPlayerIndex: number = 0;
  private gameState: "IDLE" | "SHIFTING" | "MOVING" = "IDLE";

  constructor(
    worldWidth: number,
    worldHeight: number,
    tileWidth: number,
    tileDepth: number
  ) {
    this.grid = new Grid(worldWidth, 7, tileWidth, tileDepth);
  }

  public async start(
    ctx: CanvasRenderingContext2D,
    numOfPlayers: number,
    numOfCollectibles: number
  ): Promise<void> {
    try {
      const spawnPoints = [
        { x: 1, y: 1 },
        { x: 7, y: 7 },
        { x: 1, y: 7 },
        { x: 7, y: 1 },
      ];
      const img = await preloadImage(playerImg);
      for (let i = 0; i < numOfPlayers; i++) {
        const player = new Player(spawnPoints[i], img);
        this.players.push(player);
      }

      await this.grid.init(this.players, numOfCollectibles);

      this.gameState = "SHIFTING";
      this.draw(ctx);
    } catch (error) {
      console.error("Error occurred during game start:", error);
    }
  }

  private draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.grid.draw(ctx);
    this.drawPlayers(ctx);
  }

  private drawPlayers(ctx: CanvasRenderingContext2D): void {
    for (const player of this.players) {
      player.draw(ctx, player.pos);
    }
  }

  public handleMouseHover(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    if (this.gameState !== "SHIFTING") return;

    const tile = this.grid.getTile(screenX, screenY);
    if (tile !== this.grid.hoveredTile && this.grid.hoveredTile) {
      this.grid.swapWithExtraTile(this.grid.hoveredTile);
      this.grid.hoveredTile = null;
    } else if (tile && tile.tileType === "ENABLED" && !this.grid.hoveredTile) {
      this.grid.hoveredTile = this.grid.swapWithExtraTile(tile);
    }
    this.draw(ctx);
  }

  public handleMouseClick(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    const tile = this.grid.getTile(screenX, screenY);
    console.log("Mouse clicked at tile:", tile?.pos.x, tile?.pos.y);
    if (!tile) return;

    if (this.gameState === "SHIFTING") {
      if (tile === this.grid.extraTile) this.grid.rotateTile(tile);
      else this.shiftTiles(tile);
      this.draw(ctx);
    } else if (this.gameState === "MOVING" && tile.isConnected) {
      this.movePlayer(ctx, tile!);
    }
  }

  private shiftTiles(tile: Tile): void {
    if (tile === this.grid.hoveredTile) {
      this.grid.shiftAndDisable(tile);
      this.grid.swapWithExtraTile(this.grid.hoveredTile!);
      this.grid.hoveredTile = null;

      const playerPos = this.players[this.curPlayerIndex].pos;
      this.grid.riseConnectedTiles(this.grid.tiles[playerPos.x][playerPos.y]);

      this.gameState = "MOVING";
    }
  }

  private movePlayer(ctx: CanvasRenderingContext2D, tile: Tile): void {
    const curPlayer = this.players[this.curPlayerIndex];
    this.grid.tiles[curPlayer.pos.x][curPlayer.pos.y].player = null;
    curPlayer.pos = tile.pos;
    tile.player = curPlayer;
    if (
      this.grid.collectibles.length !== 0 &&
      this.grid.collectibles[0].pos === curPlayer?.pos
    ) {
      console.log("Collecting...");
      this.grid.collectibles.splice(0, 1);
      tile.collectible = null;
    }

    this.grid.lowerTiles();
    this.gameState = "SHIFTING";
    this.curPlayerIndex = (this.curPlayerIndex + 1) % 2;

    this.disableTilesNextToPlayers();

    this.draw(ctx);
  }

  disableTilesNextToPlayers() {
    for (const player of this.players) {
      this.grid.disableTileNextToPlayer(player);
    }
  }
}

export default GameEngine;

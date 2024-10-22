import { Grid, Player, Tile } from "./index";

class GameEngine {
  private readonly grid: Grid;
  private curPlayerIndex: number = 0;
  private gameState: "IDLE" | "SHIFTING" | "MOVING" = "IDLE";

  constructor(worldWidth: number, tileWidth: number, tileDepth: number) {
    this.grid = new Grid(worldWidth, 7, tileWidth, tileDepth);
  }

  public async start(
    ctx: CanvasRenderingContext2D,
    numOfPlayers: number,
    numOfCollectibles: number
  ): Promise<void> {
    try {
      await this.grid.init(numOfPlayers, numOfCollectibles);
      this.gameState = "SHIFTING";
      this.draw(ctx);
    } catch (error) {
      console.error("Error occurred during game start:", error);
    }
  }

  private draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.grid.draw(ctx);
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
    } else if (tile && tile.tileType === "ENABLED" && !this.grid.hoveredTile) {
      this.grid.swapWithExtraTile(tile);
    }
    this.draw(ctx);
  }

  public handleMouseClick(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    const tile = this.grid.getTile(screenX, screenY);
    if (!tile) return;

    const curPlayer = this.grid.getPlayer(this.curPlayerIndex);
    if (this.gameState === "SHIFTING") {
      if (tile === this.grid.extraTile) this.grid.rotateTile(tile);
      else this.shiftTiles(tile, curPlayer);
      this.draw(ctx);
    } else if (this.gameState === "MOVING" && tile.isConnected) {
      this.movePlayer(ctx, tile, curPlayer);
    }
  }

  private shiftTiles(tile: Tile, player: Player): void {
    if (tile === this.grid.hoveredTile) {
      this.grid.shiftAndDisable(tile);
      this.grid.riseConnectedTiles(player);
      this.gameState = "MOVING";
    }
  }

  private movePlayer(
    ctx: CanvasRenderingContext2D,
    tile: Tile,
    player: Player
  ): void {
    const playerPos = player.pos;
    this.grid.tiles[playerPos.x][playerPos.y].setPlayer(null);
    tile.setPlayer(player);

    this.grid.lowerTiles();

    this.curPlayerIndex = (this.curPlayerIndex + 1) % 2;
    this.gameState = "SHIFTING";
    this.draw(ctx);
  }
}

export default GameEngine;

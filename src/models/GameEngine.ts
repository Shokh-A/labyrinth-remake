import { Grid, Player, Point, Tile } from "./index";

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

    const tile = this.grid.getTile(new Point(screenX, screenY));
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
    const tile = this.grid.getTile(
      new Point(screenX, screenY),
      this.gameState === "MOVING"
    );
    if (!tile) return;
    console.log(
      "Clicked on tile:",
      this.grid.screenToIso(tile.pos, tile.isConnected)
    );

    const curPlayer = this.grid.getPlayer(this.curPlayerIndex);
    if (this.gameState === "SHIFTING") {
      if (tile === this.grid.extraTile) this.grid.rotateTile(tile);
      else if (tile === this.grid.hoveredTile) {
        this.grid.shiftAndRise(ctx, tile);
        this.gameState = "MOVING";
      }
      this.draw(ctx);
    } else if (this.gameState === "MOVING" && tile.isConnected) {
      this.movePlayer(ctx, tile, curPlayer);
    }
  }

  private movePlayer(
    ctx: CanvasRenderingContext2D,
    tile: Tile,
    player: Player
  ): void {
    const { x: row, y: col } = this.grid.screenToIso(player.pos, true);
    console.log(this.grid.tiles[row][col]);
    this.grid.tiles[row][col].setPlayer(null);
    tile.setPlayer(player);

    this.grid.lowerTiles();
    this.grid.animate(ctx);

    this.curPlayerIndex = (this.curPlayerIndex + 1) % 2;
    this.gameState = "SHIFTING";
    this.draw(ctx);
  }
}

export default GameEngine;

import { Grid, Tile } from "./index";

class GameEngine {
  private readonly grid: Grid;
  private slidingOn: boolean = true;

  constructor(
    private readonly worldWidth: number,
    private readonly worldHeight: number,
    tileWidth: number,
    tileHeight: number,
    tileDepth: number
  ) {
    this.grid = new Grid(worldWidth, 7, 7, tileWidth, tileHeight, tileDepth);
  }

  async start(ctx: CanvasRenderingContext2D): Promise<void> {
    try {
      await this.grid.init();
      this.redrawGrid(ctx);
    } catch (error) {
      console.error("Error occurred during game start:", error);
    }
  }

  redrawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.worldWidth, this.worldHeight);
    this.grid.draw(ctx);
  }

  handleMouseHover(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    if (!this.slidingOn) return;
    const tile = this.grid.getTile(screenX, screenY);

    if (!tile) {
      this.clearHoveredTile();
      this.redrawGrid(ctx);
      return;
    }

    if (tile.tileType === "ENABLED" && !this.grid.hoveredTile) {
      this.grid.hoveredTile = this.grid.swapWithExtraTile(tile);
    } else if (tile !== this.grid.hoveredTile && this.grid.hoveredTile) {
      this.clearHoveredTile();
    }
    this.redrawGrid(ctx);
  }

  private clearHoveredTile(): void {
    if (this.grid.hoveredTile) {
      this.grid.swapWithExtraTile(this.grid.hoveredTile);
      this.grid.hoveredTile = null;
    }
  }

  handleMouseClick(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    if (!this.slidingOn) return;
    const extraTile = this.grid.getExtraTile(screenX, screenY);
    if (extraTile) {
      this.grid.rotateTile(extraTile);
      this.redrawGrid(ctx);
      return;
    }

    const tile = this.grid.getTile(screenX, screenY);

    if (
      tile &&
      this.grid.hoveredTile &&
      this.grid.isEdge(tile.pos.x, tile.pos.y) &&
      this.grid.isEvenTile(tile.pos.x, tile.pos.y) &&
      !this.grid.isCorner(tile.pos.x, tile.pos.y)
    ) {
      this.grid.shiftAndDisable(tile);
      this.grid.swapWithExtraTile(this.grid.hoveredTile!);
      this.grid.hoveredTile = null;
      this.redrawGrid(ctx);
      // this.slidingOn = false;
    }
  }
}

export default GameEngine;

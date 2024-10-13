import { Grid, Tile } from "./index";

class GameEngine {
  private readonly grid: Grid;

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
    const tile = this.grid.getTile(screenX, screenY);

    if (!tile) {
      this.clearHoveredTile(ctx);
      return;
    }

    if (
      this.grid.getTileType(tile.pos.x, tile.pos.y) === "ACTION" &&
      !this.grid.hoveredTile
    ) {
      this.setHoveredTile(tile, ctx);
    } else if (tile !== this.grid.hoveredTile && this.grid.hoveredTile) {
      this.clearHoveredTile(ctx);
    }
  }

  handleMouseClick(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    if (this.handleExtraTileClick(ctx, screenX, screenY)) return;

    const tile = this.grid.getTile(screenX, screenY);
    if (tile && this.isValidEdgeTile(tile)) {
      this.grid.shiftRow(this.grid.hoveredTile!, "SOUTH");
      this.redrawGrid(ctx);
    }
  }

  private clearHoveredTile(ctx: CanvasRenderingContext2D): void {
    if (this.grid.hoveredTile) {
      this.grid.swapWithExtraTile(this.grid.hoveredTile);
      this.grid.hoveredTile = null;
      this.redrawGrid(ctx);
    }
  }

  private setHoveredTile(tile: Tile, ctx: CanvasRenderingContext2D): void {
    if (this.grid.extraTile) {
      this.grid.hoveredTile = this.grid.swapWithExtraTile(tile);
      this.redrawGrid(ctx);
    }
  }

  private isValidEdgeTile(tile: Tile): boolean {
    const { x, y } = tile.pos;
    return this.grid.isEdge(x, y) && this.grid.isEvenTile(x, y);
  }

  private handleExtraTileClick(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): boolean {
    const extraTile = this.grid.extraTile;
    if (!extraTile) return false;

    const isoCoords = extraTile.screenToIso(screenX, screenY, this.worldWidth);
    if (
      isoCoords &&
      extraTile.pos.x === isoCoords.x &&
      extraTile.pos.y === isoCoords.y
    ) {
      this.grid.rotateTile(extraTile);
      this.redrawGrid(ctx);
      return true;
    }
    return false;
  }
}

export default GameEngine;

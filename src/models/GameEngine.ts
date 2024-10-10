import { Grid } from "./index";

class GameEngine {
  worldWidth: number;
  worldHeight: number;
  grid: Grid;

  constructor(
    worldWidth: number,
    worldHeight: number,
    tileWidth: number,
    tileHeight: number,
    tileDepth: number
  ) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.grid = new Grid(worldWidth, 7, 7, tileWidth, tileHeight, tileDepth);
  }

  async start(ctx: CanvasRenderingContext2D) {
    try {
      await this.grid.init();
      this.grid.draw(ctx);
    } catch (error) {
      console.error("Error occured during game start:", error);
    }
  }

  redrawGrid(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.worldWidth, this.worldHeight);
    this.grid.draw(ctx);
  }

  handleMouseHover(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ) {
    const tile = this.grid.getTile(screenX, screenY);
    if (tile === null) {
      if (this.grid.hoveredTile !== null) {
        this.grid.hoveredTile.tileType = "ACTION";
        this.grid.hoveredTile = null;

        this.redrawGrid(ctx);
      }
      return;
    }
    if (this.grid.isActionTile(tile) && this.grid.hoveredTile === null) {
      this.grid.hoveredTile = tile;
      tile.tileType = "FIXED";

      this.redrawGrid(ctx);
    } else if (
      tile !== this.grid.hoveredTile &&
      this.grid.hoveredTile !== null
    ) {
      this.grid.hoveredTile.tileType = "ACTION";
      this.grid.hoveredTile = null;

      this.redrawGrid(ctx);
    }
  }
}

export default GameEngine;
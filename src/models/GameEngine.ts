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

  run(ctx: CanvasRenderingContext2D) {
    this.grid.draw(ctx);
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
    const { x: row, y: col } = this.grid.getTile(screenX, screenY);

    if (
      this.isEdge(row, col) &&
      !this.isCorner(row, col) &&
      row % 2 === 0 &&
      col % 2 === 0 &&
      this.grid.hoveredTile === null
    ) {
      const hoveredTile = this.grid.tiles[row][col];
      hoveredTile.tileType = "FIXED";
      this.grid.hoveredTile = hoveredTile;

      this.redrawGrid(ctx);
    } else if (
      (row % 2 !== 0 || col % 2 !== 0) &&
      this.grid.hoveredTile !== null
    ) {
      this.grid.hoveredTile.tileType = "ACTION";
      this.grid.hoveredTile = null;

      this.redrawGrid(ctx);
    }
  }

  isCorner(row: number, col: number) {
    return (
      (row === 0 && col === 0) ||
      (row === 0 && col === this.grid.cols - 1) ||
      (row === this.grid.rows - 1 && col === 0) ||
      (row === this.grid.rows - 1 && col === this.grid.cols - 1)
    );
  }

  isEdge(row: number, col: number) {
    return (
      row === 0 ||
      row === this.grid.rows - 1 ||
      col === 0 ||
      col === this.grid.cols - 1
    );
  }
}

export default GameEngine;

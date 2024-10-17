import { Grid, Player, Tile } from "./index";

class GameEngine {
  private readonly grid: Grid;
  private slidingOn: boolean = true;
  private player: Player;
  private numOfCollectibles: number = 0;

  constructor(
    worldWidth: number,
    worldHeight: number,
    tileWidth: number,
    tileHeight: number,
    tileDepth: number,
    numOfCollectibles: number
  ) {
    this.grid = new Grid(worldWidth, 7, 7, tileWidth, tileHeight, tileDepth);
    this.player = new Player({ x: 1, y: 1 }, new Image());
    this.numOfCollectibles = numOfCollectibles;
  }

  async start(ctx: CanvasRenderingContext2D): Promise<void> {
    try {
      await this.grid.init(this.numOfCollectibles);
      this.redrawGrid(ctx);
      this.player.draw(ctx, this.grid.tileWidth);
    } catch (error) {
      console.error("Error occurred during game start:", error);
    }
  }

  redrawGrid(ctx: CanvasRenderingContext2D): void {
    this.grid.draw(ctx);
    this.player.draw(ctx, this.grid.tileWidth);
  }

  handleMouseHover(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    if (!this.slidingOn) return;
    const tile = this.grid.getTile(screenX, screenY);

    if (!tile) {
      this.clearHoveredTile(ctx);
      return;
    }

    if (tile.tileType === "ENABLED" && !this.grid.hoveredTile) {
      this.grid.hoveredTile = this.grid.swapWithExtraTile(tile);
      this.redrawGrid(ctx);
    } else if (tile !== this.grid.hoveredTile && this.grid.hoveredTile) {
      this.clearHoveredTile(ctx);
    }
  }

  private clearHoveredTile(ctx: CanvasRenderingContext2D): void {
    if (this.grid.hoveredTile) {
      this.grid.swapWithExtraTile(this.grid.hoveredTile);
      this.grid.hoveredTile = null;
      this.redrawGrid(ctx);
    }
  }

  handleMouseClick(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    if (!this.slidingOn) return;
    const tile = this.grid.getTile(screenX, screenY);
    console.log("Clicked tile position:", tile?.pos.x, tile?.pos.y);
    if (tile && tile === this.grid.extraTile) {
      this.grid.rotateTile(tile);
      this.redrawGrid(ctx);
      return;
    }

    if (
      tile &&
      this.grid.hoveredTile &&
      this.grid.isEdge(tile.pos.x, tile.pos.y) &&
      this.grid.isEvenTile(tile.pos.x, tile.pos.y) &&
      !this.grid.isCorner(tile.pos.x, tile.pos.y)
    ) {
      this.shiftTiles(tile);
      this.redrawGrid(ctx);
    }
  }

  shiftTiles(tile: Tile): void {
    this.grid.shiftAndDisable(tile);

    this.grid.swapWithExtraTile(this.grid.hoveredTile!);
    this.grid.hoveredTile = null;

    const playerPos = this.player.pos;
    this.grid.riseConnectedTiles(this.grid.tiles[playerPos.x][playerPos.y]);

    // this.slidingOn = false;
  }
}

export default GameEngine;

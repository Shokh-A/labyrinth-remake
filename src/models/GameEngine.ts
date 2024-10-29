import { Grid, Point } from "./index";
import InfoPanel from "./InfoPanel";

class GameEngine {
  private readonly grid: Grid;
  private readonly infoPanel: InfoPanel;
  private numOfPlayers: number = 0;
  private curPlayerIndex: number = 0;
  private gameState: "IDLE" | "SHIFTING" | "MOVING" = "IDLE";

  constructor(
    worldWidth: number,
    worldHeight: number,
    tileWidth: number,
    tileDepth: number
  ) {
    this.grid = new Grid(worldWidth, worldHeight, 7, tileWidth, tileDepth);
    this.infoPanel = new InfoPanel();
  }

  public async start(
    ctx: CanvasRenderingContext2D,
    numOfPlayers: number,
    numOfCollectibles: number
  ): Promise<void> {
    try {
      this.numOfPlayers = numOfPlayers;
      await this.grid.init(numOfPlayers, numOfCollectibles);
      this.gameState = "SHIFTING";
      this.draw(ctx);
    } catch (error) {
      console.error("Error occurred during game start:", error);
    }
  }

  drawInfoPanel(ctx: CanvasRenderingContext2D): void {
    this.infoPanel.draw(ctx);
  }

  private draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.grid.render(ctx);
  }

  private getNextPlayerIndex(): number {
    return (this.curPlayerIndex + 1) % this.numOfPlayers;
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
      this.draw(ctx);
    } else if (tile && tile.tileType === "ENABLED" && !this.grid.hoveredTile) {
      this.grid.swapWithExtraTile(tile);
      this.draw(ctx);
    }
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

    if (this.gameState === "SHIFTING") {
      if (tile === this.grid.extraTile) {
        this.grid.rotateTile(tile);
        this.draw(ctx);
      } else if (tile === this.grid.hoveredTile) {
        this.gameState = "IDLE";
        this.grid.shiftAndRise(ctx, tile, this.curPlayerIndex).then(() => {
          this.gameState = "MOVING";
        });
      }
    } else if (this.gameState === "MOVING" && tile.isConnected) {
      this.gameState = "IDLE";
      this.grid.movePlayer(ctx, tile, this.curPlayerIndex).then(() => {
        this.gameState = "SHIFTING";
      });

      this.curPlayerIndex = this.getNextPlayerIndex();
    }
  }
}

export default GameEngine;

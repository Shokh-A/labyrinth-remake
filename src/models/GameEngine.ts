import { Grid, Point } from "./index";
import InfoPanel from "./InfoPanel";

class GameEngine {
  private infoPanelCtx: CanvasRenderingContext2D = null as any;
  private readonly grid: Grid;
  private readonly infoPanel: InfoPanel;
  private numOfPlayers: number = 0;
  private curPlayerIndex: number = 0;
  private gameState: "IDLE" | "SHIFTING" | "MOVING" = "IDLE";

  constructor(worldWidth: number, worldHeight: number) {
    this.grid = new Grid(worldWidth, worldHeight, 7, 100, 10);
    this.infoPanel = new InfoPanel();
  }

  public async start(
    ctx: CanvasRenderingContext2D,
    infoPanelCtx: CanvasRenderingContext2D,
    playerNames: string[],
    numOfCollectibles: number
  ): Promise<void> {
    try {
      this.infoPanelCtx = infoPanelCtx;
      this.numOfPlayers = playerNames.length;
      await this.grid.init(playerNames, numOfCollectibles);
      this.switchToNextPlayer();
      this.gameState = "SHIFTING";
      this.render(ctx);
    } catch (error) {
      console.error("Error occurred during game start:", error);
    }
  }

  switchToNextPlayer(): void {
    this.curPlayerIndex = this.getNextPlayerIndex();
    const playerData = this.grid.getCurPlayerData(this.curPlayerIndex);
    this.infoPanel.setPlayerData(playerData);
    this.drawInfoPanel(this.infoPanelCtx);
  }

  drawInfoPanel(ctx: CanvasRenderingContext2D): void {
    this.infoPanel.draw(ctx);
  }

  private render(ctx: CanvasRenderingContext2D): void {
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
      this.render(ctx);
    } else if (tile && tile.tileType === "ENABLED" && !this.grid.hoveredTile) {
      this.grid.swapWithExtraTile(tile);
      this.render(ctx);
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
        this.render(ctx);
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
        this.switchToNextPlayer();
      });
    }
  }
}

export default GameEngine;

import { preloadImage } from "../services/imageLoader";
import { Grid, Player, Tile } from "./index";
import playerImg from "../assets/images/sprites/CharacterSheet_CharacterFront.png";

class GameEngine {
  private readonly grid: Grid;
  private players: Player[] = [];
  private curPlayerIndex: number = 0;
  private state: "IDLE" | "SHIFTING" | "MOVING" = "IDLE";

  constructor(
    worldWidth: number,
    worldHeight: number,
    tileWidth: number,
    tileHeight: number,
    tileDepth: number
  ) {
    this.grid = new Grid(worldWidth, 7, 7, tileWidth, tileHeight, tileDepth);
  }

  public async start(
    ctx: CanvasRenderingContext2D,
    numOfPlayers: number,
    numOfCollectibles: number
  ): Promise<void> {
    try {
      const corners = [
        { x: 1, y: 1 },
        { x: 1, y: 7 },
        { x: 7, y: 1 },
        { x: 7, y: 7 },
      ];
      const img = await preloadImage(playerImg);
      for (let i = 0; i < numOfPlayers; i++) {
        const player = new Player(corners[i], img);
        this.players.push(player);
      }

      await this.grid.init(this.players, numOfCollectibles);

      this.state = "SHIFTING";

      this.draw(ctx);
    } catch (error) {
      console.error("Error occurred during game start:", error);
    }
  }

  private draw(ctx: CanvasRenderingContext2D): void {
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
    if (this.state !== "SHIFTING") return;
    const tile = this.grid.getTile(screenX, screenY);

    if (!tile) {
      this.clearHoveredTile(ctx);
      return;
    }

    if (tile.tileType === "ENABLED" && !this.grid.hoveredTile) {
      this.grid.hoveredTile = this.grid.swapWithExtraTile(tile);
      this.draw(ctx);
    } else if (tile !== this.grid.hoveredTile && this.grid.hoveredTile) {
      this.clearHoveredTile(ctx);
    }
  }

  private clearHoveredTile(ctx: CanvasRenderingContext2D): void {
    if (this.grid.hoveredTile) {
      this.grid.swapWithExtraTile(this.grid.hoveredTile);
      this.grid.hoveredTile = null;
      this.draw(ctx);
    }
  }

  public handleMouseClick(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    const tile = this.grid.getTile(screenX, screenY);
    console.log("Mouse clicked at tile:", tile?.pos.x, tile?.pos.y);
    if (this.state === "SHIFTING") {
      this.shiftOrRotateTiles(ctx, tile!);
    } else if (this.state === "MOVING") {
      this.movePlayer(ctx, tile!);
    }
  }

  private shiftOrRotateTiles(ctx: CanvasRenderingContext2D, tile: Tile): void {
    if (tile && tile === this.grid.extraTile) {
      this.grid.rotateTile(tile);
      this.draw(ctx);
      return;
    }

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

      const playerPos = this.players[this.curPlayerIndex].pos;
      this.grid.riseConnectedTiles(this.grid.tiles[playerPos.x][playerPos.y]);

      this.state = "MOVING";

      this.draw(ctx);
    }
  }

  private movePlayer(ctx: CanvasRenderingContext2D, tile: Tile): void {
    const curPlayer = this.players[this.curPlayerIndex];
    if (tile?.isConnected) {
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
      this.state = "SHIFTING";
      this.curPlayerIndex = (this.curPlayerIndex + 1) % 2;

      this.disableTilesNextToPlayers();

      this.draw(ctx);
    }
  }

  disableTilesNextToPlayers() {
    for (const player of this.players) {
      this.grid.disableTileNextToPlayer(player);
    }
  }
}

export default GameEngine;

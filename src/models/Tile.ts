import { Collectible, Player, Point } from "./index";

type TileType = "FIXED" | "MOVABLE" | "EMPTY" | "ENABLED" | "DISABLED";

class Tile {
  constructor(
    public pos: Point,
    public width: number,
    public height: number,
    public depth: number,
    public pathImg: HTMLImageElement,
    public paths: string[] = [],
    public tileType: TileType,
    public collectible: Collectible | null = null,
    public player: Player | null = null,
    public isConnected: boolean = false,
    public offsetY: number = 0
  ) {}

  draw(ctx: CanvasRenderingContext2D, pos: Point) {
    if (this.tileType === "EMPTY") return;

    pos.y += this.offsetY;

    const colors = this.getTileColors();
    const isFilled =
      this.tileType === "ENABLED" ||
      this.tileType === "DISABLED" ||
      this.tileType === "FIXED";

    this.drawFace(ctx, pos, colors.top, this.drawTopFace.bind(this), isFilled);
    this.drawFace(ctx, pos, colors.left, this.drawLeftFace.bind(this));
    this.drawFace(ctx, pos, colors.right, this.drawRightFace.bind(this));
  }

  private getTileColors() {
    switch (this.tileType) {
      case "FIXED":
        return {
          top: "rgba(204, 128, 0, 0.3)",
          left: "rgba(144, 238, 144, 0.3)",
          right: "rgba(144, 238, 144, 0.3)",
        };
      case "ENABLED":
        return {
          top: "rgba(144, 238, 144, 0.3)",
          left: "rgba(144, 238, 144, 0.3)",
          right: "rgba(144, 238, 144, 0.3)",
        };
      case "DISABLED":
        return {
          top: "rgba(255, 99, 132, 0.3)",
          left: "rgba(220, 20, 60, 0.3)",
          right: "rgba(139, 0, 0, 0.3)",
        };
      default:
        return {
          top: "rgba(255, 99, 132, 0.3)",
          left: "#4d7224",
          right: "#2f4b13",
        };
    }
  }

  private drawFace(
    ctx: CanvasRenderingContext2D,
    pos: Point,
    color: string,
    drawMethod: (ctx: CanvasRenderingContext2D, pos: Point) => void,
    isFilled: boolean = true
  ) {
    ctx.beginPath();
    drawMethod(ctx, pos);
    ctx.closePath();

    if (isFilled) {
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.strokeStyle = "#000";
    ctx.stroke();
  }

  private drawTopFace(ctx: CanvasRenderingContext2D, pos: Point) {
    if (this.tileType === "FIXED" || this.tileType === "MOVABLE") {
      ctx.drawImage(
        this.pathImg,
        pos.x - this.width / 2,
        pos.y,
        this.width,
        this.height
      );
    }
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x - this.width / 2, pos.y + this.height / 2);
  }

  private drawLeftFace(ctx: CanvasRenderingContext2D, pos: Point) {
    ctx.moveTo(pos.x - this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x, pos.y + this.height + this.depth);
    ctx.lineTo(pos.x - this.width / 2, pos.y + this.height / 2 + this.depth);
  }

  private drawRightFace(ctx: CanvasRenderingContext2D, pos: Point) {
    ctx.moveTo(pos.x + this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x, pos.y + this.height + this.depth);
    ctx.lineTo(pos.x + this.width / 2, pos.y + this.height / 2 + this.depth);
  }

  public setPos(pos: Point) {
    this.pos = pos;
    if (this.collectible) {
      this.collectible.gridPos = pos;
    }
    if (this.player) {
      console.log("Setting player pos to", pos);
      this.player.pos = pos;
    }
  }

  public setIsConnected(isConnected: boolean) {
    this.offsetY = isConnected ? -10 : 0;
    if (this.collectible) {
      this.collectible.offsetY = isConnected ? -10 : 0;
    }
    if (this.player) {
      this.player.offsetY = isConnected ? -10 : 0;
    }
    this.isConnected = isConnected;
  }
}

export default Tile;

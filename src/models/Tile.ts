import { Collectible, Point } from "./index";

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
    public isConnected: boolean = false
  ) {}

  draw(ctx: CanvasRenderingContext2D, pos: Point) {
    if (this.tileType === "EMPTY") return;

    if (this.isConnected) {
      this.depth = 20;
      pos.y -= 10;
    } else {
      this.depth = 10;
    }
    const colors = this.getTileColors();
    const isFilled =
      this.tileType === "ENABLED" || this.tileType === "DISABLED";

    this.drawFace(ctx, pos, colors.top, this.drawTopFace.bind(this), isFilled);
    this.drawFace(ctx, pos, colors.left, this.drawLeftFace.bind(this));
    this.drawFace(ctx, pos, colors.right, this.drawRightFace.bind(this));
  }

  private getTileColors() {
    const isDisabled = this.tileType === "DISABLED";
    const isEnabled = this.tileType === "ENABLED";

    if (isDisabled) {
      return {
        top: "rgba(255, 99, 132, 0.3)",
        left: "rgba(220, 20, 60, 0.3)",
        right: "rgba(139, 0, 0, 0.3)",
      };
    }
    return {
      top: isEnabled ? "rgba(144, 238, 144, 0.3)" : "rgba(255, 99, 132, 0.3)",
      left: isEnabled ? "rgba(144, 238, 144, 0.3)" : "#4d7224",
      right: isEnabled ? "rgba(144, 238, 144, 0.3)" : "#2f4b13",
    };
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
  }
}

export default Tile;

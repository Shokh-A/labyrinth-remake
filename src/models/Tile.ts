import { Point } from "./index";

type TileType = "FIXED" | "MOVABLE" | "ACTION" | "EMPTY";

class Tile {
  constructor(
    public pos: Point,
    public width: number,
    public height: number,
    public depth: number,
    public pathImg: HTMLImageElement,
    public paths: string[] = [],
    public tileType: TileType
  ) {}

  draw(ctx: CanvasRenderingContext2D, windowSize: number) {
    if (this.tileType === "EMPTY") return;

    const pos = this.isoToScreen(this.pos.x, this.pos.y, windowSize);
    const colors = this.getTileColors();

    this.drawFace(
      ctx,
      pos,
      colors.top,
      this.drawTopFace.bind(this),
      this.tileType === "ACTION"
    );
    this.drawFace(ctx, pos, colors.left, this.drawLeftFace.bind(this));
    this.drawFace(ctx, pos, colors.right, this.drawRightFace.bind(this));
  }

  private getTileColors() {
    const isAction = this.tileType === "ACTION";
    return {
      top: isAction ? "rgba(144, 238, 144, 0.3)" : "#ffdb4d",
      left: isAction ? "rgba(144, 238, 144, 0.3)" : "#4d7224",
      right: isAction ? "rgba(144, 238, 144, 0.3)" : "#2f4b13",
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

  isoToScreen(x: number, y: number, windowSize: number): Point {
    return new Point(
      (x - y) * (this.width / 2) + windowSize / 2,
      (x + y) * (this.height / 2)
    );
  }

  screenToIso(
    screenX: number,
    screenY: number,
    windowSize: number
  ): { x: number; y: number } {
    const centeredX = screenX - windowSize / 2;
    const x = (centeredX / (this.width / 2) + screenY / (this.height / 2)) / 2;
    const y = (screenY / (this.height / 2) - centeredX / (this.width / 2)) / 2;
    return { x: Math.floor(x), y: Math.floor(y) };
  }
}

export default Tile;

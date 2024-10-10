import { Point } from "./index";

type TileType = "FIXED" | "MOVABLE" | "ACTION" | "EMPTY";

class Tile {
  pos: Point;
  width: number;
  height: number;
  depth: number;
  pathImg: HTMLImageElement;
  paths: string[] = [];
  isConnected: boolean = false;
  tileType: TileType;

  constructor(
    pos: Point,
    width: number,
    height: number,
    depth: number,
    img: HTMLImageElement,
    paths: string[] = [],
    tileType: TileType
  ) {
    this.pos = pos;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.pathImg = img;
    this.paths = paths;
    this.tileType = tileType;
  }

  draw(ctx: CanvasRenderingContext2D, windowSize: number) {
    if (this.tileType === "EMPTY") {
      return;
    }

    const topColor =
      this.tileType === "ACTION" ? "rgba(144, 238, 144, 0.3)" : "#ffdb4d";
    const sideLeftColor =
      this.tileType === "ACTION" ? "rgba(144, 238, 144, 0.3)" : "#4d7224";
    const sideRightColor =
      this.tileType === "ACTION" ? "rgba(144, 238, 144, 0.3)" : "#2f4b13";

    const pos = this.isoToScreen(this.pos.x, this.pos.y, windowSize);
    this.drawTopFace(ctx, pos, topColor);
    this.drawLeftFace(ctx, pos, sideLeftColor);
    this.drawRightFace(ctx, pos, sideRightColor);
  }

  drawTopFace(ctx: CanvasRenderingContext2D, pos: Point, topColor: string) {
    if (
      this.tileType !== "ACTION" &&
      this.tileType !== "EMPTY" &&
      (this.tileType === "FIXED" || this.tileType === "MOVABLE")
    ) {
      ctx.drawImage(
        this.pathImg,
        pos.x - this.width / 2,
        pos.y,
        this.width,
        this.height
      );
    }

    // Draw the top face outline
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x - this.width / 2, pos.y + this.height / 2);
    ctx.closePath();
    if (this.tileType === "ACTION") {
      ctx.fillStyle = topColor;
      ctx.fill();
    }
    ctx.strokeStyle = "#000";
    ctx.stroke();
  }

  drawLeftFace(
    ctx: CanvasRenderingContext2D,
    pos: Point,
    sideLeftColor: string = "#4d7224"
  ) {
    ctx.beginPath();
    ctx.moveTo(pos.x - this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x, pos.y + this.height + this.depth);
    ctx.lineTo(pos.x - this.width / 2, pos.y + this.height / 2 + this.depth);
    ctx.closePath();
    ctx.fillStyle = sideLeftColor;
    ctx.fill();
    ctx.stroke();
  }

  drawRightFace(
    ctx: CanvasRenderingContext2D,
    pos: Point,
    sideRightColor: string = "2f4b13"
  ) {
    ctx.beginPath();
    ctx.moveTo(pos.x + this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x, pos.y + this.height + this.depth);
    ctx.lineTo(pos.x + this.width / 2, pos.y + this.height / 2 + this.depth);
    ctx.closePath();
    ctx.fillStyle = sideRightColor;
    ctx.fill();
    ctx.stroke();
  }

  // Convert isometric coordinates to screen coordinates
  isoToScreen(x: number, y: number, windowSize: number) {
    const screenX = (x - y) * (this.width / 2) + windowSize / 2;
    const screenY = (x + y) * (this.height / 2);
    return new Point(screenX, screenY);
  }

  screenToIso(screenX: number, screenY: number, windowSize: number) {
    const centeredX = screenX - windowSize / 2;
    const x = (centeredX / (this.width / 2) + screenY / (this.height / 2)) / 2;
    const y = (screenY / (this.height / 2) - centeredX / (this.width / 2)) / 2;
    return { x: Math.floor(x), y: Math.floor(y) };
  }
}

export default Tile;

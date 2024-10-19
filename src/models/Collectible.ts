import GameObject from "./GameObject";
import Point from "./Point";

class Collectible extends GameObject {
  constructor(
    public srcPos: Point,
    gridPos: Point,
    width: number,
    height: number,
    public img: HTMLImageElement,
    public collected: boolean = false,
    private srcWidth: number = 512,
    private srcHeight: number = 512
  ) {
    super(gridPos, width, height);
    if (srcPos.x > 14) {
      this.srcPos.x = Math.round(srcPos.x / 14) * this.srcWidth;
      this.srcPos.y = (srcPos.y % 14) * this.srcHeight;
    } else if (srcPos.y > 7) {
      this.srcPos.x = Math.round(srcPos.y / 7) * this.srcWidth;
      this.srcPos.y = (srcPos.y % 7) * this.srcHeight;
    } else {
      srcPos.x = srcPos.x * this.srcWidth;
      srcPos.y = srcPos.y * this.srcHeight;
      this.srcPos = srcPos;
    }
  }

  public collect(): void {
    this.collected = true;
  }

  public draw(ctx: CanvasRenderingContext2D, pos: Point): void {
    ctx.drawImage(
      this.img,
      this.srcPos.x,
      this.srcPos.y,
      this.srcWidth,
      this.srcHeight,
      pos.x,
      pos.y + this.offsetY,
      this.width,
      this.height
    );
  }
}

export default Collectible;

import { Point } from "./index";

class Collectible {
  constructor(
    public srcPos: Point,
    public gridPos: Point,
    public width: number,
    public height: number,
    public img: HTMLImageElement,
    public collected: boolean = false
  ) {
    if (srcPos.x > 14) {
      this.srcPos.x = Math.round(srcPos.x / 14) * 512;
      this.srcPos.y = (srcPos.y % 14) * 512;
    } else if (srcPos.y > 7) {
      this.srcPos.x = Math.round(srcPos.y / 7) * 512;
      this.srcPos.y = (srcPos.y % 7) * 512;
    } else {
      srcPos.x = srcPos.x * 512;
      srcPos.y = srcPos.y * 512;
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
      512,
      512,
      pos.x,
      pos.y,
      this.width,
      this.height
    );
  }
}

export default Collectible;

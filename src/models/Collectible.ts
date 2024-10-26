import GameObject from "./GameObject";
import Point from "./Point";

class Collectible extends GameObject {
  constructor(
    pos: Point,
    width: number,
    height: number,
    private collectibleType: number,
    private img: HTMLImageElement
  ) {
    super(pos, width, height);
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const sRows = 8;
    const sCols = 15;
    const sWidth = 512;
    const sHeight = 512;
    const sx = sWidth * (sCols - 1 - (this.collectibleType % sCols));
    const sy =
      sHeight *
      (sRows - 1 - (Math.floor(this.collectibleType / sCols) % sRows));

    const pos = this.pos.copy();
    pos.x = pos.x - this.width / 2;
    pos.y = pos.y - 2;

    ctx.drawImage(
      this.img,
      sx,
      sy,
      sWidth,
      sHeight,
      pos.x,
      pos.y,
      this.width,
      this.height
    );
  }

  setPos(pos: Point): void {
    this.pos = pos.copy();
  }
}

export default Collectible;

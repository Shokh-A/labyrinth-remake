import { Point } from "./index";

class Player {
  public offsetY: number = 0;

  constructor(public pos: Point, public img: HTMLImageElement) {}

  draw(ctx: CanvasRenderingContext2D, windowSize: number) {
    const sx = 105;
    const sy = 15;
    const pos = this.isoToScreen(this.pos);
    pos.x = pos.x - 70 / 4;
    pos.y = pos.y - 70 / 2;
    ctx.drawImage(
      this.img,
      sx,
      sy,
      350,
      350,
      pos.x,
      pos.y + this.offsetY,
      70,
      70
    );
  }

  isoToScreen(pos: Point): Point {
    return new Point(
      (pos.x - pos.y) * (100 / 2) + 900 / 2,
      (pos.x + pos.y) * (50 / 2)
    );
  }
}

export default Player;

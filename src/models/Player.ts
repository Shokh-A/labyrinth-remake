import GameObject from "./GameObject";
import Point from "./Point";

class Player extends GameObject {
  constructor(pos: Point, public img: HTMLImageElement) {
    super(pos, 70, 70);
  }

  draw(ctx: CanvasRenderingContext2D, poss: Point) {
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

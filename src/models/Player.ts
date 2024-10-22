import GameObject from "./GameObject";
import Point from "./Point";

class Player extends GameObject {
  constructor(pos: Point, public img: HTMLImageElement) {
    super(pos, 60, 60);
  }

  draw(ctx: CanvasRenderingContext2D, pos: Point) {
    const sx = 350;
    const sy = 700;
    const sWidth = 350;
    const sHeight = 350;
    pos.x = pos.x - this.width / 2;
    pos.y = pos.y - this.height / 2;

    ctx.drawImage(
      this.img,
      sx,
      sy,
      sWidth,
      sHeight,
      pos.x,
      pos.y + this.offsetY,
      this.width,
      this.height
    );
  }
}

export default Player;

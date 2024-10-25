import GameObject from "./GameObject";
import Point from "./Point";

class Player extends GameObject {
  private frame: number = 1;

  constructor(
    pos: Point,
    public imgs: {
      [key: string]: HTMLImageElement;
    }
  ) {
    super(pos, 60, 60);
  }

  update() {
    this.frame = 1 + ((this.frame + 1) % 3);
    console.log("this.frame", this.frame);
  }

  draw(ctx: CanvasRenderingContext2D, pos: Point) {
    const sx = 350 * this.frame;
    const sy = 700;
    const sWidth = 350;
    const sHeight = 350;
    pos.x = pos.x - this.width / 2;
    pos.y = pos.y - this.height / 2;

    ctx.drawImage(
      this.imgs.EAST,
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

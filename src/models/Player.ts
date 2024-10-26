import GameObject from "./GameObject";
import Point from "./Point";

class Player extends GameObject {
  private frame: number = 0;
  private lastUpdateTime: number = 0;
  private frameDurationInMs: number = 150;

  public target: {
    pos: Point;
    direction: string;
  } | null = null;

  constructor(
    pos: Point,
    public imgs: {
      [key: string]: HTMLImageElement;
    }
  ) {
    super(pos, 60, 60);
  }

  update(timestamp: number) {
    if (!this.target) return;

    if (!this.lastUpdateTime) this.lastUpdateTime = timestamp;
    const elapsedTime = timestamp - this.lastUpdateTime;

    if (elapsedTime > this.frameDurationInMs) {
      this.frame = (this.frame + 1) % 4;
      this.lastUpdateTime = timestamp;
    }

    if (this.target.direction === "SOUTH") {
      this.pos.x -= 1;
      this.pos.y += 1 / 2;
    } else if (this.target.direction === "WEST") {
      this.pos.x -= 1;
      this.pos.y -= 1 / 2;
    } else if (this.target.direction === "EAST") {
      this.pos.x += 1;
      this.pos.y += 1 / 2;
    } else if (this.target.direction === "NORTH") {
      this.pos.x += 1;
      this.pos.y -= 1 / 2;
    }

    if (this.pos.equals(this.target.pos)) {
      this.frame = 0;
      this.target = null;
      console.log("Target reached");
    }
  }

  setPos(pos: Point): void {
    this.pos = pos.copy();
  }

  setTargetPos(pos: Point, direction: string) {
    pos.y -= 10;
    console.log(direction);
    this.target = { pos, direction };
  }

  draw(ctx: CanvasRenderingContext2D) {
    const sx = 350 * this.frame;
    const sy = 0;
    const sWidth = 350;
    const sHeight = 350;
    const pos = this.pos.copy();
    pos.x = pos.x - this.width / 2;
    pos.y = pos.y - this.height / 2;

    const img = this.imgs[this.target?.direction || "EAST"];

    ctx.drawImage(
      img,
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
}

export default Player;

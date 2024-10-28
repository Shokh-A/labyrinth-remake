import Point from "./Point";

export enum DIRECTION {
  NORTH = "NORTH",
  SOUTH = "SOUTH",
  EAST = "EAST",
  WEST = "WEST",
  UP = "UP",
  DOWN = "DOWN",
  BRIGHTER = "BRIGHTER",
  DARKER = "DARKER",
  NONE = "NONE",
}

abstract class GameObject {
  constructor(
    public pos: Point,
    public width: number,
    public height: number,
    protected target: { pos: Point; direction: DIRECTION } | null = null
  ) {}

  protected abstract draw(ctx: CanvasRenderingContext2D): void;
  protected abstract update(timestamp: number): void;

  setPos(pos: Point): void {
    this.pos = Point.from(pos);
  }

  render(ctx: CanvasRenderingContext2D, timestamp: number = 0): void {
    this.update(timestamp);
    this.draw(ctx);
  }
}

export default GameObject;

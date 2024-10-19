import Point from "./Point";

abstract class GameObject {
  constructor(
    public pos: Point,
    public width: number,
    public height: number,
    public offsetY: number = 0
  ) {}

  abstract draw(ctx: CanvasRenderingContext2D, pos: Point): void;
}

export default GameObject;

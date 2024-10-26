import Point from "./Point";

abstract class GameObject {
  constructor(public pos: Point, public width: number, public height: number) {}

  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract setPos(pos: Point): void;
}

export default GameObject;

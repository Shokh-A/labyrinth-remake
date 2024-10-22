class Point {
  constructor(public x: number, public y: number) {}

  public copy(): Point {
    return new Point(this.x, this.y);
  }

  public equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }
}

export default Point;

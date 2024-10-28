class Point {
  constructor(public x: number, public y: number) {}

  static from(point: Point): Point {
    return new Point(point.x, point.y);
  }

  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }
}

export default Point;

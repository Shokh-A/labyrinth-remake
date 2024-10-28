import Collectible from "./Collectible";
import GameObject, { DIRECTION } from "./GameObject";
import Player from "./Player";
import Point from "./Point";

type TileType = "FIXED" | "MOVABLE" | "ENABLED" | "DISABLED";

interface TileTarget {
  pos: Point;
  direction: DIRECTION;
  brightness: number;
}

class Tile extends GameObject {
  protected target: TileTarget | null = null;
  private brightness: number = 0;

  constructor(
    pos: Point,
    width: number,
    height: number,
    public depth: number,
    public pathImg: HTMLImageElement,
    public paths: string[] = [],
    public tileType: TileType,
    public isConnected: boolean = false,
    public collectible: Collectible | null = null,
    public player: Player | null = null
  ) {
    super(pos, width, height);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = Point.from(this.pos);

    const colors = this.getTileColors();

    this.drawFace(ctx, pos, colors.top, this.drawTopFace.bind(this));
    this.drawFace(ctx, pos, colors.left, this.drawLeftFace.bind(this));
    this.drawFace(ctx, pos, colors.right, this.drawRightFace.bind(this));

    this.collectible?.draw(ctx);
  }

  private getTileColors() {
    var topColor = "rgba(144, 238, 144, 0.3)";
    var leftColor = "rgba(144, 238, 144, 0.3)";
    var rightColor = "rgba(144, 238, 144, 0.3)";
    switch (this.tileType) {
      case "FIXED":
        topColor =
          this.isConnected || this.brightness > 0
            ? `rgba(144, 238, 144, ${this.brightness})`
            : "rgba(204, 128, 0, 0.3)";
        break;
      case "DISABLED":
        topColor = "rgba(255, 99, 132, 0.3)";
        leftColor = "rgba(220, 20, 60, 0.3)";
        rightColor = "rgba(139, 0, 0, 0.3)";
        break;
      case "MOVABLE":
        topColor = `rgba(144, 238, 144, ${this.brightness})`;
        break;
    }

    return {
      top: topColor,
      left: leftColor,
      right: rightColor,
    };
  }

  private drawFace(
    ctx: CanvasRenderingContext2D,
    pos: Point,
    color: string,
    drawMethod: (ctx: CanvasRenderingContext2D, pos: Point) => void
  ) {
    ctx.beginPath();
    drawMethod(ctx, pos);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = "#000";
    ctx.stroke();
  }

  private drawTopFace(ctx: CanvasRenderingContext2D, pos: Point) {
    if (this.tileType === "FIXED" || this.tileType === "MOVABLE") {
      ctx.drawImage(
        this.pathImg,
        pos.x - this.width / 2,
        pos.y,
        this.width,
        this.height
      );
    }
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x - this.width / 2, pos.y + this.height / 2);
  }

  private drawLeftFace(ctx: CanvasRenderingContext2D, pos: Point) {
    ctx.moveTo(pos.x - this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x, pos.y + this.height + this.depth);
    ctx.lineTo(pos.x - this.width / 2, pos.y + this.height / 2 + this.depth);
  }

  private drawRightFace(ctx: CanvasRenderingContext2D, pos: Point) {
    ctx.moveTo(pos.x + this.width / 2, pos.y + this.height / 2);
    ctx.lineTo(pos.x, pos.y + this.height);
    ctx.lineTo(pos.x, pos.y + this.height + this.depth);
    ctx.lineTo(pos.x + this.width / 2, pos.y + this.height / 2 + this.depth);
  }

  update() {
    if (!this.target) return;

    this.updatePosition();
    this.updateBrightness();

    if (
      this.pos.equals(this.target.pos) &&
      this.brightness === this.target.brightness
    ) {
      this.target = null;
    }
  }

  private updatePosition() {
    const moveOffset = 1;

    switch (this.target!.direction) {
      case "UP":
        this.pos.y -= moveOffset / 2;
        break;
      case "DOWN":
        this.pos.y += moveOffset / 2;
        break;
      case "SOUTH":
        this.pos.x -= moveOffset;
        this.pos.y += moveOffset / 2;
        break;
      case "NORTH":
        this.pos.x += moveOffset;
        this.pos.y -= moveOffset / 2;
        break;
      case "EAST":
        this.pos.x += moveOffset;
        this.pos.y += moveOffset / 2;
        break;
      case "WEST":
        this.pos.x -= moveOffset;
        this.pos.y -= moveOffset / 2;
        break;
    }

    this.player?.setPos(this.pos);
    this.collectible?.setPos(this.pos);
  }

  private updateBrightness() {
    if (
      this.target!.direction === "DARKER" &&
      this.brightness < this.target!.brightness
    ) {
      this.brightness = parseFloat((this.brightness + 0.05).toFixed(2));
    } else if (
      this.target!.direction === "BRIGHTER" &&
      this.brightness > this.target!.brightness
    ) {
      this.brightness = parseFloat((this.brightness - 0.05).toFixed(2));
    }
  }

  setPos(pos: Point) {
    this.pos = Point.from(pos);
    if (this.collectible) this.collectible.setPos(pos);
    if (this.player) this.player.setPos(pos);
  }

  setTargetPos(pos: Point, direction: DIRECTION, brightness: number = 0) {
    this.target = { pos, direction, brightness };
  }

  hasTarget() {
    return this.target !== null;
  }

  setIsConnected(isConnected: boolean) {
    this.isConnected = isConnected;
    const pos = Point.from(this.pos);
    pos.y += isConnected ? -10 : 10;
    this.setTargetPos(pos, isConnected ? DIRECTION.UP : DIRECTION.DOWN);
  }

  setCollectible(collectible: Collectible | null) {
    this.collectible = collectible;
    if (this.collectible) this.collectible.setPos(this.pos);
  }

  setPlayer(player: Player | null) {
    this.player = player;
    if (this.player) this.player.setPos(this.pos);
  }
}

export default Tile;

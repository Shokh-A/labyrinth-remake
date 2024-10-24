import Collectible from "./Collectible";
import GameObject from "./GameObject";
import Player from "./Player";
import Point from "./Point";

type TileType = "FIXED" | "MOVABLE" | "ENABLED" | "DISABLED";

class Tile extends GameObject {
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
    public player: Player | null = null,

    public target: { pos: Point; direction: string } | null = null
  ) {
    super(pos, width, height);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.pos.copy();

    const colors = this.getTileColors();
    const isFilled =
      this.tileType === "ENABLED" ||
      this.tileType === "DISABLED" ||
      this.tileType === "FIXED";

    this.drawFace(ctx, pos, colors.top, this.drawTopFace.bind(this), isFilled);
    this.drawFace(ctx, pos, colors.left, this.drawLeftFace.bind(this));
    this.drawFace(ctx, pos, colors.right, this.drawRightFace.bind(this));

    // Reset the position, pos is just reference any changes made into it will reflect in the original object
    this.collectible?.draw(ctx, new Point(pos.x, pos.y));
    this.player?.draw(ctx, new Point(pos.x, pos.y));
  }

  private getTileColors() {
    switch (this.tileType) {
      case "FIXED":
        return {
          top: "rgba(204, 128, 0, 0.3)",
          left: "rgba(144, 238, 144, 0.3)",
          right: "rgba(144, 238, 144, 0.3)",
        };
      case "ENABLED":
        return {
          top: "rgba(144, 238, 144, 0.3)",
          left: "rgba(144, 238, 144, 0.3)",
          right: "rgba(144, 238, 144, 0.3)",
        };
      case "DISABLED":
        return {
          top: "rgba(255, 99, 132, 0.3)",
          left: "rgba(220, 20, 60, 0.3)",
          right: "rgba(139, 0, 0, 0.3)",
        };
      default:
        return {
          top: "rgba(255, 99, 132, 0.3)",
          left: "#4d7224",
          right: "#2f4b13",
        };
    }
  }

  private drawFace(
    ctx: CanvasRenderingContext2D,
    pos: Point,
    color: string,
    drawMethod: (ctx: CanvasRenderingContext2D, pos: Point) => void,
    isFilled: boolean = true
  ) {
    ctx.beginPath();
    drawMethod(ctx, pos);
    ctx.closePath();

    if (isFilled) {
      ctx.fillStyle = color;
      ctx.fill();
    }

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

  public update() {
    if (
      this.target &&
      (this.target.direction === "UP" || this.target.direction === "DOWN")
    ) {
      this.pos.y += (1 / 2) * (this.target.direction === "DOWN" ? 1 : -1);
      if (this.pos.y === this.target.pos.y) this.target = null;
      return;
    }

    if (this.target && this.target.direction === "SOUTH") {
      this.pos.x -= 1;
      this.pos.y += 1 / 2;
    } else if (this.target && this.target.direction === "NORTH") {
      this.pos.x += 1;
      this.pos.y -= 1 / 2;
    } else if (this.target && this.target.direction === "EAST") {
      this.pos.x += 1;
      this.pos.y += 1 / 2;
    } else if (this.target && this.target.direction === "WEST") {
      this.pos.x -= 1;
      this.pos.y -= 1 / 2;
    }

    if (this.target && this.pos.equals(this.target.pos)) {
      this.target = null;
    }
  }

  public setPos(pos: Point) {
    this.pos = pos;
    if (this.collectible) this.collectible.pos = pos;
    if (this.player) this.player.pos = pos;
  }

  public setTargetPos(pos: Point, direction: string) {
    this.target = { pos, direction };
  }

  public setIsConnected(isConnected: boolean) {
    this.isConnected = isConnected;
    const pos = this.pos.copy();
    pos.y += isConnected ? -10 : 10;
    this.setTargetPos(pos, isConnected ? "UP" : "DOWN");
    // if (this.collectible) this.collectible.offsetY = isConnected ? -10 : 0;
    // if (this.player) this.player.offsetY = isConnected ? -10 : 0;
  }

  public setCollectible(collectible: Collectible) {
    this.collectible = collectible;
    this.collectible.pos = this.pos;
  }

  public setPlayer(player: Player | null) {
    this.player = player;
    if (this.player) this.player.pos = this.pos;
  }
}

export default Tile;

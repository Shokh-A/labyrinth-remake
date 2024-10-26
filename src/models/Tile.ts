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

    private brightness: number = 0,

    public target: {
      pos: Point;
      direction: string;
      brightness: number;
    } | null = null
  ) {
    super(pos, width, height);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.pos.copy();

    const colors = this.getTileColors();
    const isFilled =
      this.tileType === "ENABLED" ||
      this.tileType === "DISABLED" ||
      this.tileType === "FIXED" ||
      this.tileType === "MOVABLE";

    this.drawFace(ctx, pos, colors.top, this.drawTopFace.bind(this), isFilled);
    this.drawFace(ctx, pos, colors.left, this.drawLeftFace.bind(this));
    this.drawFace(ctx, pos, colors.right, this.drawRightFace.bind(this));

    this.collectible?.draw(ctx);
    this.player?.draw(ctx);
  }

  private getTileColors() {
    switch (this.tileType) {
      case "FIXED":
        return {
          top:
            this.brightness > 0 || this.isConnected
              ? `rgba(144, 238, 144, ${this.brightness})`
              : "rgba(204, 128, 0, 0.3)",
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
      case "MOVABLE":
        return {
          top: `rgba(144, 238, 144, ${this.brightness})`,
          left: "#4d7224",
          right: "#2f4b13",
        };
      default:
        return {
          top: "rgba(144, 238, 144, 0.7)",
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
    if (!this.target) return;

    const animationMap: { [key: string]: () => void } = {
      UP: () => {
        this.pos.y -= 0.5;
      },
      DOWN: () => {
        this.pos.y += 0.5;
      },
      SOUTH: () => {
        this.pos.x -= 1;
        this.pos.y += 0.5;
      },
      NORTH: () => {
        this.pos.x += 1;
        this.pos.y -= 0.5;
      },
      EAST: () => {
        this.pos.x += 1;
        this.pos.y += 0.5;
      },
      WEST: () => {
        this.pos.x -= 1;
        this.pos.y -= 0.5;
      },
    };

    animationMap[this.target.direction]?.();

    this.player?.setPos(this.pos);
    this.collectible?.setPos(this.pos);

    if (
      this.target.direction === "DARKER" &&
      this.brightness < this.target.brightness
    ) {
      this.brightness = parseFloat((this.brightness + 0.05).toFixed(2));
    } else if (
      this.target.direction === "BRIGHTER" &&
      this.brightness > this.target.brightness
    ) {
      this.brightness = parseFloat((this.brightness - 0.05).toFixed(2));
    }

    if (
      this.pos.equals(this.target.pos) &&
      this.brightness === this.target.brightness
    ) {
      this.target = null;
    }
  }

  public setPos(pos: Point) {
    this.pos = pos.copy();
    if (this.collectible) this.collectible.setPos(pos);
    if (this.player) this.player.setPos(pos);
  }

  public setTargetPos(pos: Point, direction: string, brightness: number = 0) {
    this.target = { pos, direction, brightness };
  }

  public setIsConnected(isConnected: boolean) {
    this.isConnected = isConnected;
    const pos = this.pos.copy();
    pos.y += isConnected ? -10 : 10;
    this.setTargetPos(pos, isConnected ? "UP" : "DOWN");
  }

  public setCollectible(collectible: Collectible | null) {
    this.collectible = collectible;
    if (this.collectible) this.collectible.setPos(this.pos);
  }

  public setPlayer(player: Player | null) {
    this.player = player;
    if (this.player) this.player.setPos(this.pos);
  }
}

export default Tile;

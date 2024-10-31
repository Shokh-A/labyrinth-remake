import Collectible from "./Collectible";
import GameObject, { DIRECTION } from "./GameObject";
import Point from "./Point";

class Player extends GameObject {
  private frame: number = 0;
  private direction: DIRECTION = DIRECTION.EAST;
  private lastUpdateTime: number = 0;
  private frameDurationInMs: number = 150;
  public collectibles: Collectible[] = [];
  public targetCollectible: Collectible | null = null;

  constructor(
    private name: string,
    pos: Point,
    public imgs: {
      [key: string]: HTMLImageElement;
    }
  ) {
    super(pos, 60, 60);
  }

  getPlayerData() {
    return {
      name: this.name,
      img: this.imgs.SOUTH,
      collectible: {
        img: this.targetCollectible?.img,
        coords: this.targetCollectible?.spriteSheetCoords,
      },
    };
  }

  collectCollectible(collectible: Collectible) {
    collectible.isCollected = true;
    if (!this.allCollectiblesCollected()) {
      this.targetCollectible = this.collectibles.find(
        (c) => !c.isCollected
      ) as Collectible;
    }
  }

  allCollectiblesCollected() {
    return this.collectibles.every((c) => c.isCollected);
  }

  setTargetPos(pos: Point, direction: DIRECTION) {
    const targetPos = new Point(pos.x, pos.y - 10);
    this.target = { pos: targetPos, direction };
  }

  hasTarget() {
    return this.target !== null;
  }

  resetDirectionAndFrame() {
    this.direction = DIRECTION.EAST;
    this.frame = 0;
  }

  update(timestamp: number) {
    if (!this.target) return;

    this.updateFrame(timestamp);
    this.updatePosition();

    if (this.pos.equals(this.target.pos)) {
      this.frame = 0;
      this.target = null;
    }
  }

  private updateFrame(timestamp: number) {
    if (!this.lastUpdateTime) this.lastUpdateTime = timestamp;
    const elapsedTime = timestamp - this.lastUpdateTime;

    if (elapsedTime > this.frameDurationInMs) {
      this.frame = (this.frame + 1) % 4;
      this.lastUpdateTime = timestamp;
    }
  }

  private updatePosition() {
    this.direction =
      this.target!.direction !== DIRECTION.NONE
        ? this.target!.direction
        : this.direction;

    const moveOffset = 1;

    switch (this.target!.direction) {
      case "SOUTH":
        this.pos.x -= moveOffset;
        this.pos.y += moveOffset / 2;
        break;
      case "WEST":
        this.pos.x -= moveOffset;
        this.pos.y -= moveOffset / 2;
        break;
      case "EAST":
        this.pos.x += moveOffset;
        this.pos.y += moveOffset / 2;
        break;
      case "NORTH":
        this.pos.x += moveOffset;
        this.pos.y -= moveOffset / 2;
        break;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const sx = 350 * this.frame;
    const sy = 0;
    const sWidth = 350;
    const sHeight = 350;

    const drawPos = new Point(
      this.pos.x - this.width / 2,
      this.pos.y - this.height / 2
    );

    const img = this.imgs[this.direction];

    ctx.drawImage(
      img,
      sx,
      sy,
      sWidth,
      sHeight,
      drawPos.x,
      drawPos.y,
      this.width,
      this.height
    );
  }
}

export default Player;

import GameObject from "./GameObject";
import Point from "./Point";

class Collectible extends GameObject {
  public isCollected: boolean = false;
  public spriteSheetCoords: { sx: number; sy: number };

  constructor(
    pos: Point,
    collectibleType: number,
    public img: HTMLImageElement
  ) {
    super(pos, 40, 40);
    this.spriteSheetCoords = this.calculateSpriteSheetCoords(collectibleType);
  }

  private calculateSpriteSheetCoords(collectibleType: number) {
    const sRows = 8;
    const sCols = 15;
    const sWidth = 512;
    const sHeight = 512;
    const sx = sWidth * (sCols - 1 - (collectibleType % sCols));
    const sy =
      sHeight * (sRows - 1 - (Math.floor(collectibleType / sCols) % sRows));

    return { sx, sy };
  }

  update(): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const { sx, sy } = this.spriteSheetCoords;
    const sWidth = 512;
    const sHeight = 512;

    const drawPos = new Point(this.pos.x - this.width / 2, this.pos.y - 2);
    ctx.drawImage(
      this.img,
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

export default Collectible;

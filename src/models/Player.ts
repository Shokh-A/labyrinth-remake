import { Point } from "./index";

class Player {
  pos: Point;
  img: HTMLImageElement;

  constructor(pos: Point, img: HTMLImageElement) {
    this.pos = pos;
    this.img = img;
  }

  draw(ctx: CanvasRenderingContext2D, windowSize: number) {
    // const pos = this.isoToScreen(this.pos.x, this.pos.y, windowSize);
    // ctx.drawImage(this.img, pos.x, pos.y);
    const image = new Image();
    image.src = "/sprites/CharacterSheet_CharacterFront.png";

    image.onload = () => {
      // Calculate the x and y position of the current frame in the sprite sheet
      const sx = 105;
      const sy = 15;

      // ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(image, sx, sy, 175, 350, 450 - 35 / 2, 70 / 4, 35, 70);
    };
  }
}

export default Player;

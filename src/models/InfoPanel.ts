import panelBg from "../assets/images/ui/Panel.png";
import headerImg from "../assets/images/ui/Header.png";
import profileBg from "../assets/images/ui/Profile.png";
import itemBg from "../assets/images/ui/Item.png";

interface Item {
  img: HTMLImageElement;
  width: number;
  height: number;
}

class InfoPanel {
  private panel: HTMLImageElement;
  private header: HTMLImageElement;
  private playerBg: HTMLImageElement;
  private collectibleBg: HTMLImageElement;

  constructor() {
    this.panel = new Image();
    this.panel.src = panelBg;

    this.header = new Image();
    this.header.src = headerImg;

    this.playerBg = new Image();
    this.playerBg.src = profileBg;

    this.collectibleBg = new Image();
    this.collectibleBg.src = itemBg;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.panel, 0, 0, ctx.canvas.width, ctx.canvas.height);
    this.drawPlayerInfo(ctx);
    this.drawCollectibleInfo(ctx);
  }

  drawPlayerInfo(ctx: CanvasRenderingContext2D) {
    const width = 200;
    ctx.drawImage(
      this.playerBg,
      ctx.canvas.width / 2 - width / 2,
      30,
      width,
      width
    );

    const width2 = width + 20;
    ctx.drawImage(
      this.header,
      ctx.canvas.width / 2 - width2 / 2,
      230,
      width2,
      width2 / 3.5
    );

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Player Name", ctx.canvas.width / 2, 262);
  }

  drawCollectibleInfo(ctx: CanvasRenderingContext2D) {
    const width = 200;
    ctx.drawImage(
      this.collectibleBg,
      ctx.canvas.width / 2 - width / 2,
      280,
      width,
      width
    );

    const width2 = width + 20;
    ctx.drawImage(
      this.header,
      ctx.canvas.width / 2 - width2 / 2,
      480,
      width2,
      width2 / 3.5
    );

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Objective", ctx.canvas.width / 2, 512);
  }
}

export default InfoPanel;

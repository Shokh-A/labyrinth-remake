import headerImg from "../assets/images/ui/Header.png";
import itemBg from "../assets/images/ui/Item.png";
import profileBg from "../assets/images/ui/Profile.png";

interface PlayerData {
  name: string;
  color: string;
  score: number;
  img: HTMLImageElement;
  collectible: {
    img: HTMLImageElement | undefined;
    coords: { sx: number; sy: number } | undefined;
  };
}

class InfoPanel {
  private header: HTMLImageElement;
  private playerBg: HTMLImageElement;
  private collectibleBg: HTMLImageElement;

  private curPlayerData: PlayerData | null = null;

  constructor() {
    this.header = new Image();
    this.header.src = headerImg;

    this.playerBg = new Image();
    this.playerBg.src = profileBg;

    this.collectibleBg = new Image();
    this.collectibleBg.src = itemBg;
  }

  setPlayerData(playerData: PlayerData) {
    this.curPlayerData = playerData;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

    if (this.curPlayerData && this.curPlayerData.img) {
      ctx.shadowColor = this.curPlayerData.color;
      ctx.shadowBlur = 10;
      ctx.drawImage(
        this.curPlayerData.img,
        0,
        0,
        350,
        350,
        ctx.canvas.width / 2 - 100 / 2,
        30 + 100 / 2,
        100,
        100
      );
      ctx.shadowColor = "transparent";
    }

    const width2 = width + 20;
    ctx.drawImage(
      this.header,
      ctx.canvas.width / 2 - width2 / 2,
      210,
      width2,
      (width2 + 200) / 3.5
    );

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(this.curPlayerData?.name ?? "", ctx.canvas.width / 2, 257);
    ctx.fillText(
      "Score: " + (this.curPlayerData?.score ?? 0).toString(),
      ctx.canvas.width / 2,
      277
    );
  }

  drawCollectibleInfo(ctx: CanvasRenderingContext2D) {
    const width = 200;
    ctx.drawImage(
      this.collectibleBg,
      ctx.canvas.width / 2 - width / 2,
      300,
      width,
      width
    );

    if (
      this.curPlayerData &&
      this.curPlayerData.collectible.img &&
      this.curPlayerData.collectible.coords
    ) {
      const collectibleImg = this.curPlayerData.collectible.img;
      const { sx, sy } = this.curPlayerData.collectible.coords;
      ctx.drawImage(
        collectibleImg,
        sx,
        sy,
        512,
        512,
        ctx.canvas.width / 2 - 100 / 2,
        300 + 100 / 2,
        100,
        100
      );
    }

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

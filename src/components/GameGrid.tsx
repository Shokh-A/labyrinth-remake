import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "../models";

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 600;

interface GameGridProps {
  playerNames: string[];
  numOfCollectibles: number;
}

const GameGrid: React.FC<GameGridProps> = ({
  playerNames,
  numOfCollectibles,
}) => {
  const gameWindowRef = useRef<HTMLCanvasElement | null>(null);
  const infoPanelRef = useRef<HTMLCanvasElement | null>(null);
  const [gameEngine] = useState(new GameEngine(WORLD_WIDTH, WORLD_HEIGHT));

  useEffect(() => {
    const canvas = gameWindowRef.current;
    const ctx = canvas?.getContext("2d");

    const infoCanvas = infoPanelRef.current;
    const infoCtx = infoCanvas?.getContext("2d");

    if (!ctx || !canvas || !infoCtx || !infoCanvas) return;
    gameEngine.start(ctx, infoCtx, playerNames, numOfCollectibles).then(() => {
      gameEngine.drawInfoPanel(infoPanelRef.current?.getContext("2d")!);
    });
  }, [gameEngine]);

  useEffect(() => {
    const canvas = gameWindowRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const handleMouseHover = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      gameEngine.handleMouseHover(ctx, screenX, screenY);
    };

    const handleMouseClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      gameEngine.handleMouseClick(ctx, screenX, screenY);
    };

    canvas.addEventListener("mousemove", handleMouseHover);
    canvas.addEventListener("click", handleMouseClick);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseHover);
      canvas.removeEventListener("click", handleMouseClick);
    };
  }, []);

  // width = rows * Tile.width
  // height = cols * Tile.height + Tile.depth
  return (
    <div className="container">
      <canvas
        id="gameCanvas"
        className="canvas-container"
        ref={gameWindowRef}
        width={WORLD_WIDTH}
        height={WORLD_HEIGHT}
      />
      <canvas
        id="controlCanvas"
        className="canvas-container"
        ref={infoPanelRef}
        height={WORLD_HEIGHT}
      />
    </div>
  );
};

export default GameGrid;

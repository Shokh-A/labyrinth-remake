import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "../models";

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 600;
const TILE_WIDTH = 100;
const TILE_HEIGHT = 50;
const TILE_DEPTH = 10;

const GameGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameEngine] = useState(
    new GameEngine(
      WORLD_WIDTH,
      WORLD_HEIGHT,
      TILE_WIDTH,
      TILE_HEIGHT,
      TILE_DEPTH
    )
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) return;
    // gameEngine.run(ctx);
    gameEngine.start(ctx);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) return;
    // gameEngine.run(ctx);

    const handleMouseHover = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      gameEngine.handleMouseHover(ctx, screenX, screenY);
    };

    canvas.addEventListener("mousemove", handleMouseHover);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseHover);
    };
  }, []);

  // width = rows * Tile.width
  // height = cols * Tile.height + Tile.depth
  return (
    <>
      <canvas ref={canvasRef} width={WORLD_WIDTH} height={WORLD_HEIGHT} />
    </>
  );
};

export default GameGrid;
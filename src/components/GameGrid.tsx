import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "../models";

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 600;
const TILE_WIDTH = 100;
const TILE_DEPTH = 10;
const NUM_OF_PLAYERS = 2;
const NUM_OF_COLLECTIBLES = 1;

const GameGrid: React.FC = () => {
  const gameWindowRef = useRef<HTMLCanvasElement | null>(null);
  const infoPanelRef = useRef<HTMLCanvasElement | null>(null);
  const [gameEngine] = useState(
    new GameEngine(WORLD_WIDTH, WORLD_HEIGHT, TILE_WIDTH, TILE_DEPTH)
  );

  useEffect(() => {
    const canvas = gameWindowRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) return;
    gameEngine.start(ctx, NUM_OF_PLAYERS, NUM_OF_COLLECTIBLES).then(() => {
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

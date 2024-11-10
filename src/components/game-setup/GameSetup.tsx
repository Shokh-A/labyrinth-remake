import React, { useEffect, useState } from "react";
import Button from "../button/Button";
import GameGrid from "../game-grid/GameGrid";
import Input from "../input/Input";
import Modal from "../modal/Modal";
import Select from "../select/Select";
import "./GameSetup.css";

const GameSetup: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [numCollectibles, setNumCollectibles] = useState<number>(2);
  const [collectibleOptions, setCollectibleOptions] = useState([2, 4, 6, 8]);
  const [showNameInputs, setShowNameInputs] = useState<boolean>(false);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [showGameGrid, setShowGameGrid] = useState(false);

  useEffect(() => {
    const maxCollectibles = 24 / numPlayers;
    const options = [];
    for (let i = 2; i <= maxCollectibles; i += 2) {
      options.push(i);
    }
    setCollectibleOptions(options);
    if (numCollectibles > maxCollectibles) setNumCollectibles(options[0]);
  }, [numPlayers]);

  const handleNextClick = () => {
    if (playerNames.length !== numPlayers) {
      setPlayerNames(Array.from({ length: numPlayers }).map(() => ""));
    }
    setShowNameInputs(true);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const startGame = () => {
    setShowGameGrid(true);
  };

  return (
    <>
      {showGameGrid ? (
        <GameGrid
          playerNames={playerNames}
          numOfCollectibles={numCollectibles!}
          onReset={() => {
            setShowGameGrid(false);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <Modal title="Game settings" isOpen={isModalOpen} onClose={() => {}}>
          {!showNameInputs ? (
            <>
              <Select
                label="Select number of players:"
                value={numPlayers}
                options={[2, 3, 4].map((num) => ({
                  label: num.toString(),
                  value: num,
                }))}
                onChange={(value) => setNumPlayers(value as number)}
              />
              <Select
                label="Select number of collectibles per player:"
                value={numCollectibles}
                options={collectibleOptions.map((num) => ({
                  label: num.toString(),
                  value: num,
                }))}
                onChange={(value) => setNumCollectibles(value as number)}
              />
              <div className="button-container">
                <div style={{ flex: 1 }} /> {/* Spacer */}
                <Button
                  label="Next"
                  onClick={handleNextClick}
                  disabled={!numPlayers || !numCollectibles}
                />
              </div>
            </>
          ) : (
            <>
              {Array.from({ length: numPlayers || 0 }).map((_, index) => (
                <Input
                  key={index}
                  label={`Player ${index + 1} name:`}
                  placeholder="Enter player name"
                  type="text"
                  value={playerNames[index] || ""}
                  onChange={(e) =>
                    handlePlayerNameChange(index, e.target.value)
                  }
                />
              ))}
              <div className="button-container">
                <Button label="Back" onClick={() => setShowNameInputs(false)} />
                <Button
                  label="Start game"
                  onClick={() => {
                    startGame();
                    closeModal();
                  }}
                />
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
};

export default GameSetup;

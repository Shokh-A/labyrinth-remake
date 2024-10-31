import React, { useEffect, useState } from "react";
import "./GameSetup.css";
import InputField from "./InputField";
import GameGrid from "./GameGrid";

const GameSetup: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [numCollectibles, setNumCollectibles] = useState<number>();
  const [showNameInputs, setShowNameInputs] = useState<boolean>(false);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [collectibleOptions, setCollectibleOptions] = useState([2, 4, 6, 8]);
  const [showGameGrid, setShowGameGrid] = useState(false); // Track if GameGrid should be shown

  useEffect(() => {
    const maxCollectibles = 24 / numPlayers;
    const options = [];
    for (let i = 2; i <= maxCollectibles; i += 2) {
      options.push(i);
    }
    setCollectibleOptions(options);
    setNumCollectibles(options[0]);
  }, [numPlayers]);

  const handleNextClick = () => {
    setPlayerNames(Array(numPlayers).fill(""));
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

  // Handler to start the game and show GameGrid
  const startGame = () => {
    setShowGameGrid(true); // Show GameGrid component
  };

  return (
    <>
      {showGameGrid ? (
        // Render GameGrid with selected settings
        <GameGrid
          playerNames={playerNames}
          numOfCollectibles={numCollectibles!}
        />
      ) : (
        isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-button" onClick={closeModal}>
                &times;
              </button>
              <h3>Game Settings</h3>
              {!showNameInputs ? (
                <>
                  <label>
                    {"Select number of players: "}
                    <select
                      value={numPlayers}
                      onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {[2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </label>
                  <br />
                  <label>
                    {"Select number of collectibles per player: "}
                    <select
                      value={numCollectibles}
                      onChange={(e) =>
                        setNumCollectibles(parseInt(e.target.value))
                      }
                      className="input-field"
                    >
                      {collectibleOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <br />
                  <div className="button-container">
                    <div style={{ flex: 1 }} /> {/* Spacer */}
                    <button
                      className="next-button"
                      onClick={handleNextClick}
                      disabled={!numPlayers || !numCollectibles}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {Array.from({ length: numPlayers || 0 }).map((_, index) => (
                    <InputField
                      key={index}
                      label={`Player ${index + 1} name:`}
                      placeholder="Enter player name"
                      type="text"
                      value={playerNames[index] || ""}
                      onChange={(e) =>
                        handlePlayerNameChange(index, e.target.value)
                      }
                      className="input-field"
                    />
                  ))}
                  <br />
                  <div className="button-container">
                    <button
                      onClick={() => setShowNameInputs(false)}
                      className="back-button"
                    >
                      Back
                    </button>
                    <button
                      onClick={startGame} // Start the game on button click
                      className="next-button"
                    >
                      Start Game
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      )}
    </>
  );
};

export default GameSetup;

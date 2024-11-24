import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Button from "../button/Button";
import Modal from "../modal/Modal";
import SelectButton from "../select-button/SelectButton";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import "./GameSetup.css";
import Input from "../input/Input";
import GameGrid from "../game-grid/GameGrid";
import { nanoid } from "nanoid";

const GameSetup: React.FC = () => {
  const swiperRef = useRef<any>(null);
  const [isLocal, setIsLocal] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [numPlayers, setNumPlayers] = useState<number>();
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [numCollectibles, setNumCollectibles] = useState<number>();
  const [collectibleOptions, setCollectibleOptions] = useState([
    2, 4, 6, 8, 10, 12,
  ]);
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    if (!numPlayers) return;
    const maxCollectibles = 24 / numPlayers;
    const options = [];
    for (let i = 2; i <= maxCollectibles; i += 2) {
      options.push(i);
    }
    setCollectibleOptions(options);

    if (numCollectibles && numCollectibles > maxCollectibles) {
      setNumCollectibles(undefined);
    }

    if (playerNames.length !== numPlayers) {
      setPlayerNames(Array.from({ length: numPlayers }).map(() => ""));
    }
  }, [numPlayers]);

  const handleLocalClick = () => {
    setIsLocal(true);
    swiperRef.current.swiper.slideNext();
  };

  const handleOnlineClick = () => {
    setIsLocal(false);
    swiperRef.current.swiper.slideNext();
  };

  const handleNextClick = () => {
    swiperRef.current.swiper.slideNext();
  };

  const handleBackClick = () => {
    swiperRef.current.swiper.slidePrev();
  };

  const handleStartClick = () => {
    setIsModalOpen(false);
  };

  const handleCreateRoomClick = () => {
    const roomId = nanoid(10);
    setRoomId(roomId);
    swiperRef.current.swiper.slideNext();
  };

  const handleJoinRoomClick = () => {
    // Join room
  };

  return (
    <>
      {!isModalOpen && numCollectibles && (
        <GameGrid
          playerNames={playerNames}
          numOfCollectibles={numCollectibles}
          onReset={() => setIsModalOpen(true)}
        />
      )}
      <Modal title="Game settings" isOpen={isModalOpen} onClose={() => {}}>
        <Swiper
          ref={swiperRef}
          autoHeight={true}
          allowTouchMove={false}
          spaceBetween={50}
          slidesPerView={1}
        >
          <SwiperSlide>
            <div className="local-online-container">
              <Button label="Local" onClick={handleLocalClick} />
              <Button label="Online" onClick={handleOnlineClick} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {isLocal ? (
              <>
                <SelectButton
                  label="Select number of players:"
                  options={["2", "3", "4"]}
                  value={numPlayers?.toString()}
                  onSelect={(value: string) => setNumPlayers(parseInt(value))}
                />
                <SelectButton
                  label="Select number of collectibles per player:"
                  options={collectibleOptions.map((option) =>
                    option.toString()
                  )}
                  value={numCollectibles?.toString()}
                  onSelect={(value: string) =>
                    setNumCollectibles(parseInt(value))
                  }
                />
              </>
            ) : (
              <div>
                <Input
                  placeholder="Enter your name..."
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const curPlayerName = event.target.value;
                    setPlayerNames((prev) => {
                      const newPlayerNames = [...prev];
                      newPlayerNames[0] = curPlayerName;
                      return newPlayerNames;
                    });
                  }}
                />

                <Input
                  // value=""
                  placeholder="Enter room ID..."
                  onChange={handleJoinRoomClick}
                />
                <Button label="Join" onClick={() => {}} float="right" />
                <Button label="New room" onClick={handleCreateRoomClick} />
              </div>
            )}
            <div className="button-container">
              <Button label="Back" onClick={handleBackClick} />
              {isLocal && (
                <Button
                  label="Next"
                  disabled={!numPlayers || !numCollectibles}
                  onClick={handleNextClick}
                />
              )}
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {isLocal ? (
              <div className="player-name-inputs">
                {playerNames.map((name, index) => (
                  <Input
                    key={index}
                    label={`Player #${index + 1} name:`}
                    placeholder="Enter player name..."
                    value={name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setPlayerNames((prev) => {
                        const newPlayerNames = [...prev];
                        newPlayerNames[index] = event.target.value;
                        return newPlayerNames;
                      });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div>
                <p>Room id: {roomId}</p>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerNames.map((name, index) => (
                      <tr>
                        <td>{index + 1}</td>
                        <td>{name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="button-container">
              <Button label="Back" onClick={handleBackClick} />
              <Button
                label="Start"
                disabled={!numPlayers || !numCollectibles}
                onClick={handleStartClick}
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </Modal>
    </>
  );
};

export default GameSetup;

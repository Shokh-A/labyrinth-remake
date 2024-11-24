import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Button from "../button/Button";
import Modal from "../modal/Modal";
import SelectButton from "../select-button/SelectButton";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import "./GameSetup.css";
import Input from "../input/Input";
import GameGrid from "../game-grid/GameGrid";

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
                <Button label="Generate invite ID" onClick={() => {}} />
              </div>
            )}
            <div className="button-container">
              <Button label="Back" onClick={handleBackClick} />
              <Button
                label="Next"
                disabled={!numPlayers || !numCollectibles}
                onClick={handleNextClick}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
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
            <div className="button-container">
              <Button label="Back" onClick={handleBackClick} />
              <Button
                label="Start"
                disabled={!numPlayers || !numCollectibles}
                onClick={handleStartClick}
              />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div>Online game setup</div>
          </SwiperSlide>
        </Swiper>
      </Modal>
    </>
  );
};

export default GameSetup;

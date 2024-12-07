import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { socket } from "../../socket";
import Button from "../button/Button";
import Input from "../input/Input";
import Modal from "../modal/Modal";
import SelectButton from "../select-button/SelectButton";
import "./GameSetup.css";

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
  const [error, setError] = useState<string>("");

  useEffect(() => {
    socket.on("error", (res) => {
      console.log("Error:", res.message);
      setError(res.message);
    });

    socket.on("playerJoined", (response) => {
      console.log("Player joined:", response.players);
      setPlayerNames(
        response.players.map((player: { name: string }) => player.name)
      );
    });

    socket.on("playerLeft", (response) => {
      console.log("Player left:", response.players);
      setPlayerNames(
        response.players.map((player: { name: string }) => player.name)
      );
    });
  }, []);

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
    socket.disconnect();
    swiperRef.current.swiper.slideNext();
  };

  const handleOnlineClick = () => {
    setIsLocal(false);
    socket.connect();
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
    socket
      .timeout(5000)
      .emit(
        "createRoom",
        { name: playerNames[0] },
        (err: Error, response: { message: string; roomId: string }) => {
          if (err) {
            console.error("Error creating room:", err.message);
            setRoomId("");
          } else {
            console.log("Room created with ID:", response.roomId);
            setRoomId(response.roomId);
          }
        }
      );

    swiperRef.current.swiper.slideNext();
  };

  const handleJoinRoomClick = () => {
    socket.timeout(5000).emit(
      "joinRoom",
      {
        roomId: roomId,
        player: { name: playerNames[0] },
      },
      (err: Error, response: { message: string }) => {
        if (err) {
          setError(err.message);
        } else {
          console.log("Joined room:", roomId);
          setError("");
          swiperRef.current.swiper.slideNext();
        }
      }
    );
  };

  return (
    <>
      {!isModalOpen && numCollectibles && (
        <h1>Game started!</h1>
        // <GameGrid
        //   playerNames={playerNames}
        //   numOfCollectibles={numCollectibles}
        //   onReset={() => setIsModalOpen(true)}
        // />
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
                  options={[2, 3, 4].map((option) => ({
                    label: option.toString(),
                    value: option,
                  }))}
                  value={numPlayers}
                  onSelect={(option) => setNumPlayers(option)}
                />
                <SelectButton
                  label="Select number of collectibles per player:"
                  options={collectibleOptions.map((option) => ({
                    label: option.toString(),
                    value: option,
                  }))}
                  value={numCollectibles}
                  onSelect={(option) => setNumCollectibles(option)}
                />
              </>
            ) : (
              <div>
                <Input
                  placeholder="Enter your name..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const curPlayerName = e.target.value;
                    setPlayerNames((prev) => {
                      const newPlayerNames = [...prev];
                      newPlayerNames[0] = curPlayerName;
                      return newPlayerNames;
                    });
                  }}
                />

                <Input
                  value={roomId}
                  placeholder="Enter room ID..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setRoomId(e.target.value)
                  }
                />
                <Button
                  label="Join"
                  disabled={
                    !roomId ||
                    playerNames.length === 0 ||
                    playerNames.some((name) => !name)
                  }
                  onClick={handleJoinRoomClick}
                  float="right"
                />
              </div>
            )}
            <div className="button-container">
              <Button label="Back" onClick={handleBackClick} />
              {isLocal ? (
                <Button
                  label="Next"
                  disabled={!numPlayers || !numCollectibles}
                  onClick={handleNextClick}
                />
              ) : (
                <Button
                  label="New room"
                  disabled={
                    playerNames.length === 0 ||
                    playerNames.some((name) => !name)
                  }
                  onClick={handleCreateRoomClick}
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setPlayerNames((prev) => {
                        const newPlayerNames = [...prev];
                        newPlayerNames[index] = e.target.value;
                        return newPlayerNames;
                      });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div>
                <h4>Room ID: {roomId}</h4>
                <table className="players-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((_, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{playerNames[index]}</td>
                        <td>Not ready</td>
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
                disabled={
                  !numPlayers ||
                  !numCollectibles ||
                  playerNames.some((name) => !name)
                }
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

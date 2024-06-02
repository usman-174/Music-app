import React, { useEffect, useRef, useState } from "react";

import { FaMusic, FaVolumeUp } from "react-icons/fa";
import { HiChevronLeft, HiChevronRight, HiPause, HiPlay } from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import { useAuthStore, useSocketStore } from "../../store/store";
import { initialPlaylist } from "./musicState";
import LoadingSkeleton from "../layout/LoadingSkeleton";

const MusicPlayer = ({ chat, joined }) => {
  const { socket } = useSocketStore();
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get("channelId");

  const { user } = useAuthStore();
  const admin = user.id === chat?.admin.id ? user : null;

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      if (admin) {
        console.log("Emiting Pause");
        socket.emit("Pause", { channelId });
      }
    } else {
      audioRef.current.play();
      if (admin) {
        console.log("Emiting Play");

        socket.emit("Play", { channelId });
      }
    }
    setIsPlaying((x) => !x);
  };

  const handleVolumeChange = (event) => {
    audioRef.current.volume = event.target.value;
    setVolume(event.target.value);
    // socket.emit("setVolume", { volume: event.target.value, channelId });
  };

  const changeSong = (index) => {
    setCurrentTime(0);
    setCurrentSongIndex(index);
    setSeekTime(0);

    setIsPlaying(false);
    if (admin) {
      socket.emit("setAudio", { currentSongIndex: index, channelId });
    }
  };

  const playNextSong = () => {
    const nextIndex = (currentSongIndex + 1) % initialPlaylist.length;
    changeSong(nextIndex);
  };

  const playPreviousSong = () => {
    const previousIndex =
      currentSongIndex === 0
        ? initialPlaylist.length - 1
        : currentSongIndex - 1;
    changeSong(previousIndex);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  const [seekTime, setSeekTime] = useState(0); // New state for seek time

  // Function to handle seeking the playback position
  const handleSeek = (event) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    setSeekTime(newTime);
    if (admin) {
      socket.emit("setAudioTime", { channelId, newTime });
    }
  };

  useEffect(() => {
    // audioRef.current = new Audio();
    audioRef.current.src = initialPlaylist[currentSongIndex].url;
    audioRef.current.load();
    audioRef.current.volume = 1; // Set the initial volume here

    audioRef.current.onloadedmetadata = () => {
      setAudioDuration(audioRef.current.duration);
    };

    audioRef.current.addEventListener("ended", togglePlayPause);

    audioRef.current.addEventListener("timeupdate", () => {
      if (currentTime > audioRef.current.currentTime) {
        setCurrentTime(currentTime);
        audioRef.current.currentTime = currentTime;
      } else {
        setCurrentTime(audioRef.current.currentTime);
        setSeekTime(audioRef.current.currentTime); // Update seek time
      }

      setAudioDuration(audioRef.current.duration);
    });

    if (isPlaying) {
      audioRef.current.play();
    }

    return () => {
      audioRef.current.pause();
      audioRef.current.removeEventListener("timeupdate", () => {});
    };
    // eslint-disable-next-line
  }, [currentSongIndex]);

  useEffect(() => {
    const handlePauseMusic = (data) => {
      console.log("Listened Pause");
      if (
        data.channelId === channelId &&
        audioRef.current &&
        audioRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    socket.on("listenPause", handlePauseMusic);

    const handlePlayMusic = (data) => {
      console.log("Listened Play");

      if (
        data.channelId === channelId &&
        audioRef.current &&
        audioRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      }
    };

    socket.on("listenPlay", handlePlayMusic);

    //listenSetAudioTime
    const handleSetAudiTime = ({ newTime, channelId: comingChannelId }) => {
      comingChannelId === channelId &&
        handleSeek({ target: { value: newTime } });
    };
    socket.on("listenSetAudioTime", handleSetAudiTime);

    const handleSwitchAudio = ({
      currentSongIndex,
      channelId: comingChannelId,
    }) => {
      if (channelId === comingChannelId) {
        setCurrentSongIndex(currentSongIndex);
        setCurrentTime(0);
        setIsPlaying(false);
      }
    };
    socket.on("listenSetAudio", handleSwitchAudio);

    // const handleSetVolume = ({ volume }) => {
    //   if (
    //     audioRef.current &&
    //     audioRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    //   ) {
    //     audioRef.current.volume = volume;
    //   }
    //   setVolume(volume);
    // };
    // socket.on("listenSetVolume", handleSetVolume);

    const handleSetAudio = async (data) => {
      if (data.channelId) {
        setCurrentSongIndex(data.currentSongIndex);

        // audioRef.current.volume = data.volume;
        audioRef.current.currentTime = data.currentTime;
        // setVolume(data.volume);
        setCurrentTime(data.currentTime);
        setTimeout(function () {}, 200);
        if (data.isPlaying) {
          try {
            setIsPlaying(true);
            await audioRef.current.play();
          } catch (error) {
            // setError(error.message);
          }
        }
      }
    };
    socket.on("listenSendAudio", handleSetAudio);
    const handleResetAudio = (data) => {
      if (data.channelId === channelId) {
        setCurrentSongIndex(0);

        // audioRef.current.volume = data.volume;
        audioRef.current.currentTime = 0;
        // setVolume(data.volume);
        setCurrentTime(0);
        setIsPlaying(false);
        setTimeout(function () {}, 200);
        audioRef.current.pause();
      }
    };
    socket.on("listenResetAudio", handleResetAudio);
    return () => {
      // Clean up socket event listeners when the component unmounts
      socket.off("listenPause", handlePauseMusic);
      socket.off("listenPlay", handlePlayMusic);
      socket.off("listenSetAudio", handleSwitchAudio);
      // socket.off("listenSetVolume", handleSetVolume);
      socket.off("listenSendAudio", handleSetAudio);
      socket.off("listenResetAudio", handleResetAudio);
    };
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (admin) {
      socket.emit("sendAudio", {
        channelId,
        currentSongIndex,
        currentTime: audioRef.current.currentTime,
        isPlaying,
        volume: audioRef.current.volume,
      });
    }
    // eslint-disable-next-line
  }, [joined]);
  useEffect(() => {
    if (audioRef.current.readyState >= 3) {
      setCurrentSongIndex(0);

      // audioRef.current.volume = data.volume;
      audioRef.current.currentTime = 0;
      // setVolume(data.volume);
      setCurrentTime(0);
      setIsPlaying(false);
      setTimeout(function () {}, 200);
      audioRef.current.pause();
    }
    // eslint-disable-next-line
  }, [channelId]);
  return (
    <div className="px-2 ">
      {audioRef?.current?.readyState ? (
        <div className=" flex flex-row items-center justify-around gap-1 md:block">
          <audio style={{ width: "100%" }} autoPlay={false}>
            Your browser does not support the audio element.
          </audio>

          <h2
            className="px-2 text-center text-md font-bold md:text-xl justify-center
           mx-auto flex items-center"
          >
            <FaMusic className="mr-2" />{" "}
            {initialPlaylist[currentSongIndex].title}
          </h2>

          <div className="flex items-center justify-between">
            {admin ? (
              <button
                onClick={playPreviousSong}
                disabled={!admin}
                className="text-2xl text-blue-500 hover:text-black"
              >
                <HiChevronLeft />
              </button>
            ) : null}

            <center className="mx-auto flex items-center justify-around gap-1 my-1">
              <button
                onClick={togglePlayPause}
                disabled={!admin}
                className="text-2xl  mx-auto text-center icon"
              >
                {isPlaying ? (
                  <HiPause className="icon" />
                ) : (
                  <HiPlay className="icon" />
                )}
              </button>
              <div className=" text-center text-xs">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-0.5">/</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
            </center>

            {admin ? (
              <button
                onClick={playNextSong}
                disabled={!admin}
                className="text-2xl text-blue-500 hover:text-black"
              >
                <HiChevronRight />
              </button>
            ) : null}
          </div>

          <div className="flex flex-row  my-2 gap-2  justify-around md:justify-center items-center w-full">
            <div className="my-2">
              {/* Playback position slider */}
              <input
                type="range"
                min="0"
                disabled={!admin}
                max={audioDuration}
                step="0.00001"
                value={seekTime}
                onChange={handleSeek}
                className="w-full h-2 mx-auto   bg-blue-200 text-center block"
              />
            </div>

            <div className="flex w-[25%] sm:w-[12%] md:w-[20%] items-center gap-1 text-sm">
              <FaVolumeUp
                onClick={() => {
                  if (!admin) return;
                  if (volume === 0) {
                    handleVolumeChange({ target: { value: 1 } });
                    return;
                  }
                  handleVolumeChange({ target: { value: 0 } });
                }}
                className="block"
              />

              <input
                type="range"
                min="0"
                max="1"
                step="0.025"
                value={volume}
                onChange={handleVolumeChange}
                className="w-32 h-2 bg-blue-200 text-center block"
              />
            </div>
          </div>
        </div>
      ) : (
        <LoadingSkeleton passCount={2} className={"w-32"} />
      )}
    </div>
  );
};

export default MusicPlayer;

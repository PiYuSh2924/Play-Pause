"use client"

import { Song } from "@/types";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { TbRepeat, TbRepeatOnce } from "react-icons/tb";
import Slider from "./Slider";
import usePlayer from "@/hooks/usePlayer";
import { useState, useEffect, useRef } from "react";
import useSound from "use-sound"

interface PlayerContentProps {
    song: Song;
    songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({
    song,
    songUrl
}) => {
    const player = usePlayer();
    const [volume, setVolume] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const songInfoRef = useRef<HTMLDivElement>(null);

    const Icon = isPlaying ? BsPauseFill : BsPlayFill;
    const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;
    const RepeatIcon = isLooping ? TbRepeatOnce : TbRepeat;

    useEffect(() => {
        const checkOverflow = () => {
            if (songInfoRef.current) {
                const songInfoContainer = songInfoRef.current.querySelector('.song-info-container');
                const songInfo = songInfoRef.current.querySelector('.song-info');
                if (songInfoContainer && songInfo) {
                    const isOverflowing = songInfo.scrollWidth > songInfoContainer.clientWidth;
                    setIsOverflowing(isOverflowing);
                }
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => window.removeEventListener('resize', checkOverflow);
    }, [song]);

    const onPlayNext = () => {
        if (player.ids.length === 0) {
            return;
        }

        const currentIndex = player.ids.findIndex((id) => id === player.activeId)
        const nextSong = player.ids[currentIndex + 1]

        if (!nextSong) {
            return player.setId(player.ids[0])
        }

        player.setId(nextSong);
    }

    const onPlayPrev = () => {
        if (player.ids.length === 0) {
            return;
        }

        const currentIndex = player.ids.findIndex((id) => id === player.activeId)
        const prevSong = player.ids[currentIndex - 1]

        if (!prevSong) {
            return player.setId(player.ids[player.ids.length - 1])
        }

        player.setId(prevSong);
    }

    const [play, { pause, sound }] = useSound(
        songUrl,
        {
            volume: volume,
            onplay: () => setIsPlaying(true),
            onend: () => {
                setIsPlaying(false);
                if (isLooping) {
                    play();
                } else {
                    onPlayNext();
                }
            },
            onpause: () => setIsPlaying(false),
            format: ['mp3'],
            loop: isLooping
        }
    )

    useEffect(() => {
        sound?.play();

        return () => {
            sound?.unload();
        }
    }, [sound])

    const handlePlay = () => {
        if (!isPlaying) {
            play();
        } else {
            pause();
        }
    }

    const toggleMute = () => {
        if (volume === 0) {
            setVolume(1);
        } else {
            setVolume(0);
        }
    }

    const toggleLoop = () => {
        setIsLooping(!isLooping);
        if (sound) {
            sound.loop(!isLooping);
        }
    }

    return (
        <div className="grid grid-cols-5 md:grid-cols-3 h-full">
            <div className="col-span-4 md:col-span-1 flex w-full justify-start items-center">
                <div className={`w-full ${isOverflowing ? 'overflow' : ''}`} ref={songInfoRef}>
                    <MediaItem data={song} useAnimation={true} />
                </div>
            </div>

            <div className="col-span-1 md:col-span-1 flex justify-end items-center md:justify-center">
                <div className="flex items-center gap-x-2 md:gap-x-4">
                    <LikeButton songId={song.id} />
                    <div className="hidden md:flex items-center gap-x-2">
                        <AiFillStepBackward
                            onClick={onPlayPrev}
                            size={24}
                            className="text-neutral-400 cursor-pointer hover:text-white transition"
                        />
                    </div>
                    <div
                        onClick={handlePlay}
                        className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full bg-white p-1 cursor-pointer"
                    >
                        <Icon size={24} className="text-black" />
                    </div>
                    <div className="hidden md:flex items-center">
                        <AiFillStepForward
                            onClick={onPlayNext}
                            size={24}
                            className="text-neutral-400 cursor-pointer hover:text-white transition"
                        />
                    </div>
                    <div className="hidden md:flex items-center">
                        <RepeatIcon
                            onClick={toggleLoop}
                            size={24}
                            className={`cursor-pointer transition ${isLooping ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}
                        />
                    </div>
                </div>
            </div>

            <div className="hidden md:flex md:col-span-1 w-full justify-end items-center">
                <div className="flex items-center gap-x-2 w-[120px]">
                    <VolumeIcon
                        onClick={toggleMute}
                        className="cursor-pointer"
                        size={24}
                    />
                    <Slider
                        value={volume}
                        onChange={(value) => setVolume(value)}
                    />
                </div>
            </div>
        </div>
    );
}

export default PlayerContent;
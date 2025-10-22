

"use client";

import { useMusic } from "@/hooks/use-music";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Heart } from "lucide-react";
import { ListMusic } from "lucide-react";
import { Pause } from "lucide-react";
import { Play } from "lucide-react";
import { Repeat } from "lucide-react";
import { Repeat1 } from "lucide-react";
import { Shuffle } from "lucide-react";
import { SkipBack } from "lucide-react";
import { SkipForward } from "lucide-react";
import { Volume1 } from "lucide-react";
import { Volume2 } from "lucide-react";
import { VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { albums } from "@/lib/audio-data";
import Image from "next/image";

export function FullScreenPlayer() {
  const {
    isFullScreenPlayerOpen,
    setIsFullScreenPlayerOpen,
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    loop,
    toggleLoop,
    shuffle,
    toggleShuffle,
    progress,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    favoriteSongIds,
    toggleFavorite,
    setIsQueueOpen,
  } = useMusic();

  if (!currentSong) return null;

  const handleSeekSliderChange = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeSliderChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-5 w-5" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="h-5 w-5" />;
    }
    return <Volume2 className="h-5 w-5" />;
  };

  const isCurrentSongFavorite = favoriteSongIds.includes(currentSong.id);
  const currentAlbum = albums.find(a => a.name === currentSong.album);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background transition-transform duration-300 ease-in-out",
        isFullScreenPlayerOpen
          ? "translate-y-0"
          : "translate-y-full"
      )}
    >
      <div className="container mx-auto flex h-full flex-col justify-between p-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreenPlayerOpen(false)}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
          <h2 className="font-semibold uppercase text-sm">Now Playing</h2>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 text-muted-foreground hover:text-primary", isCurrentSongFavorite && "text-primary")} onClick={() => toggleFavorite(currentSong.id)}
            >
              <Heart className={cn("h-5 w-5", isCurrentSongFavorite && "fill-current")}/>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsQueueOpen(true)}>
              <ListMusic className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-xs aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden group">
            {currentAlbum && currentAlbum.imageUrl ? (
                <Image src={currentAlbum.imageUrl} alt={currentAlbum.name} fill style={{objectFit: "cover"}} />
            ) : (
                <ListMusic className="w-24 h-24 text-muted-foreground" />
            )}
          </div>
          <div className="text-center w-full">
            <h1 className="text-2xl font-bold truncate">{currentSong.name}</h1>
            <p className="text-muted-foreground">{currentSong.artist}</p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto flex flex-col gap-4">
           <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(progress)}
                </span>
                <Slider
                  value={[progress]}
                  max={duration || 100}
                  onValueChange={handleSeekSliderChange}
                />
                <span className="text-xs text-muted-foreground w-10 text-left">
                  {formatTime(duration)}
                </span>
              </div>
          <div className="flex justify-between items-center">
             <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={cn("h-12 w-12", { "text-primary": shuffle })}
              >
                <Shuffle className="h-6 w-6" />
              </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={playPrevious}>
              <SkipBack className="h-8 w-8" />
            </Button>
            <Button size="icon" className="w-16 h-16" onClick={togglePlayPause}>
              {isPlaying ? (
                <Pause className="h-10 w-10" />
              ) : (
                <Play className="h-10 w-10 fill-current" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={playNext}>
              <SkipForward className="h-8 w-8" />
            </Button>
             <Button
                variant="ghost"
                size="icon"
                onClick={toggleLoop}
                className={cn("h-12 w-12", { "text-primary": loop !== 'off' })}
              >
                {loop === 'one' ? <Repeat1 className="h-6 w-6" /> : <Repeat className="h-6 w-6" />}
              </Button>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 w-full max-w-xs">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={toggleMute}
              >
                {getVolumeIcon()}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeSliderChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

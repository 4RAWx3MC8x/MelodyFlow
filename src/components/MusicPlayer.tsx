

"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { Pause } from "lucide-react";
import { SkipBack } from "lucide-react";
import { SkipForward } from "lucide-react";
import { Repeat } from "lucide-react";
import { Shuffle } from "lucide-react";
import { Repeat1 } from "lucide-react";
import { ListMusic } from "lucide-react";
import { Volume2 } from "lucide-react";
import { VolumeX } from "lucide-react";
import { Volume1 } from "lucide-react";
import { Heart } from "lucide-react";

import { useMusic } from "@/hooks/use-music";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { FullScreenPlayer } from "./FullScreenPlayer";
import { albums } from "@/lib/audio-data";
import { QueueSidebar } from "./QueueSidebar";

export function MusicPlayer() {
  const {
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
    isFullScreenPlayerOpen,
    setIsFullScreenPlayerOpen,
    setIsQueueOpen,
  } = useMusic();
 
  const handleSeekSliderChange = (value: number[]) => {
    if (currentSong) {
      seek(value[0]);
    }
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

  const isCurrentSongFavorite = currentSong ? favoriteSongIds.includes(currentSong.id) : false;
  const currentAlbum = currentSong ? albums.find(a => a.name === currentSong.album) : null;
  
  if (!currentSong) {
    return null; // Don't render the player if no song is selected
  }

  return (
    <>
      {/* Desktop Player */}
      <Card className="fixed bottom-0 left-0 right-0 z-20 hidden w-full border-t bg-background/95 backdrop-blur-sm rounded-t-lg rounded-b-none md:grid">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-[auto,1fr,auto] items-center h-24">
            <div className="flex items-center gap-3 overflow-hidden max-w-[200px] md:max-w-[300px]">
              <div className="w-14 h-14 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
                {currentAlbum && currentAlbum.imageUrl ? (
                  <Image src={currentAlbum.imageUrl} alt={currentAlbum.name} fill style={{objectFit: "cover"}}/>
                ) : (
                  <ListMusic className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="truncate">
                <p className="font-semibold text-sm truncate">
                  {currentSong?.name || "No song selected"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
              {currentSong && (
                  <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-muted-foreground hover:text-primary", isCurrentSongFavorite && "text-primary")} onClick={() => toggleFavorite(currentSong.id)}>
                      <Heart className={cn("h-5 w-5", isCurrentSongFavorite && "fill-current")}/>
                  </Button>
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-2 w-full max-w-xl mx-auto">
              <div className="flex items-center gap-1 sm:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleShuffle}
                  disabled={!currentSong}
                  className={cn("h-10 w-10", {"text-primary": shuffle})}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playPrevious}
                  disabled={!currentSong}
                  className="h-10 w-10"
                >
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  onClick={togglePlayPause}
                  disabled={!currentSong}
                  className="w-12 h-12"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 fill-current" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playNext}
                  disabled={!currentSong}
                  className="h-10 w-10"
                >
                  <SkipForward className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLoop}
                  disabled={!currentSong}
                  className={cn("h-10 w-10", {"text-primary": loop !== 'off'})}
                >
                  {loop === 'one' ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
                </Button>
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(progress)}
                </span>
                <Slider
                  value={[progress]}
                  max={duration || 100}
                  onValueChange={handleSeekSliderChange}
                  disabled={!currentSong}
                />
                <span className="text-xs text-muted-foreground w-10 text-left">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setIsQueueOpen(true)}
                >
                  <ListMusic className="h-5 w-5" />
                </Button>
              <div className="flex items-center gap-2 w-24 sm:w-32">
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
      </Card>
      
      {/* Mobile Player */}
       <div className="fixed bottom-0 left-0 right-0 z-20 w-full md:hidden" onClick={() => setIsFullScreenPlayerOpen(true)}>
            <div className="w-full bg-chip p-2 shadow-lg rounded-t-lg">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
                        {currentAlbum && currentAlbum.imageUrl ? (
                          <Image src={currentAlbum.imageUrl} alt={currentAlbum.name} fill style={{objectFit: "cover"}}/>
                        ) : (
                          <ListMusic className="w-6 h-6 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 truncate">
                        <p className="font-semibold text-sm truncate">{currentSong.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
                    </div>
                    <div className="flex items-center gap-0.5 px-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={(e) => { e.stopPropagation(); playPrevious(); }}>
                            <SkipBack className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}>
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={(e) => { e.stopPropagation(); playNext(); }}>
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                 <div className="absolute bottom-0 left-0 right-0 h-1 px-2 pb-0.5">
                    <div className="bg-secondary h-0.5 rounded-full w-full">
                        <div className="bg-primary h-0.5 rounded-full" style={{ width: `${(progress / duration) * 100}%` }}></div>
                    </div>
                </div>
            </div>
       </div>

      <FullScreenPlayer />
      <QueueSidebar />
    </>
  );
}

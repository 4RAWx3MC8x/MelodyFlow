
"use client";

import { useMusic } from "@/hooks/use-music";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { albums } from "@/lib/audio-data";
import { cn } from "@/lib/utils";
import { Music } from "lucide-react";

export function QueueSidebar() {
  const {
    isQueueOpen,
    setIsQueueOpen,
    playQueue,
    currentSong,
    playSong,
    isPlaying,
  } = useMusic();

  return (
    <Sheet open={isQueueOpen} onOpenChange={setIsQueueOpen}>
      <SheetContent className="w-full sm:max-w-[245px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Up Next</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="flex flex-col">
            {currentSong && (
                <div
                    className={cn(
                        "flex items-center gap-3 p-2 h-[53px] transition-colors bg-primary/10 border-b"
                    )}
                >
                    <div className="w-[34px] h-[34px] bg-muted rounded-md flex-shrink-0 relative">
                        {isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md z-10">
                               <img alt="Playing" width="12" height="12" src="/assets/equalizer-white-29f31645.gif" />
                            </div>
                        )}
                        {albums.find(a => a.name === currentSong.album)?.imageUrl ? (
                            <Image src={albums.find(a => a.name === currentSong.album)!.imageUrl} alt={currentSong.name} layout="fill" objectFit="cover" className="rounded-md" />
                        ) : <Music className="w-5 h-5 text-muted-foreground m-auto"/>}
                    </div>
                    <div className="flex-1 truncate">
                        <p className="font-semibold text-sm truncate">{currentSong.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
                    </div>
                </div>
            )}
            {playQueue.slice(0, 50).map((song) => {
              const album = albums.find(a => a.name === song.album);
              return (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-2 h-[53px] hover:bg-accent cursor-pointer border-b"
                  onClick={() => playSong(song.id)}
                >
                  <div className="w-[34px] h-[34px] bg-muted rounded-md flex-shrink-0 relative">
                     {album?.imageUrl ? (
                            <Image src={album.imageUrl} alt={song.name} layout="fill" objectFit="cover" className="rounded-md" />
                        ) : <Music className="w-5 h-5 text-muted-foreground m-auto"/>}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-sm truncate">{song.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

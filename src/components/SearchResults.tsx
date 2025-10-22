
"use client";

import { useMusic } from "@/hooks/use-music";
import { useMemo } from "react";
import Image from "next/image";
import { Album, Music, User } from "lucide-react";

type SearchResultsProps = {
  searchTerm: string;
  closeResults: () => void;
};

const MAX_RESULTS_PER_GROUP = 3;

export function SearchResults({ searchTerm, closeResults }: SearchResultsProps) {
  const { songs, artists, albums, setActiveView, playSong, setSearchTerm } = useMusic();

  const searchResults = useMemo(() => {
    if (!searchTerm) return null;
    const normalizedSearchTerm = searchTerm.toLowerCase().replace(/[أإآ]/g, 'ا');

    const matchingSongs = songs
      .filter(song =>
        song.name.toLowerCase().replace(/[أإآ]/g, 'ا').includes(normalizedSearchTerm) ||
        song.artist.toLowerCase().replace(/[أإآ]/g, 'ا').includes(normalizedSearchTerm)
      )
      .slice(0, MAX_RESULTS_PER_GROUP);

    const matchingArtists = artists
      .filter(artist =>
        artist.name.toLowerCase().replace(/[أإآ]/g, 'ا').includes(normalizedSearchTerm)
      )
      .slice(0, MAX_RESULTS_PER_GROUP);

    const matchingAlbums = albums
      .filter(album =>
        album.name.toLowerCase().replace(/[أإآ]/g, 'ا').includes(normalizedSearchTerm) ||
        album.artist.toLowerCase().replace(/[أإآ]/g, 'ا').includes(normalizedSearchTerm)
      )
      .slice(0, MAX_RESULTS_PER_GROUP);
      
    if (matchingSongs.length === 0 && matchingArtists.length === 0 && matchingAlbums.length === 0) {
        return { songs: [], artists: [], albums: [] };
    }

    return {
      songs: matchingSongs,
      artists: matchingArtists,
      albums: matchingAlbums,
    };
  }, [searchTerm, songs, artists, albums]);
  
  if (!searchResults) return null;

  const handleSongClick = (songId: string) => {
    playSong(songId);
    setSearchTerm("");
    closeResults();
  };

  const handleArtistClick = (artistId: string) => {
    setActiveView({ type: "artist", id: artistId });
    setSearchTerm("");
    closeResults();
  };

  const handleAlbumClick = (albumId: string) => {
    setActiveView({ type: "album", id: albumId });
    setSearchTerm("");
    closeResults();
  };
  
  const hasResults = searchResults.songs.length > 0 || searchResults.artists.length > 0 || searchResults.albums.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-sm shadow-lg border rounded-lg z-10 text-sm max-h-[calc(100vh-100px)] overflow-y-auto">
      {!hasResults ? (
         <div className="p-4 text-center text-muted-foreground">No results found.</div>
      ) : (
        <div className="p-2">
            {searchResults.songs.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Tracks</div>
                {searchResults.songs.map(song => {
                   const songAlbum = albums.find(a => a.name === song.album && a.artist === song.artist);
                   return (
                    <div key={song.id} onClick={() => handleSongClick(song.id)} className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer">
                       <div className="w-10 h-10 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                        {songAlbum && songAlbum.imageUrl ? (
                            <Image src={songAlbum.imageUrl} alt={songAlbum.name} fill style={{objectFit: "cover"}}/>
                        ) : (
                            <Music className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate">{song.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
                      </div>
                    </div>
                   )
                })}
              </div>
            )}
            {searchResults.artists.length > 0 && (
                <div className="mt-2">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Artists</div>
                    {searchResults.artists.map(artist => (
                        <div key={artist.id} onClick={() => handleArtistClick(artist.id)} className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer">
                            <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                            {artist.imageUrl ? (
                                <Image src={artist.imageUrl} alt={artist.name} fill style={{objectFit: "cover"}}/>
                            ) : (
                                <User className="w-5 h-5 text-muted-foreground" />
                            )}
                            </div>
                            <div className="truncate">
                                <div className="font-medium truncate">{artist.name}</div>
                                <div className="text-xs text-muted-foreground">Artist</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {searchResults.albums.length > 0 && (
                <div className="mt-2">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Albums</div>
                     {searchResults.albums.map(album => (
                        <div key={album.id} onClick={() => handleAlbumClick(album.id)} className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer">
                            <div className="w-10 h-10 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                {album.imageUrl ? (
                                    <Image src={album.imageUrl} alt={album.name} fill style={{objectFit: "cover"}}/>
                                ) : (
                                    <Album className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                             <div className="truncate">
                                <div className="font-medium truncate">{album.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{album.artist}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}

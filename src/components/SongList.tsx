

"use client";

import { useMusic } from "@/hooks/use-music";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Music, Trash2, Heart, Play, Pause, User, Disc3 as AlbumIcon, ChevronRight, Search, Pencil, ChevronDown, ChevronUp, LayoutGrid, List, ArrowUp, ArrowDown } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Song, Playlist, AlbumType, Artist, SubView } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SongListSkeleton } from "./SongListSkeleton";
import { CATEGORIES } from "@/lib/audio-data";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfiniteScroll } from "./InfiniteScroll";
import { useIsMobile } from "@/hooks/use-mobile";

const TOP_RESULTS_LIMIT = 5;
const TOP_RESULTS_GRID_LIMIT = 6;
const ARTIST_SONGS_INITIAL_LIMIT = 5;
const CATEGORY_SONGS_INITIAL_LIMIT = 10;
const PAGINATION_INITIAL_LIMIT = 20;
const PAGINATION_LOAD_MORE_COUNT = 20;
const ALBUM_LIST_VIEW_PAGINATION_LIMIT = 10;
const CATEGORY_SONGS_LOAD_MORE_COUNT = 10;


type AlbumViewMode = 'grid' | 'list';
type SortConfig = {
  key: 'name' | 'album';
  direction: 'ascending' | 'descending';
} | null;


export function SongList() {
  const {
    songs,
    playlists,
    albums,
    artists,
    history,
    activeView,
    searchTerm,
    playSong,
    addSongToPlaylist,
    deleteSongFromPlaylist,
    currentSong,
    isPlaying,
    togglePlayPause,
    favoriteSongIds,
    favoriteAlbumIds,
    favoriteArtistIds,
    toggleFavorite,
    toggleFavoriteAlbum,
    toggleFavoriteArtist,
    isLoading,
    setActiveView,
    clearHistory,
  } = useMusic();

  const [showAllArtistSongs, setShowAllArtistSongs] = useState(false);
  const [showAllCategorySongs, setShowAllCategorySongs] = useState(false);
  const [albumViewMode, setAlbumViewMode] = useState<AlbumViewMode>('grid');
  const [isClearHistoryAlertOpen, setIsClearHistoryAlertOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  const [displayedItemsCount, setDisplayedItemsCount] = useState(PAGINATION_INITIAL_LIMIT);
  const [displayedAlbumListCount, setDisplayedAlbumListCount] = useState(ALBUM_LIST_VIEW_PAGINATION_LIMIT);
  const isMobile = useIsMobile();


  const displayedContent = useMemo(() => {
    if (isLoading) return { type: 'loading' };

    const normalizeArabic = (text: string) => text ? text.replace(/[أإآ]/g, 'ا') : '';

    const handleSearch = () => {
      if (!searchTerm) return { type: 'message', title: "Search", message: "Find your favorite songs, artists, and albums." };

      const normalizedSearchTerm = normalizeArabic(searchTerm.toLowerCase());
      const matchingSongs = songs.filter((song) =>
          normalizeArabic(song.name.toLowerCase()).includes(normalizedSearchTerm) ||
          normalizeArabic(song.artist.toLowerCase()).includes(normalizedSearchTerm) ||
          normalizeArabic(song.album?.toLowerCase() ?? '').includes(normalizedSearchTerm)
      );
      const matchingArtists = artists.filter((artist) =>
          normalizeArabic(artist.name.toLowerCase()).includes(normalizedSearchTerm)
      );
      const matchingAlbums = albums.filter((album) =>
          normalizeArabic(album.name.toLowerCase()).includes(normalizedSearchTerm) ||
          normalizeArabic(album.artist.toLowerCase()).includes(normalizedSearchTerm)
      );

      if (matchingSongs.length === 0 && matchingArtists.length === 0 && matchingAlbums.length === 0) {
        return {
          type: 'tabbed',
          title: `Results for "${searchTerm}"`,
          data: {
            songs: [],
            artists: [],
            albums: [],
          }
        };
      }
      
      return {
          type: 'tabbed',
          title: `Results for "${searchTerm}"`,
          data: {
              songs: matchingSongs,
              artists: matchingArtists,
              albums: matchingAlbums,
          }
      };
    };

    const handleCategory = () => {
        const view = activeView as { type: 'category', id: string, artistId?: string, albumId?: string, subView?: SubView };
        const category = CATEGORIES.find(c => c.id === view.id);
        if (!category) return { type: 'message', title: 'Category not found', message: "This category does not exist." };

        const songsInCategory = songs.filter(s => s.category === category.id);

        if (view.artistId) {
            const artist = artists.find(a => a.id === view.artistId);
            if (artist) {
                const artistAlbums = albums.filter(album => album.artist === artist.name && songsInCategory.some(s => s.album === album.name));
                if (view.albumId) {
                    const album = artistAlbums.find(a => a.id === view.albumId);
                    if (album) {
                        const albumArtist = artists.find(a => a.name === album.artist);
                        const albumSongs = songsInCategory.filter(s => s.album === album.name);
                        return { type: 'albumPage', album, artist: albumArtist, songs: albumSongs, title: album.name };
                    }
                }
                const artistSongs = songsInCategory.filter(s => s.artist === artist.name);
                return {
                    type: 'artistPage',
                    artist,
                    albums: artistAlbums,
                    songs: artistSongs,
                    title: artist.name,
                };
            }
        }
        
        const artistsInCategory = artists.filter(artist => songsInCategory.some(song => song.artist === artist.name));
        const albumsInCategory = albums.filter(album => songsInCategory.some(song => song.album === album.name));

        return {
            type: 'categoryPage',
            title: category.name,
            data: {
                songs: songsInCategory,
                artists: artistsInCategory,
                albums: albumsInCategory,
            },
        };
    };


    switch (activeView.type) {
      case 'search': return handleSearch();
      case 'category': return handleCategory();
      case "artist": {
        const artist = artists.find(a => a.id === activeView.id);
        if (artist) {
            const artistSongs = songs.filter(s => s.artist === artist.name);
            const artistAlbums = albums.filter(a => a.artist === artist.name);
            return { type: 'artistPage', artist, albums: artistAlbums, songs: artistSongs, title: artist.name };
        }
        break;
      }
      case "album": {
        const album = albums.find(a => a.id === activeView.id);
        if (album) {
            const albumArtist = artists.find(a => a.name === album.artist);
            const albumSongs = songs.filter(s => s.album === album.name);
            return { type: 'albumPage', album, artist: albumArtist, songs: albumSongs, title: album.name };
        }
        break;
      }
      case "playlist": {
        const playlist = playlists.find(p => p.id === activeView.id);
        if (playlist) {
            const playlistSongs = playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[];
            return { type: 'songs', data: playlistSongs, title: playlist.name, paginated: false };
        }
        break;
      }
      case 'favorite_songs':
        return { type: 'songs', data: songs.filter(s => favoriteSongIds.includes(s.id)), title: "Liked Songs", paginated: false };
      case 'history':
        const historySongs = history.map(entry => songs.find(s => s.id === entry.songId)).filter(Boolean) as Song[];
        return { type: 'songs', data: historySongs, title: 'History', paginated: false };
      case 'artists':
        return { type: 'artists', data: artists, title: 'All Artists' };
      case 'albums':
        return { type: 'albums', data: albums, title: 'Albums', paginated: true };
      case 'favorite_albums':
        return { type: 'albums', data: albums.filter(a => favoriteAlbumIds.includes(a.id)), title: 'Liked Albums', paginated: false };
      case 'favorite_artists':
        return { type: 'artists', data: artists.filter(a => favoriteArtistIds.includes(a.id)), title: 'Followed Artists' };
      default:
         return { type: 'songs', data: songs, title: 'All Songs', paginated: true };
    }

    return { type: 'songs', data: songs, title: 'All Songs', paginated: true };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, songs, albums, artists, history, searchTerm, favoriteSongIds, favoriteAlbumIds, favoriteArtistIds, playlists, isLoading]);


  const sortedContent = useMemo(() => {
    if (!sortConfig || !displayedContent) {
        return displayedContent;
    }
    
    let sortableData: Song[] | AlbumType[] | Artist[] | undefined;
    let dataType: 'songs' | 'albums' | 'artists' | null = null;
    const content: any = { ...displayedContent };
    
    switch(content.type) {
        case 'songs':
            sortableData = content.data ? [...content.data] : [];
            dataType = 'songs';
            break;
        case 'albumPage':
            sortableData = content.songs ? [...content.songs] : [];
            dataType = 'songs';
            break;
        case 'artistPage':
            sortableData = content.songs ? [...content.songs] : [];
            dataType = 'songs';
            break;
        case 'categoryPage':
             if (sortConfig.key === 'album') {
                 return content;
             }
            sortableData = content.data?.songs ? [...content.data.songs] : [];
            dataType = 'songs';
            break;
        default:
            return content;
    }

    if (!sortableData || !dataType) {
      return content;
    }

    if(dataType === 'songs'){
        (sortableData as Song[]).sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }


    switch(content.type) {
        case 'songs':
             if(dataType === 'songs') return { ...content, data: sortableData as Song[] };
             break;
        case 'albumPage':
            if(dataType === 'songs') return { ...content, songs: sortableData as Song[] };
            break;
        case 'artistPage':
            if(dataType === 'songs') return { ...content, songs: sortableData as Song[] };
            break;
        case 'categoryPage':
            if(dataType === 'songs') return { ...content, data: { ...content.data, songs: sortableData as Song[] } };
            break;
    }
    return content;
  }, [sortConfig, displayedContent]);


   useEffect(() => {
    if (activeView.type !== 'artist' && activeView.type !== 'album' && activeView.type !== 'category' && activeView.type !== 'all' && activeView.type !== 'playlist' && activeView.type !== 'favorite_songs' && activeView.type !== 'history') {
      setSortConfig(null);
    }
  }, [activeView]);


  useEffect(() => {
    if (activeView.type !== 'artist') {
      setShowAllArtistSongs(false);
    }
    if (activeView.type !== 'category') {
      setShowAllCategorySongs(false);
    }
    setDisplayedItemsCount(PAGINATION_INITIAL_LIMIT);
    setDisplayedAlbumListCount(ALBUM_LIST_VIEW_PAGINATION_LIMIT);
  }, [activeView]);


  const requestSort = (key: 'name' | 'album') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };


  const formatDuration = (totalSeconds: number) => {
    if (isNaN(totalSeconds)) return '0min';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let durationString = '';
    if (hours > 0) {
        durationString += `${hours}hr `;
    }
    if (minutes > 0 || hours === 0) {
        durationString += `${minutes}min`;
    }
    return durationString.trim();
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "-:--";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading || !sortedContent) {
    return <SongListSkeleton />;
  }

  const handleSubViewChange = (subView: SubView) => {
    if ('id' in activeView && activeView.type === 'category') {
      setActiveView({ ...activeView, subView });
    } else if (activeView.type === 'search') {
      setActiveView({ type: 'search', subView });
    }
  };
  
  const renderTitle = (title: string) => {
    if (activeView.type === 'history' && sortedContent.type === 'songs' && sortedContent.data.length > 0) {
      return (
        <div className="flex items-center mb-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">{title}</h1>
          </div>
          <Button variant="outline" onClick={() => setIsClearHistoryAlertOpen(true)} className="ml-auto">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </div>
      );
    }
    return <h1 className="text-xl md:text-3xl font-bold">{title}</h1>;
  };

  const renderArtistGrid = (artistList: Artist[], isSubGrid: boolean = false) => (
    <div className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
        isSubGrid ? "mt-0" : "mt-4"
      )}>
        {artistList.map(artist => (
            <div key={artist.id} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent/50 cursor-pointer"
                onClick={() => {
                    if (sortedContent.type === 'categoryPage' && 'id' in activeView) {
                        const nextView = { type: 'category' as const, id: activeView.id, artistId: artist.id, subView: 'top' as SubView };
                        if(artist.id) setActiveView(nextView);
                    } else {
                        const nextView = { type: 'artist' as const, id: artist.id };
                        if(artist.id) setActiveView(nextView);
                    }
                }}>
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden relative">
                    {artist.imageUrl ? (
                        <Image src={artist.imageUrl} alt={artist.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                    )}
                </div>
                <span className="font-medium text-center">{artist.name}</span>
            </div>
        ))}
    </div>
);

const renderAlbumGrid = (albumList: AlbumType[], isSubGrid: boolean = false, isPaginated: boolean = true) => {
    const albumsToShow = isPaginated ? albumList.slice(0, displayedItemsCount) : albumList;
    return (
        <>
            <div className={cn(
                "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
                isSubGrid ? "mt-0" : "mt-4"
            )}>
                {albumsToShow.map(album => (
                    <div key={album.id} className="flex flex-col gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer" onClick={() => {
                        if (sortedContent.type === 'categoryPage' && 'artistId' in activeView && activeView.artistId) {
                           const nextView = { type: 'category' as const, id: activeView.id, artistId: activeView.artistId, albumId: album.id };
                           if(album.id) setActiveView(nextView);
                        } else {
                           const nextView = { type: 'album' as const, id: album.id };
                           if(album.id) setActiveView(nextView);
                        }
                    }}>
                        <div className="w-full aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden relative">
                            {album.imageUrl ? (
                                <Image src={album.imageUrl} alt={album.name} fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <AlbumIcon className="w-12 h-12 text-muted-foreground" />
                            )}
                        </div>
                        <div className="w-full text-left">
                            <p className="font-medium truncate">{album.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
                        </div>
                    </div>
                ))}
            </div>
             {isPaginated && albumList.length > displayedItemsCount && (
                 <InfiniteScroll
                    onLoadMore={() => setDisplayedItemsCount(c => c + PAGINATION_LOAD_MORE_COUNT)}
                    hasMore={albumList.length > displayedItemsCount}
                />
            )}
        </>
    );
};

const renderAlbumList = (albumList: AlbumType[]) => {
    const albumsToShow = albumList.slice(0, displayedAlbumListCount);

    const sortSongs = (songs: Song[]) => {
        if (!sortConfig) return songs;
        return [...songs].sort((a, b) => {
            if (!sortConfig) return 0;
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    };

    return (
      <div className="mt-4 flex flex-col gap-8">
        {albumsToShow.map((album) => {
          const albumSongs = songs.filter(s => s.album === album.name && s.artist === album.artist);
          const sortedAlbumSongs = sortSongs(albumSongs);
          const totalDuration = albumSongs.reduce((acc: number, song: Song) => acc + (song.duration || 0), 0);
          return (
            <div key={album.id} className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-28 h-28 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                    {album.imageUrl ? (
                      <Image src={album.imageUrl} alt={album.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <AlbumIcon className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <h4 className="text-lg font-semibold truncate cursor-pointer hover:underline"
                        onClick={() => {
                           if (sortedContent.type === 'categoryPage' && 'artistId' in activeView && activeView.artistId) {
                                const nextView = { type: 'category' as const, id: activeView.id, artistId: activeView.artistId, albumId: album.id };
                                if(album.id) setActiveView(nextView);
                            } else {
                                const nextView = { type: 'album' as const, id: album.id };
                                if(album.id) setActiveView(nextView);
                            }
                        }}
                    >
                        {album.name}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
                    <div className="text-sm text-muted-foreground mt-2">
                        <span>{albumSongs.length} tracks</span>
                        <span className="mx-2">•</span>
                        <span>{formatDuration(totalDuration)}</span>
                      </div>
                  </div>
              </div>
              {renderSongTable(sortedAlbumSongs, true, true)}
            </div>
          );
        })}
         {albumList.length > displayedAlbumListCount && (
             <InfiniteScroll
                onLoadMore={() => setDisplayedAlbumListCount(c => c + ALBUM_LIST_VIEW_PAGINATION_LIMIT)}
                hasMore={albumList.length > displayedAlbumListCount}
            />
        )}
      </div>
    );
};
  
  const renderContent = () => {
    switch (sortedContent.type) {
      case 'categoryPage': {
        const { title, data } = sortedContent;
        const songsToShow = data.songs;

        const sections = [
            { id: 'artists', title: 'Artists', data: data.artists, showAll: () => {}, limit: data.artists.length },
            { id: 'albums', title: 'Albums', data: data.albums, showAll: () => {}, limit: data.albums.length },
            { id: 'songs', title: 'Tracks', data: data.songs, showAll: () => {}, limit: CATEGORY_SONGS_INITIAL_LIMIT },
        ].filter(section => section.data.length > 0)
         .sort((a, b) => {
            const order = ['artists', 'albums', 'songs'];
            return order.indexOf(a.id) - order.indexOf(b.id);
        });

        return (
          <>
            {renderTitle(title)}
            <div className="mt-6 space-y-8">
              {sections.map((section) => (
                <div key={section.id}>
                    {section.id === 'albums' ? (
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{section.title}</h2>
                            <div className="flex items-center gap-2">
                                <Button variant={albumViewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setAlbumViewMode('grid')}>
                                    <LayoutGrid className="h-5 w-5" />
                                </Button>
                                <Button variant={albumViewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setAlbumViewMode('list')}>
                                    <List className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                         section.id === 'songs' ? (
                            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                         ) : (
                            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                         )
                    )}

                   {section.id === 'artists' && renderArtistGrid(section.data as Artist[], false)}
                   {section.id === 'albums' && (albumViewMode === 'grid' ? renderAlbumGrid(section.data as AlbumType[], false, false) : renderAlbumList(section.data as AlbumType[]))}
                   {section.id === 'songs' && (
                       <>
                           {renderSongTable(songsToShow.slice(0, showAllCategorySongs ? songsToShow.length : CATEGORY_SONGS_INITIAL_LIMIT), false, false)}
                           {data.songs.length > CATEGORY_SONGS_INITIAL_LIMIT && !showAllCategorySongs && (
                                <div className="mt-4 flex justify-start">
                                    <Button
                                    variant="outline"
                                    onClick={() => setShowAllCategorySongs(true)}
                                    className="rounded-full"
                                    >
                                        <ChevronDown className="mr-2 h-4 w-4" />
                                        Show more
                                    </Button>
                                </div>
                           )}
                            {showAllCategorySongs && (
                                <div className="mt-4 flex justify-start">
                                     <Button
                                    variant="outline"
                                    onClick={() => setShowAllCategorySongs(false)}
                                    className="rounded-full"
                                    >
                                        <ChevronUp className="mr-2 h-4 w-4" />
                                        Show less
                                    </Button>
                                </div>
                            )}
                       </>
                   )}
                </div>
              ))}
            </div>
          </>
        )
      }
      case 'tabbed': {
        const { title, data } = sortedContent;
        const currentSubView = (activeView as any).subView || 'top';

        const topResultsSections = [
            { id: 'songs', title: 'Tracks', data: data.songs, limit: TOP_RESULTS_LIMIT, render: (d: Song[]) => renderSongTable(d, false, false), showAll: () => handleSubViewChange('songs') },
            { id: 'artists', title: 'Artists', data: data.artists, limit: TOP_RESULTS_GRID_LIMIT, render: (d: Artist[]) => renderArtistGrid(d, true), showAll: () => handleSubViewChange('artists') },
            { id: 'albums', title: 'Albums', data: data.albums, limit: TOP_RESULTS_GRID_LIMIT, render: (d: AlbumType[]) => renderAlbumGrid(d, true, false), showAll: () => handleSubViewChange('albums') },
        ]
        .filter(section => section.data.length > 0)
        .sort((a, b) => b.data.length - a.data.length);


        return (
          <>
            <div className="mb-4">{renderTitle(title)}</div>
            <Tabs value={currentSubView} onValueChange={(value) => handleSubViewChange(value as SubView)} className="mt-4">
              <TabsList>
                <TabsTrigger value="top">Top Results</TabsTrigger>
                <TabsTrigger value="songs" disabled={data.songs.length === 0}>Tracks</TabsTrigger>
                <TabsTrigger value="artists" disabled={data.artists.length === 0}>Artists</TabsTrigger>
                <TabsTrigger value="albums" disabled={data.albums.length === 0}>Albums</TabsTrigger>
              </TabsList>
              <TabsContent value="top" className="mt-6">
                {topResultsSections.map((section, index) => (
                     <div key={section.id} className={index > 0 ? "mt-8" : ""}>
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={section.showAll} className="text-2xl font-medium hover:text-primary flex items-center gap-2">
                                {section.title}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        {section.render(section.data.slice(0, section.limit) as any)}
                    </div>
                ))}
                 {topResultsSections.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-8">
                      <Search className="w-16 h-16 text-muted-foreground/50 mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">No results for "{searchTerm}"</h2>
                      <p className="text-muted-foreground">Please try a different search.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="songs">
                {renderSongTable(data.songs, false, false)}
              </TabsContent>
              <TabsContent value="artists">
                {renderArtistGrid(data.artists, false)}
              </TabsContent>
              <TabsContent value="albums">
                {renderAlbumGrid(data.albums, false, true)}
              </TabsContent>
            </Tabs>
          </>
        )
      }
      case 'albumPage': {
        const { album, artist, songs: albumSongs, title } = sortedContent;
        const totalDuration = albumSongs.reduce((acc: number, song: Song) => acc + (song.duration || 0), 0);
        const isFavorite = favoriteAlbumIds.includes(album.id);
        const isAlbumPlaying = isPlaying && currentSong && albumSongs.some((s: Song) => s.id === currentSong.id);

        return (
          <div>
              <header className="flex flex-col md:flex-row gap-8 md:gap-12 items-center mb-10">
                  <div className="relative flex-shrink-0 w-48 h-48 md:w-56 md:h-56 bg-muted rounded-lg flex items-center justify-center">
                      {album.imageUrl ? (
                         <Image 
                          className="w-full h-full rounded-lg object-cover shadow-lg" 
                          src={album.imageUrl} 
                          alt={album.name} 
                          width={224}
                          height={224}
                        />
                      ) : (
                        <Music className="w-24 h-24 text-muted-foreground" />
                      )}
                  </div>
                  <div className="flex-auto min-w-0 text-center md:text-left">
                      <p className="text-sm font-semibold text-muted-foreground uppercase">Album</p>
                      <h1 className="text-3xl md:text-5xl font-bold my-4">{title}</h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 my-4">
                          {artist && (
                            <>
                              <div className="relative w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                {artist.imageUrl ? (
                                  <Image src={artist.imageUrl} alt={artist.name} className="rounded-full object-cover" fill/>
                                ) : (
                                  <User className="w-4 h-4 text-muted-foreground"/>
                                )}
                              </div>
                              <button className="font-medium cursor-pointer hover:underline" onClick={(e) => {
                                e.stopPropagation();
                                if (sortedContent.type === 'albumPage' && sortedContent.artist) {
                                    const artistId = sortedContent.artist.id;
                                    const nextView = (activeView.type === 'category' && 'id' in activeView)
                                      ? { type: 'category' as const, id: activeView.id, artistId: artistId }
                                      : { type: 'artist' as const, id: artistId };
                                    if (artistId) setActiveView(nextView);
                                }
                              }}>{artist.name}</button>
                            </>
                          )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>{albumSongs.length} tracks</span>
                        <span className="mx-2">•</span>
                        <span>{formatDuration(totalDuration)}</span>
                      </div>
                       <div className="mt-6 flex gap-2 items-center justify-center md:justify-start">
                          <Button 
                              className="rounded-full px-8 font-bold" 
                              onClick={() => isAlbumPlaying ? togglePlayPause() : playSong(albumSongs[0].id)}
                          >
                              {isAlbumPlaying ? (
                                  <>
                                      <Image src="/assets/equalizer-white-29f31645.gif" width={12} height={12} alt="Playing" unoptimized className="mr-2" />
                                      Playing
                                  </>
                              ) : (
                                  <>
                                      <Play className="w-5 h-5 mr-2 fill-current"/>
                                      Play
                                  </>
                              )}
                          </Button>
                           <Button variant="outline" className="rounded-full" onClick={() => toggleFavoriteAlbum(album.id)}>
                               <Heart className={cn("w-5 h-5 mr-2", isFavorite && "fill-primary text-primary")}/>
                               {isFavorite ? 'Liked' : 'Like'}
                           </Button>
                      </div>
                  </div>
              </header>
              <div>
                <h2 className="text-2xl font-bold mb-4">Tracks</h2>
                {renderSongTable(albumSongs, true, true)}
              </div>
          </div>
        )
      }
      case 'artistPage': {
        const { artist, albums: artistAlbums, songs: artistSongs, title } = sortedContent;
        const isFavorite = favoriteArtistIds.includes(artist.id);
        const totalDuration = artistSongs.reduce((acc: number, song: Song) => acc + (song.duration || 0), 0);
        const isArtistPlaying = isPlaying && currentSong && artistSongs.some((s: Song) => s.id === currentSong.id);
        
        const songsToShow = showAllArtistSongs ? artistSongs : artistSongs.slice(0, ARTIST_SONGS_INITIAL_LIMIT);

        return (
           <div>
            <header className="flex flex-col md:flex-row gap-8 md:gap-12 items-center mb-10">
                <div className="relative flex-shrink-0 w-48 h-48 md:w-56 md:h-56 bg-muted rounded-full flex items-center justify-center">
                    {artist.imageUrl ? (
                        <Image 
                            className="w-full h-full rounded-full object-cover shadow-lg"
                            src={artist.imageUrl}
                            alt={artist.name} 
                            width={224}
                            height={224}
                        />
                    ) : (
                        <User className="w-24 h-24 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-auto min-w-0 text-center md:text-left">
                    <p className="text-sm font-semibold text-muted-foreground uppercase">Artist</p>
                    <h1 className="text-3xl md:text-5xl font-bold my-4">{title}</h1>
                    <div className="text-sm text-muted-foreground mt-4">
                        <span>{artistSongs.length} tracks</span>
                        <span className="mx-2">•</span>
                        <span>{formatDuration(totalDuration)}</span>
                         <span className="mx-2">•</span>
                        <span>{artistAlbums.length} albums</span>
                      </div>
                    <div className="mt-6 flex gap-2 items-center justify-center md:justify-start">
                        <Button 
                            className="rounded-full px-8 font-bold" 
                            onClick={() => {
                                if (isArtistPlaying) {
                                    togglePlayPause();
                                } else if (artistSongs.length > 0) {
                                    playSong(artistSongs[0].id);
                                }
                            }}
                            disabled={artistSongs.length === 0}
                        >
                            {isArtistPlaying ? (
                                <>
                                    <Image src="/assets/equalizer-white-29f31645.gif" width={12} height={12} alt="Playing" unoptimized className="mr-2" />
                                    Playing
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5 mr-2 fill-current"/>
                                    Play
                                </>
                            )}
                        </Button>
                         <Button variant="outline" className="rounded-full" onClick={() => toggleFavoriteArtist(artist.id)}>
                            <Heart className={cn("w-5 h-5 mr-2", isFavorite && "fill-primary text-primary")}/>
                            {isFavorite ? 'Following' : 'Follow'}
                        </Button>
                    </div>
                </div>
            </header>

             {artistSongs.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">Tracks</h2>
                    {renderSongTable(songsToShow, false, true)}
                    {artistSongs.length > ARTIST_SONGS_INITIAL_LIMIT && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllArtistSongs(prev => !prev)}
                          className="rounded-full"
                        >
                          {showAllArtistSongs ? (
                            <>
                              <ChevronUp className="mr-2 h-4 w-4" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-2 h-4 w-4" />
                              Show more
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                </div>
            )}
            
            {artistAlbums.length > 0 && (
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Albums</h2>
                         <div className="flex items-center gap-2">
                            <Button variant={albumViewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setAlbumViewMode('grid')}>
                                <LayoutGrid className="h-5 w-5" />
                            </Button>
                            <Button variant={albumViewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setAlbumViewMode('list')}>
                                <List className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                     {albumViewMode === 'grid' ? renderAlbumGrid(artistAlbums, false) : renderAlbumList(artistAlbums)}
                </div>
            )}
           </div>
        )
      }
      case 'artists':
        return (
          <div>
            <div className="mb-4">{renderTitle(sortedContent.title)}</div>
            {sortedContent.data.length > 0 ? renderArtistGrid(sortedContent.data, false) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-8">
                    <User className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No Artists Found</h2>
                </div>
            )}
          </div>
        )
      case 'albums':
         return (
          <div>
            <div className="flex justify-between items-center mb-4">
                {renderTitle(sortedContent.title)}
                <div className="flex items-center gap-2">
                    <Button variant={albumViewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setAlbumViewMode('grid')}>
                        <LayoutGrid className="h-5 w-5" />
                    </Button>
                    <Button variant={albumViewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setAlbumViewMode('list')}>
                        <List className="h-5 w-5" />
                    </Button>
                </div>
            </div>
             {sortedContent.data.length > 0 ? (
                albumViewMode === 'grid' ? renderAlbumGrid(sortedContent.data, false, sortedContent.paginated) : renderAlbumList(sortedContent.data)
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-8">
                    <AlbumIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No Albums Found</h2>
                </div>
            )}
          </div>
        )
      case 'songs':
        if (sortedContent.data.length === 0) {
            let message = "This section is empty.";
             if (activeView.type === 'history') {
                message = "Your listening history will appear here.";
            } else if (activeView.type === 'favorite_songs') {
                message = "You haven't liked any songs yet.";
            } else if (activeView.type === 'playlist') {
                message = "Add songs to this playlist to see them here.";
            }
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Music className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No songs found</h2>
                    <p className="text-muted-foreground">
                        {message}
                    </p>
                </div>
            );
        }

        const songsToRender = sortedContent.paginated
            ? sortedContent.data.slice(0, displayedItemsCount)
            : sortedContent.data;

        return (
          <div className="w-full">
            <div className="mb-4">
               {renderTitle(sortedContent.title)}
            </div>
            {renderSongTable(songsToRender, false, false)}
            {sortedContent.paginated && sortedContent.data.length > displayedItemsCount && (
                <InfiniteScroll
                    onLoadMore={() => setDisplayedItemsCount(c => c + PAGINATION_LOAD_MORE_COUNT)}
                    hasMore={sortedContent.data.length > displayedItemsCount}
                />
            )}
          </div>
        );
    case 'message':
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Music className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">{sortedContent.title}</h2>
                <p className="text-muted-foreground">{sortedContent.message}</p>
            </div>
        );
      default:
        return null;
    }
  }

  const renderSortIcon = (key: 'name' | 'album') => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowDown className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-50" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="h-4 w-4 ml-2" />;
    }
    return <ArrowDown className="h-4 w-4 ml-2" />;
  };

  const renderSongTable = (songsToRender: Song[], hideAlbum: boolean = false, hideImage: boolean = false) => (
    <>
      <div className={cn(
          "grid gap-x-2 md:gap-x-4 items-center px-2 md:px-4 py-2 border-b border-divider text-sm text-muted-foreground font-medium",
          "grid-cols-[1fr,auto,auto]",
          hideAlbum ? "md:grid-cols-[auto,1fr,auto,auto]" : "md:grid-cols-[auto,1fr,auto,auto,auto]"
        )}>
        <div className="w-10 text-center hidden md:block">#</div>
        <div 
            className="flex items-center cursor-pointer group"
            onClick={() => requestSort('name')}
        >
            Title
            {renderSortIcon('name')}
        </div>
        {!hideAlbum && 
          <div 
            className="hidden md:flex items-center cursor-pointer group w-40"
            onClick={() => requestSort('album')}
          >
            Album
            {renderSortIcon('album')}
        </div>}
        <div className="w-16 md:w-20 text-right">Duration</div>
        <div className="w-20 md:w-24 text-right">Actions</div>
      </div>
      <div className="flex flex-col">
        {songsToRender.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          const isFavorite = favoriteSongIds.includes(song.id);
          const songAlbum = albums.find(a => a.name === song.album && a.artist === song.artist);

          return (
            <div
              key={song.id}
              className={cn(
                "grid gap-x-2 md:gap-x-4 items-center px-2 md:px-4 h-16 transition-colors hover:bg-accent/50 group border-b border-divider",
                isCurrent ? "bg-accent/80" : "",
                "grid-cols-[1fr,auto,auto]",
                hideAlbum ? "md:grid-cols-[auto,1fr,auto,auto]" : "md:grid-cols-[auto,1fr,auto,auto,auto]"
              )}
              onDoubleClick={isMobile ? undefined : () => playSong(song.id)}
              onClick={isMobile ? () => playSong(song.id) : undefined}
            >
              <div className="w-10 text-center text-muted-foreground relative hidden md:flex items-center justify-center">
                  {isCurrent && isPlaying ? (
                    <Image src="/assets/equalizer-white-29f31645.gif" width={12} height={12} alt="Playing" unoptimized />
                  ) : (
                    <>
                      <span className={cn("transition-opacity group-hover:opacity-0")}>{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); isCurrent ? togglePlayPause() : playSong(song.id) }}
                      >
                        {isCurrent && isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                      </Button>
                    </>
                  )}
              </div>
              <div className="font-medium truncate flex items-center gap-3">
                 {!hideImage && (
                    <div className="w-10 h-10 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                        {songAlbum && songAlbum.imageUrl ? (
                            <Image src={songAlbum.imageUrl} alt={songAlbum.name} fill style={{objectFit: "cover"}}/>
                        ) : (
                            <Music className="w-5 h-5 text-muted-foreground" />
                        )}
                    </div>
                 )}
                 <div className="truncate">
                    <div className={cn("truncate")}>{song.name}</div>
                    <div className="text-xs text-muted-foreground truncate cursor-pointer hover:underline" onClick={(e) => {
                      e.stopPropagation();
                      const artist = artists.find(a => a.name === song.artist);
                      if (artist && artist.id) {
                         const artistId = artist.id;
                         const artistView = (activeView.type === 'category' && 'id' in activeView)
                            ? { type: 'category' as const, id: activeView.id, artistId: artistId }
                            : { type: 'artist' as const, id: artistId };
                         setActiveView(artistView);
                      }
                    }}>{song.artist}</div>
                 </div>
              </div>
              {!hideAlbum && <div className="hidden md:block w-40 text-sm text-muted-foreground truncate cursor-pointer hover:underline" onClick={(e) => {
                e.stopPropagation();
                const album = albums.find(a => a.name === song.album);
                 if (album && album.id) {
                     const albumId = album.id;
                     const albumView = (activeView.type === 'category' && 'artistId' in activeView && activeView.artistId)
                        ? { type: 'category' as const, id: activeView.id, artistId: activeView.artistId, albumId: albumId }
                        : { type: 'album' as const, id: albumId };
                     setActiveView(albumView);
                }
              }}>{song.album}</div>}
              <div className="w-16 md:w-20 text-right text-sm text-muted-foreground">{formatTime(song.duration || 0)}</div>
              <div className="text-right flex items-center justify-end w-20 md:w-24">
                  <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 text-muted-foreground hover:text-primary", isFavorite && "text-primary")}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }}
                  >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                  </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => toggleFavorite(song.id)}>
                          <Heart className={cn("w-4 h-4 mr-2", isFavorite && "text-primary fill-current")}/>
                          {isFavorite ? 'Unlike' : 'Like'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Plus className="w-4 h-4 mr-2"/>
                          Add to playlist
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                              {playlists.length > 0 ? (
                              playlists.map((playlist) => (
                                  <DropdownMenuItem
                                  key={playlist.id}
                                  onClick={() => addSongToPlaylist(playlist.id, song.id)}
                                  >
                                      {playlist.name}
                                  </DropdownMenuItem>
                              ))
                              ) : (
                              <DropdownMenuItem disabled>
                                  No playlists yet
                              </DropdownMenuItem>
                              )}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    {activeView.type === 'playlist' &&
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => deleteSongFromPlaylist(activeView.id!, song.id)}
                            className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4"/>
                            Remove from playlist
                        </DropdownMenuItem>
                      </>
                    }
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>
    </>
  );


  return (
    <div className="w-full">
      {renderContent()}
       <AlertDialog open={isClearHistoryAlertOpen} onOpenChange={setIsClearHistoryAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently clear your listening history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearHistory();
                setIsClearHistoryAlertOpen(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

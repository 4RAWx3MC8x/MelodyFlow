
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { Song, Playlist, ActiveView, AlbumType, Artist, HistoryEntry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { songs as initialSongs, albums as initialAlbums, artists as initialArtists } from "@/lib/audio-data";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc, addDoc, serverTimestamp, query, orderBy, limit, getDoc, getDocs } from "firebase/firestore";


type LoopMode = 'off' | 'all' | 'one';
const PLAYLIST_NAME_MAX_LENGTH = 50;

interface MusicContextType {
  songs: Song[];
  playlists: Playlist[];
  albums: AlbumType[];
  artists: Artist[];
  history: HistoryEntry[];
  currentSong: Song | null;
  isPlaying: boolean;
  activeView: ActiveView;
  searchTerm: string;
  loop: LoopMode;
  shuffle: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  favoriteSongIds: string[];
  favoriteAlbumIds: string[];
  favoriteArtistIds: string[];
  isFullScreenPlayerOpen: boolean;
  isLoading: boolean;
  playQueue: Song[];
  isQueueOpen: boolean;
  setIsQueueOpen: (isOpen: boolean) => void;
  playSong: (songId: string) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  deleteSongFromPlaylist: (playlistId: string, songId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  setActiveView: (view: ActiveView) => void;
  setSearchTerm: (term: string) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFavorite: (songId: string) => void;
  toggleFavoriteAlbum: (albumId: string) => void;
  toggleFavoriteArtist: (artistId: string) => void;
  setIsFullScreenPlayerOpen: (isOpen: boolean) => void;
  clearHistory: () => void;
}

export const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>({ type: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);
  const [loop, setLoop] = useState<LoopMode>('off');
  const [shuffle, setShuffle] = useState(false);
  const [favoriteSongIds, setFavoriteSongIds] = useState<string[]>([]);
  const [favoriteAlbumIds, setFavoriteAlbumIds] = useState<string[]>([]);
  const [favoriteArtistIds, setFavoriteArtistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  
  const isInitialLoadRef = useRef(true);

  const firestore = useFirestore();
  const { data: user, isLoading: isUserLoading } = useUser();

  // Load static data and restore playback state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audioRef.current = audio;

      setIsLoading(true);
      
      setTimeout(() => {
        setSongs(initialSongs);
        setAlbums(initialAlbums);
        setArtists(initialArtists);

        try {
          const savedShuffle = localStorage.getItem("melodyflow-shuffle");
          if (savedShuffle) setShuffle(JSON.parse(savedShuffle));
          
          const savedLoop = localStorage.getItem("melodyflow-loop");
          if (savedLoop) setLoop(savedLoop as LoopMode);
          
          const savedSongId = localStorage.getItem("melodyflow-currentSongId");
          const savedProgress = localStorage.getItem("melodyflow-progress");
          if (savedSongId && initialSongs.find(s => s.id === savedSongId)) {
            setCurrentSongId(savedSongId);
            if (savedProgress) {
              const numericProgress = parseFloat(savedProgress);
              setProgress(numericProgress);
            }
          }

          const savedVolume = localStorage.getItem("melodyflow-volume");
          if (savedVolume) {
              const numVolume = parseFloat(savedVolume);
              if (!isNaN(numVolume)) {
                  setVolume(numVolume);
                  audio.volume = numVolume;
              }
          }
          const savedMuted = localStorage.getItem("melodyflow-muted");
          if (savedMuted) {
              const boolMuted = JSON.parse(savedMuted);
              setIsMuted(boolMuted);
              audio.muted = boolMuted;
          }

        } catch (error) {
          console.error("Failed to load from localStorage", error);
        } finally {
          setIsLoading(false);
        }
      }, 100);

      const handleBeforeUnload = () => {
          if (currentSongId) {
              localStorage.setItem("melodyflow-currentSongId", currentSongId);
              localStorage.setItem("melodyflow-progress", audioRef.current?.currentTime.toString() || '0');
          } else {
              localStorage.removeItem("melodyflow-currentSongId");
              localStorage.removeItem("melodyflow-progress");
          }
          if (audioRef.current) {
              localStorage.setItem("melodyflow-volume", audioRef.current.volume.toString());
              localStorage.setItem("melodyflow-muted", JSON.stringify(audioRef.current.muted));
          }
           localStorage.setItem("melodyflow-shuffle", JSON.stringify(shuffle));
           localStorage.setItem("melodyflow-loop", loop);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
     localStorage.setItem("melodyflow-shuffle", JSON.stringify(shuffle));
  }, [shuffle]);

  useEffect(() => {
    localStorage.setItem("melodyflow-loop", loop);
  }, [loop]);


  // Firestore data listeners
  useEffect(() => {
    if (!firestore || !user) {
        if (!isUserLoading && !user) {
            setPlaylists([]);
            setFavoriteSongIds([]);
            setFavoriteAlbumIds([]);
            setFavoriteArtistIds([]);
            setHistory([]);
        }
        return;
    };
    const unsubscribes: (() => void)[] = [];

    // Playlists
    const playlistsQuery = collection(firestore, 'users', user.uid, 'playlists');
    unsubscribes.push(onSnapshot(playlistsQuery, (snapshot) => {
        setPlaylists(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Playlist)));
    }, (error) => {
        console.error("Error fetching playlists:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load playlists."});
    }));

    // Favorite Songs
    const favSongsQuery = collection(firestore, 'users', user.uid, 'favorite_songs');
    unsubscribes.push(onSnapshot(favSongsQuery, (snapshot) => {
        setFavoriteSongIds(snapshot.docs.map(d => d.id));
    }, (error) => {
        console.error("Error fetching favorite songs:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load favorite songs."});
    }));

    // Favorite Albums
    const favAlbumsQuery = collection(firestore, 'users', user.uid, 'favorite_albums');
    unsubscribes.push(onSnapshot(favAlbumsQuery, (snapshot) => {
        setFavoriteAlbumIds(snapshot.docs.map(d => d.id));
    }, (error) => {
        console.error("Error fetching favorite albums:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load favorite albums."});
    }));

    // Favorite Artists
    const favArtistsQuery = collection(firestore, 'users', user.uid, 'favorite_artists');
    unsubscribes.push(onSnapshot(favArtistsQuery, (snapshot) => {
        setFavoriteArtistIds(snapshot.docs.map(d => d.id));
    }, (error) => {
        console.error("Error fetching favorite artists:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load favorite artists."});
    }));
    
    // History
    const historyQuery = query(collection(firestore, 'users', user.uid, 'history'), orderBy('playedAt', 'desc'), limit(100));
    unsubscribes.push(onSnapshot(historyQuery, (snapshot) => {
        setHistory(snapshot.docs.map(d => d.data() as HistoryEntry));
    }, (error) => {
        console.error("Error fetching history:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load history."});
    }));


    return () => unsubscribes.forEach(unsub => unsub());

  }, [firestore, user, isUserLoading, toast]);



  const addSongToHistory = useCallback(async (songId: string) => {
    if (!firestore || !user) return;
    try {
      const newEntry: HistoryEntry = { songId, playedAt: Date.now() };
      const historyDocRef = doc(collection(firestore, 'users', user.uid, 'history'), songId);
      await setDoc(historyDocRef, newEntry);
    } catch(error) {
      console.error("Failed to add song to history:", error);
    }
  }, [firestore, user]);

  const clearHistory = useCallback(async () => {
    if (!firestore || !user) return;
    try {
      const historyCollection = collection(firestore, 'users', user.uid, 'history');
      const historySnapshot = await getDocs(historyCollection);
      const batch = writeBatch(firestore);
      historySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast({ description: "Your listening history has been cleared." });
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not clear your history." });
    }
  }, [firestore, user, toast]);

  const getPlaylistSongs = useCallback((playlistId: string): Song[] => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return [];
    return playlist.songIds.map(songId => songs.find(s => s.id === songId)).filter(Boolean) as Song[];
  }, [playlists, songs]);
  
  const generateShuffledPlaylist = useCallback((songList: Song[], currentSong?: Song) => {
    let remainingSongs = songList.filter(s => s.id !== currentSong?.id);
    let shuffled = [];
    
    for (let i = remainingSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingSongs[i], remainingSongs[j]] = [remainingSongs[j], remainingSongs[i]];
    }

    if (currentSong) {
      shuffled = [currentSong, ...remainingSongs];
    } else {
      shuffled = remainingSongs;
    }
    
    setShuffledSongs(shuffled);
  }, []);
  
  const currentSong = useMemo(() => {
    if (!currentSongId) return null;
    return songs.find(s => s.id === currentSongId) || null;
  }, [songs, currentSongId]);

  const playQueue = useMemo(() => {
    let songList: Song[] = songs;
      if (activeView.type === 'playlist') {
          songList = getPlaylistSongs(activeView.id || '');
      } else if (activeView.type === 'favorite_songs') {
          songList = songs.filter(s => favoriteSongIds.includes(s.id));
      } else if (activeView.type === 'category' && activeView.id) {
          const currentCategory = songs.find(s => s.id === currentSongId)?.category
          songList = songs.filter(s => s.category === currentCategory);
      } else if (activeView.type === 'artist' && activeView.id) {
          const currentArtist = songs.find(s => s.id === currentSongId)?.artist;
          songList = songs.filter(s => s.artist === currentArtist);
      } else if (activeView.type === 'album' && activeView.id) {
          const currentAlbum = songs.find(s => s.id === currentSongId)?.album;
          songList = songs.filter(s => s.album === currentAlbum);
      }

    const effectiveSongList = shuffle ? shuffledSongs.filter(s => songList.some(ps => ps.id === s.id)) : songList;
    
    const currentSongIndex = effectiveSongList.findIndex(s => s.id === currentSongId);
    if (currentSongIndex === -1) return [];

    const upcoming = effectiveSongList.slice(currentSongIndex + 1);
    const past = effectiveSongList.slice(0, currentSongIndex);

    return [...upcoming, ...past];

  }, [currentSongId, songs, shuffle, shuffledSongs, activeView, getPlaylistSongs, favoriteSongIds]);

  const playNext = useCallback(() => {
     let songList: Song[] = songs;
      if (activeView.type === 'playlist') {
          songList = getPlaylistSongs(activeView.id || '');
      } else if (activeView.type === 'favorite_songs') {
          songList = songs.filter(s => favoriteSongIds.includes(s.id));
      } else if (activeView.type === 'category' && activeView.id) {
          const currentCategory = songs.find(s => s.id === currentSongId)?.category
          songList = songs.filter(s => s.category === currentCategory);
      } else if (activeView.type === 'artist' && activeView.id) {
          const currentArtist = songs.find(s => s.id === currentSongId)?.artist;
          songList = songs.filter(s => s.artist === currentArtist);
      } else if (activeView.type === 'album' && activeView.id) {
          const currentAlbum = songs.find(s => s.id === currentSongId)?.album;
          songList = songs.filter(s => s.album === currentAlbum);
      }
      
    const effectiveSongList = shuffle ? shuffledSongs.filter(s => songList.some(ps => ps.id === s.id)) : songList;
    const currentSongIndex = effectiveSongList.findIndex(s => s.id === currentSongId);

    if (effectiveSongList.length === 0) return;

    if (loop === 'off' && currentSongIndex === effectiveSongList.length - 1) {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setProgress(0);
        }
        return;
    };
    const nextIndex = (currentSongIndex + 1) % effectiveSongList.length;
    const nextSong = effectiveSongList[nextIndex];
    if (nextSong) {
      isInitialLoadRef.current = false;
      setCurrentSongId(nextSong.id);
      setIsPlaying(true);
      addSongToHistory(nextSong.id);
    }
  }, [currentSongId, songs, shuffle, shuffledSongs, activeView, getPlaylistSongs, loop, favoriteSongIds, addSongToHistory]);

  // Effect for handling audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (loop === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    const handleVolumeChange = () => {
        setVolume(audio.volume);
        setIsMuted(audio.muted);
    };
    
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [loop, playNext]);

  // Effect for loading new song source
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentSong) {
      if (audio.src !== currentSong.url) {
        audio.src = currentSong.url;
        audio.load();
        
        const handleCanPlay = () => {
          if (isInitialLoadRef.current) {
            const savedProgress = parseFloat(localStorage.getItem("melodyflow-progress") || '0');
            if (savedProgress > 0 && savedProgress < audio.duration) {
              audio.currentTime = savedProgress;
              setProgress(savedProgress);
            }
            isInitialLoadRef.current = false; 
          } else {
            setIsPlaying(true);
          }
        };

        audio.addEventListener('canplay', handleCanPlay, { once: true });
        
        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [currentSong]);


  // Effect for playing/pausing the audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isInitialLoadRef.current) return;

    if (isPlaying) {
      audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Playback failed", e);
          toast({ variant: 'destructive', title: 'Playback Error', description: 'Could not play the selected audio.' });
          setIsPlaying(false);
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong, toast]);

  const togglePlayPause = useCallback(() => {
    if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
    }
    
    if (currentSongId) {
      setIsPlaying((prev) => !prev);
    } else if (songs.length > 0) {
      // This part will be tricky because playSong is not defined yet.
      // We will define playSong later and rely on closure.
    }
  }, [currentSongId, songs]);

  const playSong = useCallback((songId: string) => {
    const songToPlay = songs.find(s => s.id === songId);
    if (songToPlay) {
      isInitialLoadRef.current = false;
      if (currentSongId !== songId) {
        setCurrentSongId(songId);
      } else {
        togglePlayPause();
        return;
      }
      setIsPlaying(true);
      addSongToHistory(songId);
      
      let currentPlaylist: Song[] = songs; 
      if (activeView.type === 'playlist') {
        currentPlaylist = getPlaylistSongs(activeView.id || '');
      } else if (activeView.type === 'favorite_songs') {
        currentPlaylist = songs.filter(s => favoriteSongIds.includes(s.id));
      } else if (activeView.type === 'category' && activeView.id) {
          currentPlaylist = songs.filter(s => s.category === activeView.id);
      } else if (activeView.type === 'artist' && activeView.id) {
          const artistName = songs.find(s => s.artist === songToPlay.artist)?.artist;
          currentPlaylist = songs.filter(s => s.artist === artistName);
      } else if (activeView.type === 'album' && activeView.id) {
          const albumName = songs.find(s => s.album === songToPlay.album)?.album;
          currentPlaylist = songs.filter(s => s.album === albumName);
      }

      if (shuffle) {
        generateShuffledPlaylist(currentPlaylist, songToPlay);
      }
    }
  }, [songs, currentSongId, shuffle, activeView, getPlaylistSongs, favoriteSongIds, generateShuffledPlaylist, addSongToHistory, togglePlayPause]);
  
  const handleSetVolume = useCallback((newVolume: number) => {
    const audio = audioRef.current;
    if (audio) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      audio.volume = clampedVolume;
      if (audio.muted && clampedVolume > 0) {
        audio.muted = false;
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
    }
  }, []);

  // We need to redefine togglePlayPause to use playSong and toggleMute
  const newTogglePlayPause = useCallback(() => {
    if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
    }
    
    if (currentSongId) {
      setIsPlaying((prev) => !prev);
    } else if (songs.length > 0) {
      const firstSong = (shuffle && shuffledSongs.length > 0) ? shuffledSongs[0] : songs[0];
      if (firstSong) {
        playSong(firstSong.id);
      }
    }
  }, [currentSongId, songs, playSong, shuffle, shuffledSongs]);
  
  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      // Ignore shortcuts if user is typing in an input, textarea, etc.
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      
      switch (event.code) {
        case 'Space':
        case 'KeyK':
          event.preventDefault();
          newTogglePlayPause();
          break;
        case 'KeyM':
          event.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleSetVolume(volume + 0.05);
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleSetVolume(volume - 0.05);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [newTogglePlayPause, toggleMute, handleSetVolume, volume]);

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (audio && isFinite(time)) {
      audio.currentTime = time;
      setProgress(time);
    }
  };

  const playPrevious = useCallback(() => {
    let songList: Song[] = songs;
      if (activeView.type === 'playlist') {
        songList = getPlaylistSongs(activeView.id || '');
      } else if (activeView.type === 'favorite_songs') {
        songList = songs.filter(s => favoriteSongIds.includes(s.id));
      } else if (activeView.type === 'category' && activeView.id) {
           const currentCategory = songs.find(s => s.id === currentSongId)?.category
          songList = songs.filter(s => s.category === currentCategory);
      } else if (activeView.type === 'artist' && activeView.id) {
          const currentArtist = songs.find(s => s.id === currentSongId)?.artist;
          songList = songs.filter(s => s.artist === currentArtist);
      } else if (activeView.type === 'album' && activeView.id) {
          const currentAlbum = songs.find(s => s.id === currentSongId)?.album;
          songList = songs.filter(s => s.album === currentAlbum);
      }
      
    const effectiveSongList = shuffle ? shuffledSongs.filter(s => songList.some(ps => ps.id === s.id)) : songList;
    const currentSongIndex = effectiveSongList.findIndex(s => s.id === currentSongId);

    if (effectiveSongList.length === 0) return;
    const prevIndex = (currentSongIndex - 1 + effectiveSongList.length) % effectiveSongList.length;
    const prevSong = effectiveSongList[prevIndex];
    if (prevSong) {
      isInitialLoadRef.current = false;
      setCurrentSongId(prevSong.id);
      setIsPlaying(true);
      addSongToHistory(prevSong.id);
    }
  }, [currentSongId, songs, shuffle, shuffledSongs, activeView, getPlaylistSongs, favoriteSongIds, addSongToHistory]);


  const createPlaylist = useCallback(async (name: string) => {
    if (!firestore || !user) return;
    if(name.trim() === '') {
        toast({ variant: "destructive", title: "Invalid name", description: "Playlist name cannot be empty."});
        return;
    }
    if (name.length > PLAYLIST_NAME_MAX_LENGTH) {
      toast({ variant: "destructive", title: "Invalid name", description: `Playlist name cannot exceed ${PLAYLIST_NAME_MAX_LENGTH} characters.`});
      return;
    }
    try {
      const newPlaylist = {
        name,
        songIds: [],
      };
      const playlistCollection = collection(firestore, 'users', user.uid, 'playlists');
      await addDoc(playlistCollection, newPlaylist);
      toast({ title: "Playlist created", description: `"${name}" was created.`});
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not create playlist."});
    }
  }, [firestore, user, toast]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    if (!firestore || !user) return;

    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    try {
      const playlistRef = doc(firestore, 'users', user.uid, 'playlists', playlistId);
      await deleteDoc(playlistRef);
      if (activeView.type === 'playlist' && activeView.id === playlistId) {
          setActiveView({ type: 'all' });
      }
      toast({
        title: "Playlist deleted",
        description: `"${playlist.name}" was deleted.`,
      });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete playlist."});
    }
  }, [activeView, firestore, user, playlists, toast]);

  const renamePlaylist = useCallback(async (playlistId: string, newName: string) => {
    if (!firestore || !user) return;
    if (newName.trim() === '') {
      toast({ variant: "destructive", title: "Invalid name", description: "Playlist name cannot be empty."});
      return;
    }
    if (newName.length > PLAYLIST_NAME_MAX_LENGTH) {
      toast({ variant: "destructive", title: "Invalid name", description: `Playlist name cannot exceed ${PLAYLIST_NAME_MAX_LENGTH} characters.`});
      return;
    }
    try {
      const playlistRef = doc(firestore, 'users', user.uid, 'playlists', playlistId);
      await setDoc(playlistRef, { name: newName }, { merge: true });
      toast({ title: "Playlist renamed", description: `Playlist was renamed to "${newName}".` });
    } catch (error) {
      console.error("Error renaming playlist:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not rename playlist."});
    }
  }, [firestore, user, toast]);


  const addSongToPlaylist = useCallback(async (playlistId: string, songId: string) => {
    if (!firestore || !user) return;
    
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    if (playlist.songIds.includes(songId)) {
        toast({ variant: "destructive", title: "Song exists", description: "This song is already in the playlist." });
        return;
    }
    
    const songName = songs.find(s => s.id === songId)?.name || '';
    const updatedSongIds = [...playlist.songIds, songId];
    
    try {
      const playlistRef = doc(firestore, 'users', user.uid, 'playlists', playlistId);
      await setDoc(playlistRef, { songIds: updatedSongIds }, { merge: true });
      toast({ title: "Song added", description: `Added "${songName}" to "${playlist.name}".` });
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not add song to playlist."});
    }
  }, [firestore, user, playlists, songs, toast]);

  const deleteSongFromPlaylist = useCallback(async (playlistId: string, songId: string) => {
    if (!firestore || !user) return;
    const playlist = playlists.find(p => p.id === playlistId);
    const song = songs.find(s => s.id === songId);
    if (!playlist || !song) return;

    const updatedSongIds = playlist.songIds.filter(id => id !== songId);
    try {
      const playlistRef = doc(firestore, 'users', user.uid, 'playlists', playlistId);
      await setDoc(playlistRef, { songIds: updatedSongIds }, { merge: true });
      toast({
          title: "Song removed",
          description: `"${song.name}" was removed from "${playlist.name}".`,
      });
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not remove song from playlist."});
    }
  }, [firestore, user, playlists, songs, toast]);

  const toggleLoop = useCallback(() => {
    setLoop(prev => {
        if (prev === 'off') return 'all';
        if (prev === 'all') return 'one';
        return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    const newShuffleState = !shuffle;
    setShuffle(newShuffleState);
    if (newShuffleState && currentSong) {
      let songList: Song[] = songs;
      if (activeView.type === 'playlist') {
        songList = getPlaylistSongs(activeView.id || '');
      } else if (activeView.type === 'favorite_songs') {
        songList = songs.filter(s => favoriteSongIds.includes(s.id));
      } // Add other active views if needed
      generateShuffledPlaylist(songList, currentSong);
    }
  }, [shuffle, currentSong, songs, activeView, getPlaylistSongs, favoriteSongIds, generateShuffledPlaylist]);


  const toggleFavorite = useCallback(async (songId: string) => {
    if (!firestore || !user) return;
    const favRef = doc(firestore, 'users', user.uid, 'favorite_songs', songId);
    
    try {
      const docSnap = await getDoc(favRef);
      if (docSnap.exists()) {
          await deleteDoc(favRef);
      } else {
          await setDoc(favRef, { songId: songId });
      }
    } catch (error) {
       console.error("Error toggling favorite song:", error);
       toast({ variant: "destructive", title: "Error", description: "Could not update favorites."});
    }
  }, [firestore, user, toast]);

  const toggleFavoriteAlbum = useCallback(async (albumId: string) => {
    if (!firestore || !user) return;
    const favRef = doc(firestore, 'users', user.uid, 'favorite_albums', albumId);

    try {
      const docSnap = await getDoc(favRef);
      if (docSnap.exists()) {
          await deleteDoc(favRef);
          toast({ description: "Removed from Liked Albums." });
      } else {
          await setDoc(favRef, { albumId: albumId });
          toast({ description: "Added to Liked Albums." });
      }
    } catch (error) {
       console.error("Error toggling favorite album:", error);
       toast({ variant: "destructive", title: "Error", description: "Could not update liked albums."});
    }
  }, [firestore, user, toast]);
  
  const toggleFavoriteArtist = useCallback(async (artistId: string) => {
    if (!firestore || !user) return;
    const favRef = doc(firestore, 'users', user.uid, 'favorite_artists', artistId);

    try {
      const docSnap = await getDoc(favRef);
      if (docSnap.exists()) {
          await deleteDoc(favRef);
          toast({ description: "Unfollowed artist." });
      } else {
          await setDoc(favRef, { artistId: artistId });
          toast({ description: "Followed artist." });
      }
    } catch (error) {
      console.error("Error toggling favorite artist:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update followed artists."});
    }
  }, [firestore, user, toast]);

  const contextValue = {
    songs,
    playlists,
    albums,
    artists,
    history,
    currentSong,
    isPlaying,
    activeView,
    searchTerm,
    loop,
    shuffle,
    progress,
    duration,
    volume,
    isMuted,
    favoriteSongIds,
    favoriteAlbumIds,
    favoriteArtistIds,
    isFullScreenPlayerOpen,
    isLoading: isLoading || isUserLoading,
    playQueue,
    isQueueOpen,
    setIsQueueOpen,
    playSong,
    togglePlayPause: newTogglePlayPause,
    playNext,
    playPrevious,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    deleteSongFromPlaylist,
renamePlaylist,
    setActiveView,
    setSearchTerm,
    toggleLoop,
    toggleShuffle,
    seek,
    setVolume: handleSetVolume,
    toggleMute,
    toggleFavorite,
    toggleFavoriteAlbum,
    toggleFavoriteArtist,
    setIsFullScreenPlayerOpen,
    clearHistory,
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
}

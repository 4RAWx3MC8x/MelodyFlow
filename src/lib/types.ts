
import type { Album } from './audio-data';
export type AlbumType = Album;

export type Song = {
  id: string;
  name: string;
  artist: string;
  album: string;
  url: string;
  category: string;
  duration?: number;
};

export interface Artist {
    id: string;
    name: string;
    imageUrl: string;
}

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
};

export type HistoryEntry = {
  songId: string;
  playedAt: number;
};

export type SubView = 'top' | 'songs' | 'artists' | 'albums';

export type ActiveView = 
  | { type: 'all' }
  | { type: 'search', subView?: SubView }
  | { type: 'artists' }
  | { type: 'albums' }
  | { type: 'category', id: string, subView?: SubView, artistId?: string, albumId?: string }
  | { type: 'artist', id: string }
  | { type: 'album', id: string }
  | { type: 'playlist', id: string }
  | { type: 'favorite_songs' }
  | { type: 'favorite_albums' }
  | { type: 'favorite_artists' }
  | { type: 'history' }
  | { type: 'settings' };

// This defines the structure of the `displayedContent` object
export type DisplayedContent =
  | { type: 'loading' }
  | { type: 'message', title: string, message: string }
  | { type: 'songs', data: Song[], title: string, paginated: boolean }
  | { type: 'albums', data: AlbumType[], title: string, paginated: boolean }
  | { type: 'artists', data: Artist[], title: string }
  | { type: 'artistPage', artist: Artist, albums: AlbumType[], songs: Song[], title: string }
  | { type: 'albumPage', album: AlbumType, artist?: Artist, songs: Song[], title: string }
  | { type: 'categoryPage', title: string, data: { songs: Song[], artists: Artist[], albums: AlbumType[] } }
  | { type: 'tabbed', title: string, data: { songs: Song[], artists: Artist[], albums: AlbumType[] } };

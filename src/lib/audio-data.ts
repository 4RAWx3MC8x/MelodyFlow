import type { Song } from './types';
import audioData from './audio-data.json';

interface Artist {
    id: string;
    name: string;
    imageUrl: string;
}

interface Album {
    id: string;
    artist: string;
    name: string;
    imageUrl: string;
}

interface Category {
    id: string;
    name: string;
}

export const songs: Song[] = audioData.songs;
export const artists: Artist[] = audioData.artists;
export const albums: Album[] = audioData.albums;
export const CATEGORIES: Category[] = audioData.categories;

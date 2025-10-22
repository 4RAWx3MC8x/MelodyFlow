
import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';

const audioDir = path.join(process.cwd(), 'public/audio-files');
const outputFile = path.join(process.cwd(), 'src/lib/audio-data.json');

function createId(...parts) {
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function generateAudioData() {
  console.log('Starting audio data generation...');
  const allSongs = [];
  const allArtists = new Map();
  const allAlbums = new Map();
  const allCategories = new Set();

  try {
    const categories = fs.readdirSync(audioDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const category of categories) {
      allCategories.add(category);
      const categoryPath = path.join(audioDir, category);
      const artists = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const artistName of artists) {
        const artistId = createId(artistName);
        if (!allArtists.has(artistId)) {
          const artistImagePath = path.join(categoryPath, artistName, 'artist.jpg');
          const artistImageUrl = fs.existsSync(artistImagePath) ? `/${path.relative(path.join(process.cwd(), 'public'), artistImagePath)}` : '';
          allArtists.set(artistId, {
            id: artistId,
            name: artistName,
            imageUrl: artistImageUrl,
          });
        }

        const artistPath = path.join(categoryPath, artistName);
        const albums = fs.readdirSync(artistPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        for (const albumName of albums) {
          const albumId = createId(artistName, albumName);
          if (!allAlbums.has(albumId)) {
            const albumImagePath = path.join(artistPath, albumName, 'cover.jpg');
            const albumImageUrl = fs.existsSync(albumImagePath) ? `/${path.relative(path.join(process.cwd(), 'public'), albumImagePath)}` : '';
            allAlbums.set(albumId, {
              id: albumId,
              artist: artistName,
              name: albumName,
              imageUrl: albumImageUrl,
            });
          }

          const albumPath = path.join(artistPath, albumName);
          const files = fs.readdirSync(albumPath).filter(file => file.endsWith('.mp3'));

          for (const file of files) {
            const filePath = path.join(albumPath, file);
            let duration = 0;
            try {
              const metadata = await mm.parseFile(filePath, { duration: false });
              duration = metadata.format.duration || 0;
            } catch (error) {
              console.error(`Error getting duration for ${filePath}:`, error);
            }

            const songName = path.basename(file, '.mp3');
            const songId = createId(artistName, albumName, songName);
            allSongs.push({
              id: songId,
              name: songName,
              artist: artistName,
              album: albumName,
              url: `/${path.relative(path.join(process.cwd(), 'public'), filePath)}`,
              category: category,
              duration: duration,
            });
          }
        }
      }
    }

    const outputData = {
      songs: allSongs,
      artists: Array.from(allArtists.values()),
      albums: Array.from(allAlbums.values()),
      categories: Array.from(allCategories).map(c => ({ id: c, name: c })),
    };

    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log('Audio data generated successfully!');
  } catch (error) {
    console.error('Error generating audio data:', error);
  }
}

generateAudioData();

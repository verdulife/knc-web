
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { generateAIDescription } from './cohere.js';

async function sync() {
  console.log('🚀 Iniciando sincronización...');

  const { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = process.env;

  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID || !process.env.COHERE_API_KEY) {
    console.error('❌ Error: Faltan variables de entorno esenciales (YouTube o Cohere).');
    process.exit(1);
  }

  try {
    const playlistId = YOUTUBE_CHANNEL_ID.replace(/^UC/, 'UU');
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${playlistId}&part=snippet&maxResults=10`;

    const res = await fetch(url);
    const data = await res.json();

    const episodeRegex = /^KNC\s(\d+)x(\d+)\s\|\s/;
    const spotifyRegex = /https?:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?episode\/[a-zA-Z0-9]+/;

    const latest = data.items
      .map(item => {
        const title = item.snippet.title;
        const match = title.match(episodeRegex);

        if (!match) return null;

        const titleClean = title.replace(episodeRegex, '');
        return {
          title: titleClean,
          description: item.snippet.description,
          season: parseInt(match[1], 10),
          episode: parseInt(match[2], 10),
          thumbnail: item.snippet.thumbnails.maxres.url,
          links: {
            youtube: `https://youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            spotify: item.snippet.description.match(spotifyRegex)?.[0] || null
          }
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.season - a.season || b.episode - a.episode)[0];

    if (latest) {
      console.log(`🤖 Procesando IA para: ${latest.title}`);
      latest.description = await generateAIDescription(latest.description);
      latest.updatedAt = new Date().toISOString();

      const filePath = path.join(process.cwd(), `src/content/episodes/${latest.season}/${latest.episode}.json`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(filePath, JSON.stringify(latest, null, 2));
      console.log('✅ Sincronización completada con éxito.');
    }
  } catch (error) {
    console.error('💥 Error crítico:', error);
    process.exit(1);
  }
}

sync();
// Service for fetching music metadata including album artwork
interface iTunesSearchResult {
  results: Array<{
    trackName: string;
    artistName: string;
    artworkUrl100: string;
    artworkUrl60: string;
    collectionName: string;
    trackId: number;
  }>;
}

interface AlbumArt {
  small: string; // 60x60
  medium: string; // 100x100
  large: string; // 600x600 (we'll construct this)
}

// Cache to avoid repeated API calls for the same songs
const artworkCache = new Map<string, AlbumArt | null>();

export const musicService = {
  async getAlbumArtwork(songName: string, artistName: string): Promise<AlbumArt | null> {
    const cacheKey = `${artistName}-${songName}`.toLowerCase();
    
    // Check cache first
    if (artworkCache.has(cacheKey)) {
      return artworkCache.get(cacheKey) || null;
    }

    try {
      // Clean up the search terms for better results
      const cleanSong = songName.replace(/[^\w\s]/g, '').trim();
      const cleanArtist = artistName.replace(/[^\w\s]/g, '').trim();
      
      // Search iTunes API
      const searchTerm = encodeURIComponent(`${cleanArtist} ${cleanSong}`);
      const response = await fetch(
        `https://itunes.apple.com/search?term=${searchTerm}&media=music&entity=song&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('iTunes API request failed');
      }
      
      const data: iTunesSearchResult = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        
        // iTunes provides 60x60 and 100x100, we can get larger by modifying the URL
        const artwork: AlbumArt = {
          small: result.artworkUrl60,
          medium: result.artworkUrl100,
          large: result.artworkUrl100.replace('100x100bb', '600x600bb')
        };
        
        artworkCache.set(cacheKey, artwork);
        return artwork;
      } else {
        // No results found, cache null to avoid repeated requests
        artworkCache.set(cacheKey, null);
        return null;
      }
    } catch (error) {
      console.warn(`Failed to fetch artwork for "${songName}" by "${artistName}":`, error);
      artworkCache.set(cacheKey, null);
      return null;
    }
  },

  // Preload artwork for multiple songs (useful for batch operations)
  async preloadArtwork(songs: Array<{ name: string; author: string }>): Promise<void> {
    const promises = songs.map(song => 
      this.getAlbumArtwork(song.name, song.author)
    );
    
    // Execute all requests in parallel but don't wait for completion
    Promise.allSettled(promises).then(() => {
      console.log('Artwork preloading completed');
    });
  },

  // Clear the cache (useful for development or if needed)
  clearCache(): void {
    artworkCache.clear();
  }
};
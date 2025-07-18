import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Music, Plus, Edit2, Trash2, ExternalLink, Link, Video, Mic, Play, Heart, Star, BookOpen, Loader2, MoreHorizontal, Image, ChevronUp } from 'lucide-react';
import { songService, type Song } from '../lib/supabase';
import { musicService } from '../lib/musicService';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SongForm {
  name: string;
  author: string;
  tabsLink: string;
  videoLink: string;
  comments: string;
  recordingLink: string;
}

// Utility function to extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

export function Repertoire() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [activeCategory, setActiveCategory] = useState<'rehearsing' | 'want-to-learn' | 'studied' | 'recorded'>('rehearsing');
  const [artworkCache, setArtworkCache] = useState<Map<string, string>>(new Map());
  const [artworkUrlSupported, setArtworkUrlSupported] = useState(true);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SongForm>({
    name: '',
    author: '',
    tabsLink: '',
    videoLink: '',
    comments: '',
    recordingLink: ''
  });

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const data = await songService.getAll();
      setSongs(data);
      
      // Preload artwork for all songs
      if (data.length > 0) {
        loadArtworkForSongs(data);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtworkForSongs = async (songsToLoad: Song[]) => {
    const promises = songsToLoad.map(async (song) => {
      if (song.artwork_url) {
        // Use stored artwork URL
        setArtworkCache(prev => new Map(prev).set(song.id, song.artwork_url!));
      } else {
        // Fetch artwork from iTunes API
        try {
          const artwork = await musicService.getAlbumArtwork(song.name, song.author);
          if (artwork) {
            const artworkUrl = artwork.large;
            setArtworkCache(prev => new Map(prev).set(song.id, artworkUrl));
            
            // Try to update the song in the database with the artwork URL
            // Only if the artwork_url column exists
            if (artworkUrlSupported) {
              try {
                await songService.update(song.id, { artwork_url: artworkUrl });
                
                // Update local state
                setSongs(prevSongs => 
                  prevSongs.map(s => 
                    s.id === song.id ? { ...s, artwork_url: artworkUrl } : s
                  )
                );
              } catch (error: any) {
                // Check if the error is about missing artwork_url column
                if (error?.code === 'PGRST204' || error?.message?.includes('artwork_url')) {
                  console.warn('artwork_url column not found. Run the database migration to enable artwork storage.');
                  setArtworkUrlSupported(false);
                } else {
                  throw error;
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to load artwork for ${song.name}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const songData = {
        name: formData.name,
        author: formData.author,
        tabs_link: formData.tabsLink,
        video_link: formData.videoLink,
        comments: formData.comments,
        recording_link: formData.recordingLink || undefined,
        category: editingSong?.category || activeCategory
      };

      if (editingSong) {
        const updated = await songService.update(editingSong.id, songData);
        setSongs(songs.map(song => 
          song.id === editingSong.id ? updated : song
        ));
        setEditingSong(null);
      } else {
        const newSong = await songService.create(songData);
        setSongs([newSong, ...songs]);
        setIsAddingSong(false);
        
        // Load artwork for the new song
        loadArtworkForSongs([newSong]);
      }

      setFormData({ name: '', author: '', tabsLink: '', videoLink: '', comments: '', recordingLink: '' });
    } catch (error) {
      console.error('Error saving song:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setFormData({
      name: song.name,
      author: song.author,
      tabsLink: song.tabs_link,
      videoLink: song.video_link,
      comments: song.comments,
      recordingLink: song.recording_link || ''
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await songService.delete(id);
      setSongs(songs.filter(song => song.id !== id));
      setArtworkCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(id);
        return newCache;
      });
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', author: '', tabsLink: '', videoLink: '', comments: '', recordingLink: '' });
    setIsAddingSong(false);
    setEditingSong(null);
  };

  const moveSong = async (songId: string, newCategory: 'rehearsing' | 'want-to-learn' | 'studied' | 'recorded') => {
    try {
      const updated = await songService.update(songId, { category: newCategory });
      setSongs(songs.map(song => 
        song.id === songId ? updated : song
      ));
    } catch (error) {
      console.error('Error moving song:', error);
    }
  };

  const toggleVideo = (songId: string) => {
    console.log('Toggling video for song:', songId, 'Current expanded:', expandedVideoId);
    if (expandedVideoId === songId) {
      setExpandedVideoId(null);
    } else {
      setExpandedVideoId(songId);
    }
  };

  const refreshArtwork = async (song: Song) => {
    try {
      // Remove from cache first
      setArtworkCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(song.id);
        return newCache;
      });

      // Fetch new artwork from iTunes API
      const artwork = await musicService.getAlbumArtwork(song.name, song.author);
      if (artwork) {
        const artworkUrl = artwork.large;
        setArtworkCache(prev => new Map(prev).set(song.id, artworkUrl));
        
        // Try to update the song in the database with the new artwork URL
        if (artworkUrlSupported) {
          try {
            await songService.update(song.id, { artwork_url: artworkUrl });
            
            // Update local state
            setSongs(prevSongs => 
              prevSongs.map(s => 
                s.id === song.id ? { ...s, artwork_url: artworkUrl } : s
              )
            );
          } catch (error: any) {
            if (error?.code === 'PGRST204' || error?.message?.includes('artwork_url')) {
              setArtworkUrlSupported(false);
            } else {
              throw error;
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to refresh artwork for ${song.name}:`, error);
    }
  };

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleAuthorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, author: e.target.value }));
  }, []);

  const handleTabsLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, tabsLink: e.target.value }));
  }, []);

  const handleVideoLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, videoLink: e.target.value }));
  }, []);

  const handleRecordingLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, recordingLink: e.target.value }));
  }, []);

  const handleCommentsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, comments: e.target.value }));
  }, []);

  const renderSongForm = useCallback(() => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Song Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="author">Artist</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={handleAuthorChange}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tabs">Tabs Link</Label>
          <Input
            id="tabs"
            type="url"
            value={formData.tabsLink}
            onChange={handleTabsLinkChange}
            placeholder="https://tabs.ultimate-guitar.com/..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="video">Video Tutorial</Label>
          <Input
            id="video"
            type="url"
            value={formData.videoLink}
            onChange={handleVideoLinkChange}
            placeholder="https://youtube.com/..."
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="recording">Recording Link (Optional)</Label>
        <Input
          id="recording"
          type="url"
          value={formData.recordingLink}
          onChange={handleRecordingLinkChange}
          placeholder="https://soundcloud.com/..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comments">Notes</Label>
        <Textarea
          id="comments"
          value={formData.comments}
          onChange={handleCommentsChange}
          placeholder="Techniques, difficulty, progress notes..."
          rows={4}
          className="resize-none"
          required
        />
      </div>
      
      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {editingSong ? 'Update' : 'Add Song'}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  ), [formData, handleSubmit, saving, editingSong, resetForm, handleNameChange, handleAuthorChange, handleTabsLinkChange, handleVideoLinkChange, handleRecordingLinkChange, handleCommentsChange]);

  const SongCard = ({ song }: { song: Song }) => {
    const artworkUrl = artworkCache.get(song.id) || song.artwork_url;
    const isVideoExpanded = expandedVideoId === song.id;
    const youtubeId = extractYouTubeId(song.video_link);
    
    console.log('SongCard render:', song.name, 'isVideoExpanded:', isVideoExpanded, 'expandedVideoId:', expandedVideoId);
    
    return (
      <div className="tidal-card p-4 group overflow-hidden">
        {/* Main song info row */}
        <div className="flex items-center gap-4">
          {/* Album Artwork */}
          <div className="w-16 h-16 flex-shrink-0 bg-zinc-800 rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105">
            {artworkUrl ? (
              <ImageWithFallback
                src={artworkUrl}
                alt={`${song.name} by ${song.author}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="h-6 w-6 text-zinc-500" />
              </div>
            )}
          </div>
          
          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="truncate text-lg font-semibold text-white leading-none">{song.name}</h4>
            </div>
            <p className="truncate text-sm text-zinc-400 mb-2">{song.author}</p>
            {song.comments && (
              <p className="text-xs text-zinc-500 line-clamp-2">{song.comments}</p>
            )}
          </div>
          
          {/* Action Links */}
          <div className="flex items-center gap-2">
            <a 
              href={song.tabs_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors opacity-60 hover:opacity-100"
              title="Tabs"
            >
              <Link className="h-4 w-4 text-zinc-400" />
            </a>
            <button
              className={`p-2 rounded-lg transition-all duration-300 ${
                isVideoExpanded 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : 'hover:bg-zinc-800/50 opacity-60 hover:opacity-100'
              }`}
              onClick={() => toggleVideo(song.id)}
              title={isVideoExpanded ? "Hide Video" : "Show Video"}
            >
              <div className={`transition-all duration-300 ease-out ${isVideoExpanded ? 'rotate-180' : 'rotate-0'}`}>
                {isVideoExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <Video className="h-4 w-4 text-zinc-400" />}
              </div>
            </button>
            {song.recording_link && (
              <a 
                href={song.recording_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors opacity-60 hover:opacity-100"
                title="Recording"
              >
                <Mic className="h-4 w-4 text-zinc-400" />
              </a>
            )}
          </div>
          
          {/* Kebab Menu */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                <DropdownMenuItem onClick={() => handleEdit(song)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Song
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => refreshArtwork(song)}>
                  <Image className="h-4 w-4 mr-2" />
                  Refresh Artwork
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(song.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Song
                </DropdownMenuItem>
                
                {song.category !== 'recorded' && (
                  <>
                    <DropdownMenuSeparator />
                    {song.category !== 'rehearsing' && (
                      <DropdownMenuItem onClick={() => moveSong(song.id, 'rehearsing')}>
                        <Play className="h-4 w-4 mr-2" />
                        Move to Rehearsing
                      </DropdownMenuItem>
                    )}
                    {song.category !== 'want-to-learn' && (
                      <DropdownMenuItem onClick={() => moveSong(song.id, 'want-to-learn')}>
                        <Heart className="h-4 w-4 mr-2" />
                        Move to Want to Learn
                      </DropdownMenuItem>
                    )}
                    {song.category !== 'studied' && (
                      <DropdownMenuItem onClick={() => moveSong(song.id, 'studied')}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Move to Studied
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => moveSong(song.id, 'recorded')}>
                      <Star className="h-4 w-4 mr-2" />
                      Mark as Recorded
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded Video Section with Grid Animation */}
        <div 
          className={`grid transition-all duration-500 ease-out overflow-hidden ${
            isVideoExpanded 
              ? 'grid-rows-[1fr] opacity-100' 
              : 'grid-rows-[0fr] opacity-0'
          }`}
          style={{
            borderTop: isVideoExpanded ? '1px solid rgb(39 39 42 / 0.5)' : 'none'
          }}
        >
          <div className="min-h-0">
            <div className={`bg-muted/20 p-6 transition-all duration-400 ease-out ${
              isVideoExpanded 
                ? 'transform translate-y-0 opacity-100' 
                : 'transform -translate-y-4 opacity-0'
            }`}>
              {youtubeId ? (
                <div className={`aspect-video w-full rounded-lg overflow-hidden bg-black shadow-2xl transition-all duration-600 ease-out ${
                  isVideoExpanded 
                    ? 'scale-100 opacity-100' 
                    : 'scale-95 opacity-0'
                }`}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title={`${song.name} by ${song.author}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className={`aspect-video w-full rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center bg-muted/50 transition-all duration-600 ease-out ${
                  isVideoExpanded 
                    ? 'scale-100 opacity-100' 
                    : 'scale-95 opacity-0'
                }`}>
                  <div className="text-center space-y-2">
                    <Video className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Invalid YouTube URL</p>
                    <Button variant="outline" size="sm" asChild className="transition-transform duration-200 hover:scale-105">
                      <a href={song.video_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Link
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Edit Dialog */}
        <Dialog open={editingSong?.id === song.id} onOpenChange={(open) => {
          if (!open) setEditingSong(null);
        }}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit Song</DialogTitle>
              <DialogDescription>
                Update the details of this song.
              </DialogDescription>
            </DialogHeader>
            {renderSongForm()}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const getSongsByCategory = (category: string) => 
    songs.filter(song => song.category === category);

  const categoryTitles = {
    'rehearsing': 'Rehearsing',
    'want-to-learn': 'Want to Learn',
    'studied': 'Studied',
    'recorded': 'Recorded'
  };

  const categoryIcons = {
    'rehearsing': Play,
    'want-to-learn': Heart,
    'studied': BookOpen,
    'recorded': Star
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Artwork Migration Banner */}
      {!artworkUrlSupported && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Image className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-500 mb-1">Album Artwork Available</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Album artwork is loading but won't be saved until you update your database schema.
                </p>
                <div className="text-xs space-y-1">
                  <p className="font-medium text-blue-500">To enable persistent artwork storage:</p>
                  <p className="text-muted-foreground">
                    Run this SQL in your Supabase SQL Editor:
                  </p>
                  <code className="block bg-muted p-2 rounded text-xs mt-1">
                    ALTER TABLE songs ADD COLUMN IF NOT EXISTS artwork_url TEXT;
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Song Collection</h2>
          <p className="text-zinc-400 mt-1">Organize your musical journey</p>
        </div>
        <button 
          onClick={() => setIsAddingSong(true)}
          className="tidal-button px-6 py-3 flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Song
        </button>
        
        {/* Dialog for adding song */}
        {isAddingSong && (
          <Dialog open={isAddingSong} onOpenChange={setIsAddingSong}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Song</DialogTitle>
              <DialogDescription>
                Add a new song to your repertoire.
              </DialogDescription>
            </DialogHeader>
              {renderSongForm()}
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rehearsing" onValueChange={(value) => setActiveCategory(value as any)}>
        <div className="flex gap-2 p-1 rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800">
          {(['rehearsing', 'want-to-learn', 'studied', 'recorded'] as const).map((category) => {
            const Icon = categoryIcons[category];
            const count = getSongsByCategory(category).length;
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff6b35] data-[state=active]:to-[#e53e3e] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 rounded-xl px-4 py-3 transition-all duration-300 hover:bg-zinc-800/50 text-zinc-400 hover:text-white font-medium"
              >
                <Icon className="h-4 w-4 mr-2" />
                {categoryTitles[category]} ({count})
              </TabsTrigger>
            );
          })}
        </div>

        {(['rehearsing', 'want-to-learn', 'studied', 'recorded'] as const).map(category => (
          <TabsContent key={category} value={category} className="space-y-2 mt-6">
            <div className="space-y-1">
              {getSongsByCategory(category).map(song => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
            
            {getSongsByCategory(category).length === 0 && (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e53e3e] opacity-20 blur-xl"></div>
                  <div className="relative p-6 rounded-full bg-zinc-900/50 border border-zinc-800">
                    {React.createElement(categoryIcons[category], { className: "h-12 w-12 text-zinc-400" })}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No songs yet</h3>
                <p className="text-zinc-400 mb-8 text-lg">
                  Add your first {categoryTitles[category].toLowerCase()} song.
                </p>
                <button 
                  onClick={() => setIsAddingSong(true)}
                  className="tidal-button px-8 py-4 text-lg"
                >
                  Add Song
                </button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Check, Music, Search, X } from 'lucide-react';
import { Song } from '../../lib/supabase';
import { cn } from './utils';

interface SongSelectorProps {
  availableSongs: Song[];
  selectedSongIds: string[];
  onSelectionChange: (songIds: string[]) => void;
  className?: string;
}

export function SongSelector({ 
  availableSongs, 
  selectedSongIds, 
  onSelectionChange, 
  className 
}: SongSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSongs = availableSongs.filter(song =>
    song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSongs = availableSongs.filter(song => 
    selectedSongIds.includes(song.id)
  );

  const toggleSong = (songId: string) => {
    if (selectedSongIds.includes(songId)) {
      onSelectionChange(selectedSongIds.filter(id => id !== songId));
    } else {
      onSelectionChange([...selectedSongIds, songId]);
    }
  };

  const removeSong = (songId: string) => {
    onSelectionChange(selectedSongIds.filter(id => id !== songId));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selected Songs Display */}
      {selectedSongs.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            Selected Songs ({selectedSongs.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedSongs.map(song => (
              <div
                key={song.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg text-sm"
              >
                <Music className="h-3 w-3 text-orange-400" />
                <span className="text-white font-medium">{song.name}</span>
                <span className="text-zinc-400">by {song.author}</span>
                <button
                  type="button"
                  onClick={() => removeSong(song.id)}
                  className="ml-1 p-0.5 rounded hover:bg-red-500/20 transition-colors"
                >
                  <X className="h-3 w-3 text-zinc-400 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Song Selector */}
      <div className="relative">
        <label className="text-sm font-medium text-zinc-300 mb-2 block">
          Songs Practiced
        </label>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm transition-all duration-200 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
        >
          <span className="text-zinc-400">
            {selectedSongs.length === 0 
              ? "Select songs practiced in this lesson..." 
              : `${selectedSongs.length} song${selectedSongs.length !== 1 ? 's' : ''} selected`
            }
          </span>
          <Search className="h-4 w-4 text-zinc-500" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search songs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                />
              </div>
            </div>

            {/* Song List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredSongs.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 text-sm">
                  {searchTerm ? 'No songs found' : 'No songs in repertoire'}
                </div>
              ) : (
                filteredSongs.map(song => {
                  const isSelected = selectedSongIds.includes(song.id);
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => toggleSong(song.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-b-0",
                        isSelected && "bg-orange-500/10 border-orange-500/20"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        isSelected 
                          ? "bg-orange-500 border-orange-500" 
                          : "border-zinc-600 hover:border-zinc-500"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium truncate",
                            isSelected ? "text-white" : "text-zinc-300"
                          )}>
                            {song.name}
                          </span>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full",
                            song.category === 'rehearsing' && "bg-blue-500/20 text-blue-400",
                            song.category === 'want-to-learn' && "bg-purple-500/20 text-purple-400",
                            song.category === 'studied' && "bg-green-500/20 text-green-400",
                            song.category === 'recorded' && "bg-yellow-500/20 text-yellow-400"
                          )}>
                            {song.category.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">by {song.author}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Close Button */}
            <div className="p-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
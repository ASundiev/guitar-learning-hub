import { createClient } from '@supabase/supabase-js';

// Your Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hhvbejmurxkdejmvxdgw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodmJlam11cnhrZGVqbXZ4ZGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjM3NjMsImV4cCI6MjA2NDg5OTc2M30.OgOaJPMpGZIbYjcbGGqNhhwPNHZLbtsg5KR9JdvGCp4';

// Check if we have valid Supabase configuration
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                             supabaseAnonKey !== 'placeholder-key' &&
                             supabaseUrl.includes('supabase.co') &&
                             supabaseUrl.startsWith('https://');

export const supabase = isSupabaseConfigured ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  null;

// Database table types
export interface Lesson {
  id: string;
  date: string;
  remaining_lessons: number;
  notes: string;
  created_at?: string;
  updated_at?: string;
  songs?: LessonSong[];
}

export interface LessonSong {
  id: string;
  name: string;
  author: string;
  category: 'rehearsing' | 'want-to-learn' | 'studied' | 'recorded';
  artwork_url?: string;
}

export interface LessonSongRelation {
  id: string;
  lesson_id: string;
  song_id: string;
  created_at?: string;
}

export interface Song {
  id: string;
  name: string;
  author: string;
  tabs_link: string;
  video_link: string;
  comments: string;
  recording_link?: string;
  artwork_url?: string;
  category: 'rehearsing' | 'want-to-learn' | 'studied' | 'recorded';
  created_at?: string;
  updated_at?: string;
}

// Mock data for when Supabase is not configured
let mockLessons: Lesson[] = [];
let mockSongs: Song[] = [];
let mockLessonSongs: LessonSongRelation[] = [];

// Helper function to generate IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Helper function to get lessons with songs for mock data
const getMockLessonsWithSongs = (): Lesson[] => {
  return mockLessons.map(lesson => ({
    ...lesson,
    songs: mockLessonSongs
      .filter(ls => ls.lesson_id === lesson.id)
      .map(ls => {
        const song = mockSongs.find(s => s.id === ls.song_id);
        return song ? {
          id: song.id,
          name: song.name,
          author: song.author,
          category: song.category,
          artwork_url: song.artwork_url
        } : null;
      })
      .filter(Boolean) as LessonSong[]
  }));
};

// Lesson database operations
export const lessonService = {
  async getAll(): Promise<Lesson[]> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Using mock data. See SUPABASE_SETUP.md for setup instructions.');
      return getMockLessonsWithSongs();
    }

    try {
      // Try to use the view first (if migration has been run)
      const { data, error } = await supabase!
        .from('lessons_with_songs')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      // If view doesn't exist, fall back to manual join
      console.warn('lessons_with_songs view not found, using fallback query. Run the database migration to improve performance.');
      
      const { data: lessons, error: lessonsError } = await supabase!
        .from('lessons')
        .select('*')
        .order('date', { ascending: false });
      
      if (lessonsError) throw lessonsError;
      
      // Get songs for each lesson
      const lessonsWithSongs = await Promise.all(
        (lessons || []).map(async (lesson) => {
          try {
            const { data: lessonSongs, error: songsError } = await supabase!
              .from('lesson_songs')
              .select(`
                song_id,
                songs!inner (
                  id,
                  name,
                  author,
                  category,
                  artwork_url
                )
              `)
              .eq('lesson_id', lesson.id);
            
            if (songsError) {
              // lesson_songs table might not exist yet
              console.warn('lesson_songs table not found, returning lesson without songs');
              return { ...lesson, songs: [] };
            }
            
            const songs = lessonSongs?.map(ls => (ls as any).songs) || [];
            return { ...lesson, songs };
          } catch {
            return { ...lesson, songs: [] };
          }
        })
      );
      
      return lessonsWithSongs;
    }
  },

  async create(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>, songIds: string[] = []): Promise<Lesson> {
    if (!isSupabaseConfigured) {
      const newLesson: Lesson = {
        ...lesson,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        songs: []
      };
      mockLessons = [newLesson, ...mockLessons];
      
      // Add song relationships
      for (const songId of songIds) {
        mockLessonSongs.push({
          id: generateId(),
          lesson_id: newLesson.id,
          song_id: songId,
          created_at: new Date().toISOString()
        });
      }
      
      return getMockLessonsWithSongs().find(l => l.id === newLesson.id)!;
    }

    // Create lesson
    const { data: lessonData, error: lessonError } = await supabase!
      .from('lessons')
      .insert([{
        date: lesson.date,
        remaining_lessons: lesson.remaining_lessons,
        notes: lesson.notes
      }])
      .select()
      .single();
    
    if (lessonError) throw lessonError;
    
    // Add song relationships
    if (songIds.length > 0) {
      try {
        const { error: relationError } = await supabase!
          .from('lesson_songs')
          .insert(songIds.map(songId => ({
            lesson_id: lessonData.id,
            song_id: songId
          })));
        
        if (relationError) {
          console.warn('lesson_songs table not found, skipping song relationships');
        }
      } catch (error) {
        console.warn('Failed to add song relationships:', error);
      }
    }
    
    // Return lesson with songs (try view first, then fallback)
    try {
      const { data: fullLesson, error: fetchError } = await supabase!
        .from('lessons_with_songs')
        .select('*')
        .eq('id', lessonData.id)
        .single();
      
      if (fetchError) throw fetchError;
      return fullLesson;
    } catch {
      // Fallback to basic lesson data
      return { ...lessonData, songs: [] };
    }
  },

  async update(id: string, lesson: Partial<Lesson>, songIds?: string[]): Promise<Lesson> {
    if (!isSupabaseConfigured) {
      const index = mockLessons.findIndex(l => l.id === id);
      if (index === -1) throw new Error('Lesson not found');
      
      const updated = {
        ...mockLessons[index],
        date: lesson.date || mockLessons[index].date,
        remaining_lessons: lesson.remaining_lessons !== undefined ? lesson.remaining_lessons : mockLessons[index].remaining_lessons,
        notes: lesson.notes || mockLessons[index].notes,
        updated_at: new Date().toISOString()
      };
      mockLessons[index] = updated;
      
      // Update song relationships if provided
      if (songIds !== undefined) {
        // Remove existing relationships
        mockLessonSongs = mockLessonSongs.filter(ls => ls.lesson_id !== id);
        
        // Add new relationships
        for (const songId of songIds) {
          mockLessonSongs.push({
            id: generateId(),
            lesson_id: id,
            song_id: songId,
            created_at: new Date().toISOString()
          });
        }
      }
      
      return getMockLessonsWithSongs().find(l => l.id === id)!;
    }

    // Update lesson
    const { data: lessonData, error: lessonError } = await supabase!
      .from('lessons')
      .update({
        date: lesson.date,
        remaining_lessons: lesson.remaining_lessons,
        notes: lesson.notes
      })
      .eq('id', id)
      .select()
      .single();
    
    if (lessonError) throw lessonError;
    
    // Update song relationships if provided
    if (songIds !== undefined) {
      try {
        // Remove existing relationships
        const { error: deleteError } = await supabase!
          .from('lesson_songs')
          .delete()
          .eq('lesson_id', id);
        
        if (deleteError) {
          console.warn('lesson_songs table not found, skipping song relationship update');
        } else {
          // Add new relationships
          if (songIds.length > 0) {
            const { error: insertError } = await supabase!
              .from('lesson_songs')
              .insert(songIds.map(songId => ({
                lesson_id: id,
                song_id: songId
              })));
            
            if (insertError) {
              console.warn('Failed to update song relationships:', insertError);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to update song relationships:', error);
      }
    }
    
    // Return lesson with songs (try view first, then fallback)
    try {
      const { data: fullLesson, error: fetchError } = await supabase!
        .from('lessons_with_songs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      return fullLesson;
    } catch {
      // Fallback to basic lesson data
      return { ...lessonData, songs: [] };
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      mockLessons = mockLessons.filter(l => l.id !== id);
      mockLessonSongs = mockLessonSongs.filter(ls => ls.lesson_id !== id);
      return;
    }

    const { error } = await supabase!
      .from('lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Song database operations
export const songService = {
  async getAll(): Promise<Song[]> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Using mock data. See SUPABASE_SETUP.md for setup instructions.');
      return mockSongs;
    }

    const { data, error } = await supabase!
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<Song> {
    if (!isSupabaseConfigured) {
      const newSong: Song = {
        ...song,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockSongs = [newSong, ...mockSongs];
      return newSong;
    }

    const { data, error } = await supabase!
      .from('songs')
      .insert([song])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, song: Partial<Song>): Promise<Song> {
    if (!isSupabaseConfigured) {
      const index = mockSongs.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Song not found');
      
      const updated = {
        ...mockSongs[index],
        ...song,
        updated_at: new Date().toISOString()
      };
      mockSongs[index] = updated;
      return updated;
    }

    const { data, error } = await supabase!
      .from('songs')
      .update(song)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      mockSongs = mockSongs.filter(s => s.id !== id);
      return;
    }

    const { error } = await supabase!
      .from('songs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Export configuration status for UI components
export const isConfigured = isSupabaseConfigured;
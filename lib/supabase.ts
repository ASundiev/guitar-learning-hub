import { createClient } from '@supabase/supabase-js';

// Your Supabase project credentials
const supabaseUrl = 'https://hhvbejmurxkdejmvxdgw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodmJlam11cnhrZGVqbXZ4ZGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjM3NjMsImV4cCI6MjA2NDg5OTc2M30.OgOaJPMpGZIbYjcbGGqNhhwPNHZLbtsg5KR9JdvGCp4';

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

// Helper function to generate IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Lesson database operations
export const lessonService = {
  async getAll(): Promise<Lesson[]> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Using mock data. See SUPABASE_SETUP.md for setup instructions.');
      return mockLessons;
    }

    const { data, error } = await supabase!
      .from('lessons')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson> {
    if (!isSupabaseConfigured) {
      const newLesson: Lesson = {
        ...lesson,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockLessons = [newLesson, ...mockLessons];
      return newLesson;
    }

    const { data, error } = await supabase!
      .from('lessons')
      .insert([lesson])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
    if (!isSupabaseConfigured) {
      const index = mockLessons.findIndex(l => l.id === id);
      if (index === -1) throw new Error('Lesson not found');
      
      const updated = {
        ...mockLessons[index],
        ...lesson,
        updated_at: new Date().toISOString()
      };
      mockLessons[index] = updated;
      return updated;
    }

    const { data, error } = await supabase!
      .from('lessons')
      .update(lesson)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      mockLessons = mockLessons.filter(l => l.id !== id);
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
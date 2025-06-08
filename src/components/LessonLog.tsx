import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Calendar, Plus, Edit2, Trash2, Loader2, MoreHorizontal } from 'lucide-react';
import { lessonService, type Lesson } from '../lib/supabase';

interface LessonForm {
  date: string;
  remainingLessons: string;
  notes: string;
}

export function LessonLog() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<LessonForm>({
    date: '',
    remainingLessons: '',
    notes: ''
  });

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await lessonService.getAll();
      setLessons(data);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const lessonData = {
        date: formData.date,
        remaining_lessons: parseInt(formData.remainingLessons),
        notes: formData.notes
      };

      if (editingLesson) {
        const updated = await lessonService.update(editingLesson.id, lessonData);
        setLessons(lessons.map(lesson => 
          lesson.id === editingLesson.id ? updated : lesson
        ));
        setEditingLesson(null);
      } else {
        const newLesson = await lessonService.create(lessonData);
        setLessons([newLesson, ...lessons]);
        setIsAddingLesson(false);
      }

      setFormData({ date: '', remainingLessons: '', notes: '' });
    } catch (error) {
      console.error('Error saving lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      date: lesson.date,
      remainingLessons: lesson.remaining_lessons.toString(),
      notes: lesson.notes
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await lessonService.delete(id);
      setLessons(lessons.filter(lesson => lesson.id !== id));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const resetForm = () => {
    setFormData({ date: '', remainingLessons: '', notes: '' });
    setIsAddingLesson(false);
    setEditingLesson(null);
  };

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  }, []);

  const handleRemainingLessonsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, remainingLessons: e.target.value }));
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  }, []);

  const renderLessonForm = useCallback(() => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={handleDateChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="remaining">Remaining Lessons</Label>
          <Input
            id="remaining"
            type="number"
            min="0"
            value={formData.remainingLessons}
            onChange={handleRemainingLessonsChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={handleNotesChange}
          placeholder="What did you work on? Techniques, songs, goals..."
          rows={6}
          className="resize-none"
          required
        />
      </div>
      
      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {editingLesson ? 'Update' : 'Add Lesson'}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  ), [formData, handleSubmit, saving, editingLesson, resetForm, handleDateChange, handleRemainingLessonsChange, handleNotesChange]);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Lesson History</h2>
          <p className="text-zinc-400 mt-1">Track your guitar learning progress</p>
        </div>
        <button 
          onClick={() => setIsAddingLesson(true)}
          className="tidal-button px-6 py-3 flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Lesson
        </button>
        
        {/* Dialog for adding lesson */}
        {isAddingLesson && (
          <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Lesson</DialogTitle>
                <DialogDescription>
                  Record details about your latest guitar lesson.
                </DialogDescription>
              </DialogHeader>
              {renderLessonForm()}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lessons */}
      <div className="space-y-6">
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="tidal-card p-6 group">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-semibold text-white">
                  {new Date(lesson.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400 text-sm">
                    {lesson.remaining_lessons} lessons remaining
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-1 text-xs bg-gradient-to-r from-[#ff6b35] to-[#e53e3e] text-white rounded-full font-medium">
                      Latest
                    </span>
                  )}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-zinc-800">
                    <DropdownMenuItem onClick={() => handleEdit(lesson)} className="text-zinc-300 hover:bg-zinc-800">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Lesson
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(lesson.id)}
                      className="text-red-400 hover:bg-red-900/20 focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Lesson
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-zinc-300 leading-relaxed">{lesson.notes}</p>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editingLesson?.id === lesson.id} onOpenChange={(open) => {
              if (!open) setEditingLesson(null);
            }}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Lesson</DialogTitle>
                  <DialogDescription>
                    Update the details of this lesson.
                  </DialogDescription>
                </DialogHeader>
                {renderLessonForm()}
              </DialogContent>
            </Dialog>
          </div>
        ))}
        
        {lessons.length === 0 && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e53e3e] opacity-20 blur-xl"></div>
              <div className="relative p-6 rounded-full bg-zinc-900/50 border border-zinc-800">
                <Calendar className="h-12 w-12 text-zinc-400" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">No lessons yet</h3>
            <p className="text-zinc-400 mb-8 text-lg">
              Start tracking your guitar lessons to monitor progress.
            </p>
            <button 
              onClick={() => setIsAddingLesson(true)}
              className="tidal-button px-8 py-4 text-lg"
            >
              Add Your First Lesson
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
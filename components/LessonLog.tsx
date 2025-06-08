import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
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

  const LessonForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, remainingLessons: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
  );

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
          <h2 className="text-[24px]">Lesson History</h2>
        </div>
        <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Lesson</DialogTitle>
              <DialogDescription>
                Record details about your latest guitar lesson.
              </DialogDescription>
            </DialogHeader>
            <LessonForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <Card key={lesson.id} className="group hover:border-primary/30 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">
                    {new Date(lesson.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardTitle>
                  <CardDescription>
                    {lesson.remaining_lessons} lessons remaining
                  </CardDescription>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleEdit(lesson)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Lesson
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(lesson.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Lesson
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{lesson.notes}</p>
              {index === 0 && (
                <Badge variant="secondary" className="mt-4">
                  Latest
                </Badge>
              )}
            </CardContent>

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
                <LessonForm />
              </DialogContent>
            </Dialog>
          </Card>
        ))}
        
        {lessons.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No lessons yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your guitar lessons to monitor progress.
              </p>
              <Button onClick={() => setIsAddingLesson(true)}>
                Add Your First Lesson
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
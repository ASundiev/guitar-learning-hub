import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Music, BookOpen, Guitar } from 'lucide-react';
import { LessonLog } from './components/LessonLog';
import { Repertoire } from './components/Repertoire';
import { SetupBanner } from './components/SetupBanner';

export default function App() {
  const [activeSection, setActiveSection] = useState<'lessons' | 'repertoire'>('lessons');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Guitar className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-foreground">Guitar Learning Hub</h1>
                <p className="text-muted-foreground mt-1">
                  Track lessons and manage your repertoire
                </p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex items-center gap-8">
              <button
                onClick={() => setActiveSection('lessons')}
                className={`text-sm transition-colors duration-200 hover:text-foreground ${
                  activeSection === 'lessons' 
                    ? 'text-foreground border-b-2 border-primary pb-1' 
                    : 'text-muted-foreground'
                }`}
              >
                Lessons
              </button>
              <button
                onClick={() => setActiveSection('repertoire')}
                className={`text-sm transition-colors duration-200 hover:text-foreground ${
                  activeSection === 'repertoire' 
                    ? 'text-foreground border-b-2 border-primary pb-1' 
                    : 'text-muted-foreground'
                }`}
              >
                Repertoire
              </button>
            </nav>
          </div>
          
          {/* Setup Banner */}
          <SetupBanner />
        </div>

        {/* Content */}
        {activeSection === 'lessons' && <LessonLog />}
        {activeSection === 'repertoire' && <Repertoire />}
      </div>
    </div>
  );
}
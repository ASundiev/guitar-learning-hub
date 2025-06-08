import React, { useState } from 'react';
import { Guitar } from 'lucide-react';
import { LessonLog } from './components/LessonLog';
import { Repertoire } from './components/Repertoire';
import { SetupBanner } from './components/SetupBanner';

export default function App() {
  const [activeSection, setActiveSection] = useState<'lessons' | 'repertoire'>('lessons');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--primary)', opacity: 0.1, border: '1px solid var(--primary)' }}>
                <Guitar className="h-8 w-8" style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Guitar Learning Hub</h1>
                <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  Track lessons and manage your repertoire
                </p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex items-center gap-8">
              <button
                onClick={() => setActiveSection('lessons')}
                className="text-sm transition-colors duration-200 pb-1"
                style={{
                  color: activeSection === 'lessons' ? 'var(--foreground)' : 'var(--muted-foreground)',
                  borderBottom: activeSection === 'lessons' ? '2px solid var(--primary)' : 'none'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'var(--foreground)'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = activeSection === 'lessons' ? 'var(--foreground)' : 'var(--muted-foreground)'}
              >
                Lessons
              </button>
              <button
                onClick={() => setActiveSection('repertoire')}
                className="text-sm transition-colors duration-200 pb-1"
                style={{
                  color: activeSection === 'repertoire' ? 'var(--foreground)' : 'var(--muted-foreground)',
                  borderBottom: activeSection === 'repertoire' ? '2px solid var(--primary)' : 'none'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'var(--foreground)'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = activeSection === 'repertoire' ? 'var(--foreground)' : 'var(--muted-foreground)'}
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
import React, { useState } from 'react';
import { Guitar } from 'lucide-react';
import { LessonLog } from './components/LessonLog';
import { Repertoire } from './components/Repertoire';
import { SetupBanner } from './components/SetupBanner';

export default function App() {
  const [activeSection, setActiveSection] = useState<'lessons' | 'repertoire'>('lessons');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 border border-blue-200">
                <Guitar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Guitar Learning Hub</h1>
                <p className="text-gray-600 mt-1">
                  Track lessons and manage your repertoire
                </p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex items-center gap-8">
              <button
                onClick={() => setActiveSection('lessons')}
                className={`text-sm transition-colors duration-200 hover:text-gray-900 ${
                  activeSection === 'lessons' 
                    ? 'text-gray-900 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-600'
                }`}
              >
                Lessons
              </button>
              <button
                onClick={() => setActiveSection('repertoire')}
                className={`text-sm transition-colors duration-200 hover:text-gray-900 ${
                  activeSection === 'repertoire' 
                    ? 'text-gray-900 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-600'
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
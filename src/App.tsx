import { useState } from 'react';
import { Guitar } from 'lucide-react';
import { LessonLog } from './components/LessonLog';
import { Repertoire } from './components/Repertoire';
import { SetupBanner } from './components/SetupBanner';

export default function App() {
  const [activeSection, setActiveSection] = useState<'lessons' | 'repertoire'>('lessons');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d0f] via-[#161618] to-[#0d0d0f]">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {/* Logo and Title */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#e53e3e] opacity-20 blur-xl"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#e53e3e]">
                  <Guitar className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">Guitar Learning Hub</h1>
                <p className="text-lg text-zinc-400 font-medium">
                  Track lessons and manage your repertoire
                </p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800">
              <button
                onClick={() => setActiveSection('lessons')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeSection === 'lessons'
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#e53e3e] text-white shadow-lg shadow-orange-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                Lessons
              </button>
              <button
                onClick={() => setActiveSection('repertoire')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeSection === 'repertoire'
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#e53e3e] text-white shadow-lg shadow-orange-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                Repertoire
              </button>
            </nav>
          </div>
          
          {/* Setup Banner */}
          <SetupBanner />
        </header>

        {/* Content */}
        <main className="relative">
          {activeSection === 'lessons' && <LessonLog />}
          {activeSection === 'repertoire' && <Repertoire />}
        </main>
      </div>
    </div>
  );
}
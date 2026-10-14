import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Sparkles,
  Timer,
  Layers,
  GraduationCap,
  Plus,
  Settings,
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'schedule'
  | 'syllabus'
  | 'ai-architect'
  | 'focus'
  | 'flashcards'
  | 'exams';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewSessionModal: () => void;
  onOpenSettingsModal: () => void;
  avatarUrl: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewSessionModal,
  onOpenSettingsModal,
  avatarUrl,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'schedule', label: 'Timetable', icon: <Calendar className="w-4 h-4" /> },
    { id: 'syllabus', label: 'Syllabus & Courses', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ai-architect', label: 'AI Study Architect', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'focus', label: 'Focus Room', icon: <Timer className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'exams', label: 'Exams & Deadlines', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark (single element) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm group-hover:bg-slate-800 transition-colors">
                Sc
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Schedulr
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & User Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewSessionModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-md transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              New Study Session
            </button>

            <button
              onClick={onOpenSettingsModal}
              title="Settings & Data Backup"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Avatar */}
            <div className="hidden sm:flex items-center pl-1 border-l border-slate-200">
              <img
                src={avatarUrl}
                alt="Sarah Chen"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Nav overflow scroll */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2.5 pt-0.5 border-t border-slate-100">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Subject, StudySession } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle2,
  Play,
  Calendar as CalendarIcon,
  Trash2,
  Filter,
} from 'lucide-react';

interface ScheduleCalendarProps {
  subjects: Subject[];
  sessions: StudySession[];
  onToggleSessionComplete: (sessionId: string) => void;
  onOpenNewSessionModal: (date?: string) => void;
  onStartFocusSession: (session: StudySession) => void;
  onDeleteSession: (sessionId: string) => void;
}

type CalendarViewMode = 'week' | 'day' | 'agenda';

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  subjects,
  sessions,
  onToggleSessionComplete,
  onOpenNewSessionModal,
  onStartFocusSession,
  onDeleteSession,
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  // Helper to format date as YYYY-MM-DD
  const formatDateKey = (d: Date): string => d.toISOString().split('T')[0];

  // Navigate dates
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') {
      next.setDate(next.getDate() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') {
      next.setDate(next.getDate() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get start of the current week (Monday)
  const getWeekDays = (baseDate: Date): Date[] => {
    const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(currentDate);

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (filterSubjectId !== 'all' && s.subjectId !== filterSubjectId) return false;
    if (filterStatus === 'pending' && s.completed) return false;
    if (filterStatus === 'completed' && !s.completed) return false;
    return true;
  });

  // Group filtered sessions by date
  const sessionsByDate = new Map<string, StudySession[]>();
  filteredSessions.forEach((s) => {
    const arr = sessionsByDate.get(s.date) || [];
    arr.push(s);
    sessionsByDate.set(s.date, arr);
  });

  const todayKey = formatDateKey(new Date());

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={handlePrev}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {viewMode === 'day'
              ? currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
              : `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </h2>
        </div>

        {/* Filters and View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Courses</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}: {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
          </select>

          {/* Segmented View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['week', 'day', 'agenda'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenNewSessionModal(formatDateKey(currentDate))}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Block
          </button>
        </div>
      </div>

      {/* Week View Grid */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 text-center">
            {weekDays.map((d) => {
              const dKey = formatDateKey(d);
              const isToday = dKey === todayKey;
              return (
                <div
                  key={dKey}
                  className={`py-3 px-2 border-r last:border-r-0 border-slate-200 ${
                    isToday ? 'bg-indigo-50/60' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div
                    className={`mt-1 text-sm font-bold font-mono tabular-nums inline-block px-2 py-0.5 rounded-full ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-900'
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 min-h-[480px] divide-x divide-slate-200">
            {weekDays.map((d) => {
              const dKey = formatDateKey(d);
              const daySessions = sessionsByDate.get(dKey) || [];
              const isToday = dKey === todayKey;

              return (
                <div
                  key={dKey}
                  className={`p-2 flex flex-col justify-between ${
                    isToday ? 'bg-indigo-50/20' : 'bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    {daySessions.map((session) => {
                      const sub = subjectMap.get(session.subjectId);
                      return (
                        <div
                          key={session.id}
                          className={`group p-2.5 rounded-lg border text-left transition-all ${
                            session.completed
                              ? 'bg-slate-50 border-slate-200 opacity-60'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                          style={{
                            borderLeftWidth: '3px',
                            borderLeftColor: sub?.color || '#64748b',
                          }}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                            <span>{session.startTime}</span>
                            <span>{session.durationMinutes}m</span>
                          </div>

                          <div
                            className={`text-xs font-semibold mt-1 tracking-tight line-clamp-2 ${
                              session.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {session.title}
                          </div>

                          <div className="mt-2 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onToggleSessionComplete(session.id)}
                              className="text-slate-400 hover:text-emerald-600 transition-colors"
                              title={session.completed ? 'Mark pending' : 'Mark done'}
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 ${
                                  session.completed ? 'text-emerald-600 fill-emerald-100' : ''
                                }`}
                              />
                            </button>

                            <div className="flex items-center gap-1">
                              {!session.completed && (
                                <button
                                  onClick={() => onStartFocusSession(session)}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                  title="Focus room"
                                >
                                  <Play className="w-3 h-3 fill-indigo-600" />
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteSession(session.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Delete session"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {daySessions.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Free Day
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenNewSessionModal(dKey)}
                    className="mt-2 w-full py-1 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100/60 rounded border border-dashed border-slate-200 transition-colors"
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-500">
                {(sessionsByDate.get(formatDateKey(currentDate)) || []).length} blocks scheduled
              </p>
            </div>
            <button
              onClick={() => onOpenNewSessionModal(formatDateKey(currentDate))}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Session
            </button>
          </div>

          <div className="space-y-3">
            {(sessionsByDate.get(formatDateKey(currentDate)) || []).map((session) => {
              const sub = subjectMap.get(session.subjectId);
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border transition-all ${
                    session.completed ? 'bg-slate-50 opacity-60 border-slate-200' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: sub?.color || '#3b82f6' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span style={{ color: sub?.color }} className="font-bold">
                          {sub?.code}
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.startTime} ({session.durationMinutes} min)
                        </span>
                        <span>·</span>
                        <span>{session.technique}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {session.title}
                      </h4>
                      {session.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">{session.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleSessionComplete(session.id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            session.completed ? 'text-emerald-600 fill-emerald-100' : ''
                          }`}
                        />
                      </button>
                      {!session.completed && (
                        <button
                          onClick={() => onStartFocusSession(session)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                        >
                          <Play className="w-3 h-3 fill-indigo-700" />
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {(sessionsByDate.get(formatDateKey(currentDate)) || []).length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No study blocks planned for this day. Click Add Session above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No matching sessions found with current filters.
            </div>
          ) : (
            filteredSessions
              .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
              .map((session) => {
                const sub = subjectMap.get(session.subjectId);
                const isPast = session.date < todayKey;
                const isToday = session.date === todayKey;

                return (
                  <div
                    key={session.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                      session.completed ? 'opacity-60 bg-slate-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={() => onToggleSessionComplete(session.id)}
                        className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            session.completed ? 'text-emerald-600 fill-emerald-100' : ''
                          }`}
                        />
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span
                            className="font-bold font-mono"
                            style={{ color: sub?.color || '#334155' }}
                          >
                            {sub?.code || 'Course'}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span
                            className={`font-mono tabular-nums ${
                              isToday
                                ? 'text-indigo-600 font-bold'
                                : isPast
                                ? 'text-slate-400'
                                : 'text-slate-600'
                            }`}
                          >
                            {session.date} at {session.startTime}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">{session.technique}</span>
                        </div>
                        <h4
                          className={`text-sm font-semibold tracking-tight ${
                            session.completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {session.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!session.completed && (
                        <button
                          onClick={() => onStartFocusSession(session)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          <Play className="w-3 h-3 fill-indigo-700" />
                          Focus ({session.durationMinutes}m)
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
};

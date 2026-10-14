import React from 'react';
import {
  Subject,
  StudySession,
  ExamItem,
  Flashcard,
  StudyLog,
  StudyGoalSettings,
} from '../types';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  Play,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface OverviewDashboardProps {
  subjects: Subject[];
  sessions: StudySession[];
  exams: ExamItem[];
  flashcards: Flashcard[];
  logs: StudyLog[];
  goals: StudyGoalSettings;
  onToggleSessionComplete: (sessionId: string) => void;
  onToggleChecklistTask: (sessionId: string, taskId: string) => void;
  onNavigateToTab: (tab: any) => void;
  onStartFocusSession: (session: StudySession) => void;
  onOpenNewSessionModal: () => void;
  bannerImg: string;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  subjects,
  sessions,
  exams,
  flashcards,
  logs,
  goals,
  onToggleSessionComplete,
  onToggleChecklistTask,
  onNavigateToTab,
  onStartFocusSession,
  onOpenNewSessionModal,
  bannerImg,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Sessions for today
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const completedTodaySessions = todaySessions.filter((s) => s.completed);

  // Today's total logged minutes from logs
  const todayLogs = logs.filter((l) => l.date === todayStr);
  const todayMinutesLogged = todayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);

  // Weekly logged hours (last 7 days)
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyLogs = logs.filter((l) => past7Days.includes(l.date));
  const weeklyHoursLogged = Math.round((weeklyLogs.reduce((acc, l) => acc + l.durationMinutes, 0) / 60) * 10) / 10;
  const weeklyProgressPercent = Math.min(100, Math.round((weeklyHoursLogged / goals.weeklyHoursTarget) * 100));

  // Nearest upcoming exam
  const upcomingExams = [...exams]
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextExam = upcomingExams[0];

  // Calculate days remaining to next exam
  const daysToNextExam = nextExam
    ? Math.max(0, Math.ceil((new Date(nextExam.date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const nextExamSubject = nextExam ? subjects.find((s) => s.id === nextExam.subjectId) : null;

  // Flashcards due today
  const cardsDueToday = flashcards.filter((f) => f.nextReviewDate <= todayStr).length;

  // Total topics mastered
  const allTopics = subjects.flatMap((s) => s.topics);
  const masteredTopics = allTopics.filter((t) => t.masteryLevel === 'mastered').length;
  const totalTopics = allTopics.length;
  const syllabusMasteryRate = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

  // Consecutive study streak (from logs dates)
  const uniqueLoggedDates = new Set(logs.map((l) => l.date));
  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (uniqueLoggedDates.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (streak === 0 && dStr === todayStr) {
      // It's today, might not have logged yet
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      {/* Hero Strip with Editorial Study Banner */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Academic Semester Term 1</span>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-600">Active Sprint</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Good morning, Sarah. You have{' '}
                <span className="text-indigo-600">{todaySessions.length - completedTodaySessions.length} study blocks</span>{' '}
                scheduled for today.
              </h1>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                Consistent spaced repetition in 50-minute blocks with deliberate recall yields
                maximum retention. Keep up your active study streak!
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Logged Today: <strong className="font-mono tabular-nums text-slate-900">{todayMinutesLogged} min</strong></span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Streak: <strong className="font-mono tabular-nums text-slate-900">{streak || 5} Days</strong></span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Cards Due: <strong className="font-mono tabular-nums text-slate-900">{cardsDueToday}</strong></span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 relative min-h-[200px]">
            <img
              src={bannerImg}
              alt="Clean morning study desk with open notebook"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Exam Countdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Next Examination</span>
              <GraduationCap className="w-4 h-4 text-indigo-500" />
            </div>
            {nextExam ? (
              <>
                <div className="text-xl font-bold tracking-tight text-slate-900 truncate">
                  {nextExam.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {nextExamSubject?.code || 'Exam'} · {nextExam.location}
                </div>
              </>
            ) : (
              <div className="text-sm font-medium text-slate-600">No pending exams</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Time remaining:</span>
            <span className="text-sm font-bold font-mono tabular-nums text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {daysToNextExam !== null ? `${daysToNextExam} Days` : '—'}
            </span>
          </div>
        </div>

        {/* Weekly Study Hours */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Weekly Effort Target</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {weeklyHoursLogged}
              </span>
              <span className="text-xs text-slate-500">/ {goals.weeklyHoursTarget} hrs target</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Weekly progress</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">{weeklyProgressPercent}%</span>
          </div>
        </div>

        {/* Syllabus Mastery */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Syllabus Mastery</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {syllabusMasteryRate}%
              </span>
              <span className="text-xs text-slate-500">
                ({masteredTopics} / {totalTopics} topics)
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${syllabusMasteryRate}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateToTab('syllabus')}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Review topics <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Spaced Flashcards */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Active Recall Cards</span>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {cardsDueToday}
              </span>
              <span className="text-xs text-slate-500">due for review today</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Daily active recall reinforces long-term neural pathways.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateToTab('flashcards')}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Start Drill Session <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Today's Sessions + Weekly Rhythm */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Today's Study Sessions */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Today’s Study Agenda</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                {' · '}{completedTodaySessions.length} of {todaySessions.length} completed
              </p>
            </div>
            <button
              onClick={onOpenNewSessionModal}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              + Add block
            </button>
          </div>

          {todaySessions.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-lg">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No study blocks planned for today</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Schedule a session manually or ask the AI Study Architect to auto-generate a syllabus roadmap.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={onOpenNewSessionModal}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
                >
                  Schedule Session
                </button>
                <button
                  onClick={() => onNavigateToTab('ai-architect')}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100"
                >
                  Generate Plan with AI
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => {
                const sub = subjectMap.get(session.subjectId);
                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border transition-all ${
                      session.completed
                        ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleSessionComplete(session.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                          title={session.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              session.completed
                                ? 'text-emerald-600 fill-emerald-100'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs font-bold"
                              style={{ color: sub?.color || '#334155' }}
                            >
                              {sub?.code || 'Course'}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1 font-mono tabular-nums">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {session.startTime} ({session.durationMinutes}m)
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-600 font-medium">
                              {session.technique}
                            </span>
                          </div>

                          <h3
                            className={`text-sm font-semibold tracking-tight ${
                              session.completed ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {session.title}
                          </h3>

                          {session.notes && (
                            <p className="text-xs text-slate-500 italic mt-0.5">
                              {session.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!session.completed && (
                          <button
                            onClick={() => onStartFocusSession(session)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                            title="Launch in Focus Room"
                          >
                            <Play className="w-3 h-3 fill-indigo-700" />
                            Focus
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Checklist Sub-tasks */}
                    {session.checklist && session.checklist.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 pl-8 space-y-1.5">
                        {session.checklist.map((task) => (
                          <label
                            key={task.id}
                            className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => onToggleChecklistTask(session.id, task.id)}
                              className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span className={task.completed ? 'line-through text-slate-400' : ''}>
                              {task.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Course Progress & High-Yield Strategy */}
        <div className="lg:col-span-4 space-y-6">
          {/* Course Status Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Courses</h3>
              <button
                onClick={() => onNavigateToTab('syllabus')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {subjects.map((sub) => {
                const total = sub.topics.length;
                const mastered = sub.topics.filter((t) => t.masteryLevel === 'mastered').length;
                const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

                return (
                  <div key={sub.id} className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color }}
                        ></div>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {sub.code}: {sub.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-500 font-semibold shrink-0">
                        {sub.targetGrade} target
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: sub.color }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Study Strategy Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Cognitive Mastery Strategy</span>
            </div>
            <h4 className="text-sm font-bold tracking-tight text-white mb-1.5">
              Spaced Blurting vs. Passive Re-reading
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Research demonstrates that taking 10 minutes to write down everything you remember onto a blank sheet
              yields 240% higher recall at 14 days than highlighting notes.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">Need a schedule revamp?</span>
              <button
                onClick={() => onNavigateToTab('ai-architect')}
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-colors"
              >
                Plan with AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

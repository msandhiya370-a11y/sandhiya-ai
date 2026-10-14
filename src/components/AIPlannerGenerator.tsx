import React, { useState } from 'react';
import { Subject, StudySession } from '../types';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Check,
} from 'lucide-react';

interface AIPlannerGeneratorProps {
  subjects: Subject[];
  initialSubjectName?: string;
  onApplyPlanToSchedule: (newSessions: StudySession[]) => void;
  onNavigateToTab: (tab: any) => void;
}

export const AIPlannerGenerator: React.FC<AIPlannerGeneratorProps> = ({
  subjects,
  initialSubjectName,
  onApplyPlanToSchedule,
  onNavigateToTab,
}) => {
  const defaultSubject =
    subjects.find((s) => s.name === initialSubjectName || s.code === initialSubjectName) ||
    subjects[0];

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    defaultSubject?.id || ''
  );
  const [examDate, setExamDate] = useState<string>(
    defaultSubject?.examDate || new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]
  );
  const [dailyHours, setDailyHours] = useState<number>(2.5);
  const [targetGrade, setTargetGrade] = useState<string>('A (4.0)');
  const [weakAreas, setWeakAreas] = useState<string>(
    'Difficulty recalling complex mechanisms from memory and timing on long-form exam questions.'
  );
  const [studyStyle, setStudyStyle] = useState<string>('Balanced Spaced Repetition');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject) return;

    setIsGenerating(true);
    setAppliedSuccess(false);

    try {
      const topicTitles = currentSubject.topics.map((t) => t.title);

      const response = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `${currentSubject.code}: ${currentSubject.name}`,
          examDate,
          dailyHours,
          targetGrade,
          syllabusTopics: topicTitles,
          weakAreas,
          studyStyle,
        }),
      });

      const data = await response.json();
      if (data.plan) {
        setGeneratedPlan(data.plan);
      }
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToCalendar = () => {
    if (!generatedPlan || !currentSubject) return;

    // Convert daily sessions into actual StudySession records starting tomorrow or today
    const newSessions: StudySession[] = [];
    const baseDate = new Date();

    let dayOffset = 0;
    generatedPlan.weeklyPlan.forEach((week: any) => {
      week.dailySessions.forEach((session: any, dIdx: number) => {
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(baseDate.getDate() + dayOffset);
        dayOffset++;

        const startTimeOptions = ['09:00', '11:00', '14:30', '16:00', '19:00'];
        const startTime = startTimeOptions[dIdx % startTimeOptions.length];

        newSessions.push({
          id: `sess-ai-${Date.now()}-${newSessions.length}`,
          subjectId: currentSubject.id,
          title: `${session.topic} (${session.technique})`,
          date: sessionDate.toISOString().split('T')[0],
          startTime,
          durationMinutes: session.minutes || 50,
          completed: false,
          technique: session.technique || 'Active Recall',
          checklist: (session.checklist || []).map((itemText: string, i: number) => ({
            id: `chk-ai-${Date.now()}-${newSessions.length}-${i}`,
            text: itemText,
            completed: false,
          })),
          notes: `Target: ${week.targetGoal || 'Mastery'}`,
        });
      });
    });

    onApplyPlanToSchedule(newSessions);
    setAppliedSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Algorithmic & AI Schedule Synthesis</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Intelligent Study Plan Architect
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Specify your course syllabus, target exam date, and daily study budget. Schedulr
            synthesizes a high-yield study calendar utilizing spaced repetition intervals and
            active retrieval sessions.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGeneratePlan} className="mt-6 space-y-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Course
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  const sub = subjects.find((s) => s.id === e.target.value);
                  if (sub?.examDate) setExamDate(sub.examDate);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code}: {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Exam / Milestone Date
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Study Budget (Hours/Day)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="flex-1 accent-slate-900"
                />
                <span className="text-xs font-bold font-mono tabular-nums text-slate-900 w-12 text-right">
                  {dailyHours}h
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Goal / Target Grade
              </label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="A+ (4.0) - High Distinction">A+ (4.0) - High Distinction</option>
                <option value="A (4.0) - Mastery">A (4.0) - Full Mastery</option>
                <option value="A- (3.7) - Strong Comprehension">A- (3.7) - Strong Comprehension</option>
                <option value="B+ (3.3) - Solid Performance">B+ (3.3) - Solid Performance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cognitive Study Technique
              </label>
              <select
                value={studyStyle}
                onChange={(e) => setStudyStyle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="Balanced Spaced Repetition">Balanced Spaced Repetition (Optimal for Long-Term)</option>
                <option value="Active Recall & Past Exam Simulation">Active Recall & Past Exam Simulation (High Yield)</option>
                <option value="Feynman Technique & Conceptual Clarity">Feynman Technique & Conceptual Clarity (Deep Theory)</option>
                <option value="Intensive Exam Cram Sprint">Intensive Exam Cram Sprint (Short Timeframe)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Weak Areas / Specific Challenges (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Derivations, enzyme regulation pathways, or multi-step synthesis mechanisms"
              value={weakAreas}
              onChange={(e) => setWeakAreas(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors shadow-xs"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Synthesizing Schedule...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Custom Study Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Study Plan Display */}
      {generatedPlan && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Plan Generated Successfully</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{generatedPlan.title}</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {generatedPlan.summary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {appliedSuccess ? (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                  <Check className="w-4 h-4" />
                  Added to Your Timetable!
                </div>
              ) : (
                <button
                  onClick={handleApplyToCalendar}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  Apply Plan to My Timetable
                </button>
              )}
            </div>
          </div>

          {/* High-Yield Tips Strip */}
          {generatedPlan.highYieldTips && generatedPlan.highYieldTips.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>High-Yield Cognitive Directives</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-900">
                {generatedPlan.highYieldTips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-600">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weeks Breakdown */}
          <div className="space-y-6">
            {generatedPlan.weeklyPlan.map((week: any) => (
              <div
                key={week.weekNumber}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Week {week.weekNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {week.focusTheme}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 italic">
                    Goal: {week.targetGoal}
                  </span>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {week.dailySessions.map((session: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-slate-800">{session.dayName}</span>
                        <span className="font-mono tabular-nums">{session.minutes}m</span>
                      </div>

                      <div className="text-xs font-semibold text-slate-900">
                        {session.topic}
                      </div>

                      <div className="text-xs text-indigo-600 font-medium bg-indigo-50/60 px-2 py-0.5 rounded inline-block">
                        {session.technique}
                      </div>

                      {session.checklist && session.checklist.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          {session.checklist.map((item: string, i: number) => (
                            <div key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                              <span className="text-slate-300 mt-0.5">□</span>
                              <span className="line-clamp-2">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {appliedSuccess && (
            <div className="p-4 bg-slate-900 text-white rounded-lg flex items-center justify-between">
              <span className="text-xs">
                All study blocks have been populated into your timetable and task agenda.
              </span>
              <button
                onClick={() => onNavigateToTab('schedule')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View in Timetable <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

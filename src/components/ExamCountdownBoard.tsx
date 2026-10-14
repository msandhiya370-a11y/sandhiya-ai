import React, { useState } from 'react';
import { Subject, ExamItem } from '../types';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ExamCountdownBoardProps {
  subjects: Subject[];
  exams: ExamItem[];
  onAddExam: (exam: ExamItem) => void;
  onDeleteExam: (examId: string) => void;
  onNavigateToAIArchitect: (subjectName: string) => void;
}

export const ExamCountdownBoard: React.FC<ExamCountdownBoardProps> = ({
  subjects,
  exams,
  onAddExam,
  onDeleteExam,
  onNavigateToAIArchitect,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [examTitle, setExamTitle] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState<string>('');
  const [examTime, setExamTime] = useState<string>('09:00');
  const [location, setLocation] = useState<string>('Lecture Hall A');
  const [weight, setWeight] = useState<number>(25);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [notes, setNotes] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) return;

    const newExam: ExamItem = {
      id: `ex-${Date.now()}`,
      subjectId,
      title: examTitle.trim(),
      date: examDate,
      time: examTime,
      location: location.trim() || 'TBD',
      weightPercentage: weight,
      priority,
      notes: notes.trim() || undefined,
    };

    onAddExam(newExam);
    setShowAddModal(false);
    setExamTitle('');
    setExamDate('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>High-Stakes Assessment Radar</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Examinations & Milestones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time countdowns paired with course syllabus readiness scores.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Examination
        </button>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedExams.map((exam) => {
          const sub = subjectMap.get(exam.subjectId);
          const daysRemaining = Math.ceil(
            (new Date(exam.date).getTime() - new Date(todayStr).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          // Calculate readiness (% of subject topics mastered or completed)
          const topics = sub?.topics || [];
          const masteredCount = topics.filter((t) => t.masteryLevel === 'mastered').length;
          const readinessRate =
            topics.length > 0 ? Math.round((masteredCount / topics.length) * 100) : 0;

          const isOverdue = daysRemaining < 0;
          const isToday = daysRemaining === 0;
          const isUrgent = daysRemaining > 0 && daysRemaining <= 5;

          return (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: sub?.color || '#3b82f6',
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold font-mono"
                      style={{ color: sub?.color || '#0f172a' }}
                    >
                      {sub?.code}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{sub?.name}</span>
                  </div>

                  <span
                    className={`text-xs font-bold font-mono tabular-nums px-2.5 py-1 rounded-md ${
                      isOverdue
                        ? 'bg-slate-100 text-slate-500'
                        : isToday
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : isUrgent
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {isOverdue
                      ? 'Completed'
                      : isToday
                      ? 'Today!'
                      : `${daysRemaining} Days Left`}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2 tracking-tight">
                  {exam.title}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.location}</span>
                  </div>
                  <div className="text-slate-700 font-semibold">
                    Weight: {exam.weightPercentage}% of Grade
                  </div>
                </div>

                {exam.notes && (
                  <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {exam.notes}
                  </p>
                )}

                {/* Syllabus Readiness Progress */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Syllabus Readiness</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {readinessRate}% ({masteredCount}/{topics.length} topics mastered)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${readinessRate}%`,
                        backgroundColor: sub?.color || '#4f46e5',
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigateToAIArchitect(sub?.name || '')}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Revision Sprint
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Remove ${exam.title}?`)) {
                      onDeleteExam(exam.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Delete Exam"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedExams.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No upcoming exams recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Log your midterms and finals to activate countdown tracking and automatic spaced revision intervals.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
          >
            Add First Exam
          </button>
        </div>
      )}

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Examination / Test</h3>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm 2: Kinetics & Thermodynamics"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall 401"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (% of final grade)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value, 10) || 25)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Guidelines / Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 1 cheat sheet allowed, scientific calculator required, closed book"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

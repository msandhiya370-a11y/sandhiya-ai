import React, { useState } from 'react';
import { Subject, StudySession, StudyTechnique } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface NewSessionModalProps {
  subjects: Subject[];
  initialDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (session: StudySession) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  subjects,
  initialDate,
  isOpen,
  onClose,
  onSaveSession,
}) => {
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(50);
  const [technique, setTechnique] = useState<StudyTechnique>('Active Recall');
  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Review key definitions and formulas',
    'Attempt 3 practice questions',
  ]);
  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([...checklistItems, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const newSession: StudySession = {
      id: `sess-manual-${Date.now()}`,
      subjectId,
      title: title.trim(),
      date,
      startTime,
      durationMinutes,
      completed: false,
      technique,
      checklist: checklistItems.map((text, i) => ({
        id: `chk-new-${Date.now()}-${i}`,
        text,
        completed: false,
      })),
      notes: notes.trim() || undefined,
    };

    onSaveSession(newSession);
    onClose();
    setTitle('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900">Schedule Study Block</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cognitive Technique</label>
              <select
                value={technique}
                onChange={(e) => setTechnique(e.target.value as StudyTechnique)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="Active Recall">Active Recall & Retrieval</option>
                <option value="Pomodoro">Pomodoro Drill (25/5)</option>
                <option value="Problem Solving">Problem Solving & Exercises</option>
                <option value="Feynman Technique">Feynman Technique (Teach Concept)</option>
                <option value="Blurting & Retrieval">Blurting & Closed-Book Map</option>
                <option value="Past Paper">Past Paper Simulation</option>
                <option value="Deep Reading">Deep Reading & Annotation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Topic / Objective</label>
            <input
              type="text"
              required
              placeholder="e.g. Master Aldol crossed condensation reaction pathways"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value={25}>25 min (1 Pomodoro)</option>
                <option value={45}>45 min</option>
                <option value={50}>50 min (Deep Work)</option>
                <option value={60}>60 min (1 hr)</option>
                <option value={90}>90 min (Intensive)</option>
                <option value={120}>120 min (2 hrs)</option>
              </select>
            </div>
          </div>

          {/* Checklist Tasks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Checklist Tasks for this Session
            </label>
            <div className="space-y-1.5 mb-2">
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <span className="text-slate-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add sub-task..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Focus on page 243-260, solve odd-numbered problems"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg resize-none focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
            >
              Save Session Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

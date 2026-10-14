import React, { useState } from 'react';
import { StudyGoalSettings } from '../types';
import { studyStorage } from '../utils/storage';
import { X, Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: StudyGoalSettings;
  onUpdateGoals: (goals: StudyGoalSettings) => void;
  onReloadAllData: () => void;
  avatarUrl: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  goals,
  onUpdateGoals,
  onReloadAllData,
  avatarUrl,
}) => {
  const [weeklyTarget, setWeeklyTarget] = useState<number>(goals.weeklyHoursTarget);
  const [dailyTarget, setDailyTarget] = useState<number>(goals.dailyHoursTarget);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...goals,
      weeklyHoursTarget: weeklyTarget,
      dailyHoursTarget: dailyTarget,
    };
    onUpdateGoals(updated);
    studyStorage.saveGoals(updated);
    setFeedbackMsg('Study goals updated successfully!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleExportBackup = () => {
    const json = studyStorage.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedulr_study_planner_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedbackMsg('Backup exported successfully.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = studyStorage.importBackup(content);
        if (success) {
          onReloadAllData();
          setFeedbackMsg('Backup restored successfully!');
          setTimeout(() => onClose(), 1200);
        } else {
          alert('Failed to parse backup JSON. Please check file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to the default semester template? Your custom changes will be replaced.')) {
      studyStorage.resetToDefault();
      onReloadAllData();
      setFeedbackMsg('Restored to default semester template.');
      setTimeout(() => onClose(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900">Settings & Data Management</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedbackMsg && (
          <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Profile Info */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-5">
          <img
            src={avatarUrl}
            alt="Sarah Chen"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-300"
          />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Sarah Chen</h4>
            <p className="text-[11px] text-slate-500">Molecular Biology & CS Major</p>
            <p className="text-[10px] text-indigo-600 font-medium">Semester Term 1 · Active</p>
          </div>
        </div>

        {/* Goals form */}
        <form onSubmit={handleSaveGoals} className="space-y-4 mb-6">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Study Target Budgets
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Weekly Target Hours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                max="60"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(parseInt(e.target.value, 10) || 20)}
                className="w-24 px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono tabular-nums"
              />
              <span className="text-xs text-slate-500">hours/week</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Target Hours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="12"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseInt(e.target.value, 10) || 3)}
                className="w-24 px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono tabular-nums"
              />
              <span className="text-xs text-slate-500">hours/day</span>
            </div>
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Save Target Budgets
          </button>
        </form>

        {/* Data Persistence & Backup */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Local Data Backup & Restore
          </h4>
          <p className="text-xs text-slate-500">
            All schedule entries, syllabus topics, flashcards, and timers are saved in your browser’s local storage.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON Backup
            </button>

            <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Default Semester Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

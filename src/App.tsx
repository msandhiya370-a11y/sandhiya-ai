import React, { useState, useEffect } from 'react';
import {
  Subject,
  StudySession,
  ExamItem,
  Flashcard,
  StudyLog,
  StudyGoalSettings,
} from './types';
import { studyStorage } from './utils/storage';
import { Header, ActiveTab } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { SyllabusManager } from './components/SyllabusManager';
import { AIPlannerGenerator } from './components/AIPlannerGenerator';
import { FocusTimer } from './components/FocusTimer';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ExamCountdownBoard } from './components/ExamCountdownBoard';
import { NewSessionModal } from './components/NewSessionModal';
import { SettingsModal } from './components/SettingsModal';
import { Check } from 'lucide-react';

// High-fidelity generated assets
const AVATAR_IMG = '/src/assets/images/avatar_student_scholar_1791952260374.jpg';
const STUDY_ROOM_IMG = '/src/assets/images/study_room_zenith_1791952261363.jpg';
const STUDY_NOTES_IMG = '/src/assets/images/study_material_notes_1791952260637.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Application state
  const [subjects, setSubjects] = useState<Subject[]>(() => studyStorage.loadSubjects());
  const [sessions, setSessions] = useState<StudySession[]>(() => studyStorage.loadSessions());
  const [exams, setExams] = useState<ExamItem[]>(() => studyStorage.loadExams());
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => studyStorage.loadFlashcards());
  const [logs, setLogs] = useState<StudyLog[]>(() => studyStorage.loadLogs());
  const [goals, setGoals] = useState<StudyGoalSettings>(() => studyStorage.loadGoals());

  // Modal & focus session triggers
  const [activeFocusSession, setActiveFocusSession] = useState<StudySession | null>(null);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState<string | undefined>(undefined);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [aiArchitectSubject, setAiArchitectSubject] = useState<string | undefined>(undefined);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to local storage
  useEffect(() => {
    studyStorage.saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    studyStorage.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    studyStorage.saveExams(exams);
  }, [exams]);

  useEffect(() => {
    studyStorage.saveFlashcards(flashcards);
  }, [flashcards]);

  useEffect(() => {
    studyStorage.saveLogs(logs);
  }, [logs]);

  // Handlers for sessions
  const handleToggleSessionComplete = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            showToast(`Completed: ${s.title}`);
          }
          return {
            ...s,
            completed: nextCompleted,
            checklist: s.checklist.map((c) => ({ ...c, completed: nextCompleted })),
          };
        }
        return s;
      })
    );
  };

  const handleToggleChecklistTask = (sessionId: string, taskId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const updatedChecklist = s.checklist.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          const allCompleted = updatedChecklist.every((t) => t.completed);
          return {
            ...s,
            checklist: updatedChecklist,
            completed: allCompleted,
          };
        }
        return s;
      })
    );
  };

  const handleAddSession = (newSession: StudySession) => {
    setSessions((prev) => [newSession, ...prev]);
    showToast('Session added to timetable!');
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('Session removed.');
  };

  const handleStartFocusSession = (session: StudySession) => {
    setActiveFocusSession(session);
    setActiveTab('focus');
  };

  // Handlers for subjects
  const handleUpdateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
    showToast(`Course added: ${newSubject.code}`);
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setSessions((prev) => prev.filter((s) => s.subjectId !== subjectId));
    setExams((prev) => prev.filter((e) => e.subjectId !== subjectId));
    setFlashcards((prev) => prev.filter((f) => f.subjectId !== subjectId));
    showToast('Course removed.');
  };

  // Handlers for AI Study Plan
  const handleApplyPlanToSchedule = (newSessions: StudySession[]) => {
    setSessions((prev) => [...newSessions, ...prev]);
    showToast(`Successfully scheduled ${newSessions.length} study sessions into your calendar!`);
  };

  // Handlers for Flashcards
  const handleUpdateFlashcard = (updated: Flashcard) => {
    setFlashcards((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleAddFlashcards = (newCards: Flashcard[]) => {
    setFlashcards((prev) => [...newCards, ...prev]);
    showToast(`Added ${newCards.length} flashcards to deck!`);
  };

  const handleDeleteFlashcard = (cardId: string) => {
    setFlashcards((prev) => prev.filter((f) => f.id !== cardId));
    showToast('Flashcard removed.');
  };

  // Handlers for Exams
  const handleAddExam = (newExam: ExamItem) => {
    setExams((prev) => [...prev, newExam]);
    showToast(`Exam scheduled: ${newExam.title}`);
  };

  const handleDeleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
    showToast('Exam removed.');
  };

  // Handlers for Pomodoro Focus Log
  const handleLogCompletedSession = (newLog: StudyLog) => {
    setLogs((prev) => [newLog, ...prev]);
    showToast(`Logged ${newLog.durationMinutes} minutes of focused study!`);
  };

  // Reload all data
  const handleReloadAllData = () => {
    setSubjects(studyStorage.loadSubjects());
    setSessions(studyStorage.loadSessions());
    setExams(studyStorage.loadExams());
    setFlashcards(studyStorage.loadFlashcards());
    setLogs(studyStorage.loadLogs());
    setGoals(studyStorage.loadGoals());
  };

  const handleOpenNewSessionModal = (date?: string) => {
    setNewSessionDate(date);
    setIsNewSessionModalOpen(true);
  };

  const handleNavigateToAIArchitect = (subjectName: string) => {
    setAiArchitectSubject(subjectName);
    setActiveTab('ai-architect');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewSessionModal={() => handleOpenNewSessionModal()}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        avatarUrl={AVATAR_IMG}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard
            subjects={subjects}
            sessions={sessions}
            exams={exams}
            flashcards={flashcards}
            logs={logs}
            goals={goals}
            onToggleSessionComplete={handleToggleSessionComplete}
            onToggleChecklistTask={handleToggleChecklistTask}
            onNavigateToTab={setActiveTab}
            onStartFocusSession={handleStartFocusSession}
            onOpenNewSessionModal={() => handleOpenNewSessionModal()}
            bannerImg={STUDY_ROOM_IMG}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleCalendar
            subjects={subjects}
            sessions={sessions}
            onToggleSessionComplete={handleToggleSessionComplete}
            onOpenNewSessionModal={handleOpenNewSessionModal}
            onStartFocusSession={handleStartFocusSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'syllabus' && (
          <SyllabusManager
            subjects={subjects}
            onUpdateSubject={handleUpdateSubject}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onNavigateToAIArchitect={handleNavigateToAIArchitect}
          />
        )}

        {activeTab === 'ai-architect' && (
          <AIPlannerGenerator
            subjects={subjects}
            initialSubjectName={aiArchitectSubject}
            onApplyPlanToSchedule={handleApplyPlanToSchedule}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTimer
            subjects={subjects}
            activeSession={activeFocusSession}
            onLogCompletedSession={handleLogCompletedSession}
            onMarkSessionComplete={handleToggleSessionComplete}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardDeck
            subjects={subjects}
            flashcards={flashcards}
            onUpdateFlashcard={handleUpdateFlashcard}
            onAddFlashcards={handleAddFlashcards}
            onDeleteFlashcard={handleDeleteFlashcard}
            notesImg={STUDY_NOTES_IMG}
          />
        )}

        {activeTab === 'exams' && (
          <ExamCountdownBoard
            subjects={subjects}
            exams={exams}
            onAddExam={handleAddExam}
            onDeleteExam={handleDeleteExam}
            onNavigateToAIArchitect={handleNavigateToAIArchitect}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Schedulr</span>
            <span aria-hidden="true">·</span>
            <span>Cognitive Study & Exam Planner</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Backup & Storage
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('focus')}
              className="hover:text-slate-900 transition-colors"
            >
              Focus Chamber
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('ai-architect')}
              className="hover:text-slate-900 transition-colors"
            >
              AI Plan Architect
            </button>
          </div>
        </div>
      </footer>

      {/* New Session Modal */}
      <NewSessionModal
        subjects={subjects}
        initialDate={newSessionDate}
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onSaveSession={handleAddSession}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        goals={goals}
        onUpdateGoals={setGoals}
        onReloadAllData={handleReloadAllData}
        avatarUrl={AVATAR_IMG}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

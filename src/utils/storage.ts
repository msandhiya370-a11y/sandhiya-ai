import {
  Subject,
  StudySession,
  ExamItem,
  Flashcard,
  StudyLog,
  StudyGoalSettings,
} from '../types';
import {
  initialSubjects,
  initialSessions,
  initialExams,
  initialFlashcards,
  initialStudyLogs,
  initialGoals,
} from '../data/initialData';

const STORAGE_KEYS = {
  SUBJECTS: 'schedulr_subjects_v1',
  SESSIONS: 'schedulr_sessions_v1',
  EXAMS: 'schedulr_exams_v1',
  FLASHCARDS: 'schedulr_flashcards_v1',
  LOGS: 'schedulr_logs_v1',
  GOALS: 'schedulr_goals_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const studyStorage = {
  loadSubjects: (): Subject[] => safeGet(STORAGE_KEYS.SUBJECTS, initialSubjects),
  saveSubjects: (data: Subject[]) => safeSet(STORAGE_KEYS.SUBJECTS, data),

  loadSessions: (): StudySession[] => safeGet(STORAGE_KEYS.SESSIONS, initialSessions),
  saveSessions: (data: StudySession[]) => safeSet(STORAGE_KEYS.SESSIONS, data),

  loadExams: (): ExamItem[] => safeGet(STORAGE_KEYS.EXAMS, initialExams),
  saveExams: (data: ExamItem[]) => safeSet(STORAGE_KEYS.EXAMS, data),

  loadFlashcards: (): Flashcard[] => safeGet(STORAGE_KEYS.FLASHCARDS, initialFlashcards),
  saveFlashcards: (data: Flashcard[]) => safeSet(STORAGE_KEYS.FLASHCARDS, data),

  loadLogs: (): StudyLog[] => safeGet(STORAGE_KEYS.LOGS, initialStudyLogs),
  saveLogs: (data: StudyLog[]) => safeSet(STORAGE_KEYS.LOGS, data),

  loadGoals: (): StudyGoalSettings => safeGet(STORAGE_KEYS.GOALS, initialGoals),
  saveGoals: (data: StudyGoalSettings) => safeSet(STORAGE_KEYS.GOALS, data),

  exportBackup(): string {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      subjects: safeGet(STORAGE_KEYS.SUBJECTS, initialSubjects),
      sessions: safeGet(STORAGE_KEYS.SESSIONS, initialSessions),
      exams: safeGet(STORAGE_KEYS.EXAMS, initialExams),
      flashcards: safeGet(STORAGE_KEYS.FLASHCARDS, initialFlashcards),
      logs: safeGet(STORAGE_KEYS.LOGS, initialStudyLogs),
      goals: safeGet(STORAGE_KEYS.GOALS, initialGoals),
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.subjects) safeSet(STORAGE_KEYS.SUBJECTS, data.subjects);
      if (data.sessions) safeSet(STORAGE_KEYS.SESSIONS, data.sessions);
      if (data.exams) safeSet(STORAGE_KEYS.EXAMS, data.exams);
      if (data.flashcards) safeSet(STORAGE_KEYS.FLASHCARDS, data.flashcards);
      if (data.logs) safeSet(STORAGE_KEYS.LOGS, data.logs);
      if (data.goals) safeSet(STORAGE_KEYS.GOALS, data.goals);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.FLASHCARDS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
  },
};

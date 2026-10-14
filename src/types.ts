export interface TopicItem {
  id: string;
  title: string;
  completed: boolean;
  masteryLevel: 'novice' | 'learning' | 'mastered';
  estimatedHours: number;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind-friendly hex or color identifier
  targetGrade: string;
  currentGrade: string;
  creditHours: number;
  examDate?: string; // YYYY-MM-DD
  examTitle?: string;
  topics: TopicItem[];
}

export type StudyTechnique =
  | 'Pomodoro'
  | 'Active Recall'
  | 'Past Paper'
  | 'Feynman Technique'
  | 'Blurting & Retrieval'
  | 'Deep Reading'
  | 'Problem Solving';

export interface ChecklistTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  completed: boolean;
  technique: StudyTechnique;
  checklist: ChecklistTask[];
  notes?: string;
}

export interface ExamItem {
  id: string;
  subjectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  weightPercentage: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topic: string;
  question: string;
  answer: string;
  mnemonicOrHint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string; // YYYY-MM-DD
}

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  subjectId: string;
  technique: string;
  pomodorosCompleted: number;
}

export interface StudyGoalSettings {
  weeklyHoursTarget: number;
  dailyHoursTarget: number;
  preferredStudySlots: ('morning' | 'afternoon' | 'evening')[];
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
}

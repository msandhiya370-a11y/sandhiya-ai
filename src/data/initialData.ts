import { Subject, StudySession, ExamItem, Flashcard, StudyLog, StudyGoalSettings } from '../types';

// Helper to calculate relative date string YYYY-MM-DD
export function getRelativeDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const initialSubjects: Subject[] = [
  {
    id: 'subj-bio',
    code: 'BIO-302',
    name: 'Cellular & Molecular Biology',
    color: '#059669', // Emerald
    targetGrade: 'A',
    currentGrade: 'A-',
    creditHours: 4,
    examDate: getRelativeDateString(5), // 5 days from today
    examTitle: 'Midterm 2: Gene Regulation & Signal Cascades',
    topics: [
      { id: 'top-b1', title: 'Cell Membrane Fluidity & Transport', completed: true, masteryLevel: 'mastered', estimatedHours: 3 },
      { id: 'top-b2', title: 'Glycolysis & Krebs Cycle Energetics', completed: true, masteryLevel: 'mastered', estimatedHours: 4 },
      { id: 'top-b3', title: 'DNA Replication & Polymerase Fidelity', completed: true, masteryLevel: 'learning', estimatedHours: 3.5 },
      { id: 'top-b4', title: 'Lac & Trp Operon Gene Regulation', completed: false, masteryLevel: 'learning', estimatedHours: 4 },
      { id: 'top-b5', title: 'Receptor Tyrosine Kinase Pathways', completed: false, masteryLevel: 'novice', estimatedHours: 3 },
      { id: 'top-b6', title: 'CRISPR-Cas9 & Genome Editing Mechanisms', completed: false, masteryLevel: 'novice', estimatedHours: 2.5 },
    ],
  },
  {
    id: 'subj-cs',
    code: 'CS-280',
    name: 'Data Structures & Algorithms',
    color: '#4f46e5', // Indigo
    targetGrade: 'A+',
    currentGrade: 'A',
    creditHours: 4,
    examDate: getRelativeDateString(14), // 2 weeks
    examTitle: 'Final Exam: Graph Theory & Dynamic Programming',
    topics: [
      { id: 'top-c1', title: 'Asymptotic Complexity & Master Theorem', completed: true, masteryLevel: 'mastered', estimatedHours: 2 },
      { id: 'top-c2', title: 'Red-Black Trees & AVL Self-Balancing', completed: true, masteryLevel: 'mastered', estimatedHours: 4 },
      { id: 'top-c3', title: 'Dijkstra, Bellman-Ford & A* Shortest Paths', completed: true, masteryLevel: 'learning', estimatedHours: 4.5 },
      { id: 'top-c4', title: 'Dynamic Programming: Knapsack & Matrix Chain', completed: false, masteryLevel: 'learning', estimatedHours: 5 },
      { id: 'top-c5', title: 'NP-Completeness & Reduction Proofs', completed: false, masteryLevel: 'novice', estimatedHours: 4 },
    ],
  },
  {
    id: 'subj-chem',
    code: 'CHEM-210',
    name: 'Organic Chemistry II',
    color: '#d97706', // Amber
    targetGrade: 'A',
    currentGrade: 'B+',
    creditHours: 3,
    examDate: getRelativeDateString(8), // 8 days
    examTitle: 'Unit Test 3: Carbonyl Chemistry & Enolates',
    topics: [
      { id: 'top-o1', title: 'Aromaticity & Electrophilic Substitution', completed: true, masteryLevel: 'mastered', estimatedHours: 3.5 },
      { id: 'top-o2', title: 'Aldehydes, Ketones & Nucleophilic Addition', completed: true, masteryLevel: 'learning', estimatedHours: 4 },
      { id: 'top-o3', title: 'Carboxylic Acid Derivatives & Acyl Substitution', completed: false, masteryLevel: 'learning', estimatedHours: 4 },
      { id: 'top-o4', title: 'Aldol Condensation & Michael Addition', completed: false, masteryLevel: 'novice', estimatedHours: 3.5 },
      { id: 'top-o5', title: 'Spectroscopic Elucidation (1H-NMR & IR)', completed: false, masteryLevel: 'learning', estimatedHours: 3 },
    ],
  },
  {
    id: 'subj-stat',
    code: 'STAT-201',
    name: 'Probability & Statistical Inference',
    color: '#0284c7', // Sky
    targetGrade: 'A',
    currentGrade: 'A',
    creditHours: 3,
    examDate: getRelativeDateString(21), // 3 weeks
    examTitle: 'Midterm: Hypothesis Testing & Maximum Likelihood',
    topics: [
      { id: 'top-s1', title: 'Conditional Probability & Bayes Theorem', completed: true, masteryLevel: 'mastered', estimatedHours: 2.5 },
      { id: 'top-s2', title: 'Poisson, Binomial & Normal Distributions', completed: true, masteryLevel: 'mastered', estimatedHours: 3 },
      { id: 'top-s3', title: 'Central Limit Theorem & Sampling Errors', completed: true, masteryLevel: 'learning', estimatedHours: 3 },
      { id: 'top-s4', title: 'Maximum Likelihood Estimation (MLE)', completed: false, masteryLevel: 'novice', estimatedHours: 4 },
      { id: 'top-s5', title: 'Type I/II Errors & Power Calculations', completed: false, masteryLevel: 'novice', estimatedHours: 3 },
    ],
  },
];

export const initialSessions: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'subj-bio',
    title: 'Lac Operon & Allosteric Repressor Mechanics',
    date: getRelativeDateString(0), // Today
    startTime: '09:30',
    durationMinutes: 50,
    completed: true,
    technique: 'Feynman Technique',
    checklist: [
      { id: 'chk-1', text: 'Diagram lactose present vs absent states from memory', completed: true },
      { id: 'chk-2', text: 'Explain CAP-cAMP glucose catabolite repression to a peer', completed: true },
      { id: 'chk-3', text: 'Complete textbook review questions 14-19', completed: true },
    ],
    notes: 'Focus on IPTG gratuitous inducer distinction for exam.',
  },
  {
    id: 'sess-2',
    subjectId: 'subj-cs',
    title: 'Dynamic Programming: 0/1 Knapsack & Memoization Matrix',
    date: getRelativeDateString(0), // Today
    startTime: '14:00',
    durationMinutes: 50,
    completed: false,
    technique: 'Problem Solving',
    checklist: [
      { id: 'chk-4', text: 'Derive state transition recurrence relation dp[i][w]', completed: false },
      { id: 'chk-5', text: 'Implement top-down recursion with memoization hash', completed: false },
      { id: 'chk-6', text: 'Optimize space complexity from O(n*W) to O(W)', completed: false },
    ],
    notes: 'Watch out for boundary base condition dp[0][w] = 0.',
  },
  {
    id: 'sess-3',
    subjectId: 'subj-chem',
    title: 'Aldol Condensation & Crossed Reaction Pitfalls',
    date: getRelativeDateString(0), // Today
    startTime: '16:30',
    durationMinutes: 45,
    completed: false,
    technique: 'Active Recall',
    checklist: [
      { id: 'chk-7', text: 'Draw arrow-pushing mechanism for enolate formation', completed: false },
      { id: 'chk-8', text: 'Distinguish thermodynamic vs kinetic enolate conditions (LDA at -78C)', completed: false },
    ],
  },
  {
    id: 'sess-4',
    subjectId: 'subj-bio',
    title: 'Receptor Tyrosine Kinase Cascades & Ras-MAPK Pathway',
    date: getRelativeDateString(1), // Tomorrow
    startTime: '10:00',
    durationMinutes: 60,
    completed: false,
    technique: 'Deep Reading',
    checklist: [
      { id: 'chk-9', text: 'Map out dimerisation and trans-autophosphorylation', completed: false },
      { id: 'chk-10', text: 'Identify Grb2 SH2 and SH3 adapter domain bindings', completed: false },
    ],
  },
  {
    id: 'sess-5',
    subjectId: 'subj-stat',
    title: 'Maximum Likelihood Estimation Derivation Practice',
    date: getRelativeDateString(1), // Tomorrow
    startTime: '15:00',
    durationMinutes: 50,
    completed: false,
    technique: 'Past Paper',
    checklist: [
      { id: 'chk-11', text: 'Derive log-likelihood function for Exponential parameter λ', completed: false },
      { id: 'chk-12', text: 'Solve first order derivative score equation', completed: false },
    ],
  },
  {
    id: 'sess-6',
    subjectId: 'subj-cs',
    title: 'Bellman-Ford & Negative Cycle Detection Algorithms',
    date: getRelativeDateString(2),
    startTime: '11:00',
    durationMinutes: 60,
    completed: false,
    technique: 'Problem Solving',
    checklist: [
      { id: 'chk-13', text: 'Trace V-1 relaxation passes on sample graph', completed: false },
      { id: 'chk-14', text: 'Code early termination optimization flag', completed: false },
    ],
  },
];

export const initialExams: ExamItem[] = [
  {
    id: 'ex-1',
    subjectId: 'subj-bio',
    title: 'BIO-302 Midterm Exam 2',
    date: getRelativeDateString(5),
    time: '10:00',
    location: 'Science Hall 304',
    weightPercentage: 25,
    priority: 'high',
    notes: 'Closed book. Covers Operons, Kinase Cascades, and Transcription Factors.',
  },
  {
    id: 'ex-2',
    subjectId: 'subj-chem',
    title: 'CHEM-210 Unit Test 3',
    date: getRelativeDateString(8),
    time: '14:30',
    location: 'Chemistry Lab B12',
    weightPercentage: 20,
    priority: 'high',
    notes: 'Molecular modeling kits allowed. Mechanisms & multi-step synthesis.',
  },
  {
    id: 'ex-3',
    subjectId: 'subj-cs',
    title: 'CS-280 Comprehensive Final',
    date: getRelativeDateString(14),
    time: '09:00',
    location: 'Engineering Auditorium 101',
    weightPercentage: 35,
    priority: 'high',
    notes: 'One double-sided 8.5x11 cheat sheet permitted.',
  },
  {
    id: 'ex-4',
    subjectId: 'subj-stat',
    title: 'STAT-201 Midterm Examination',
    date: getRelativeDateString(21),
    time: '13:00',
    location: 'Mathematics Hall 215',
    weightPercentage: 25,
    priority: 'medium',
    notes: 'TI-84 calculator and formula packet provided.',
  },
];

export const initialFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    subjectId: 'subj-bio',
    topic: 'Gene Regulation',
    question: 'How does high glucose repress transcription of the lac operon even when lactose is abundant?',
    answer: 'High glucose lowers intracellular cAMP levels, preventing cAMP from binding CAP (Catabolite Activator Protein). Without the active CAP-cAMP complex, RNA polymerase binds the lac promoter with very low affinity.',
    mnemonicOrHint: 'Glucose high = cAMP low = Engine stalled.',
    difficulty: 'medium',
    intervalDays: 3,
    repetitions: 2,
    nextReviewDate: getRelativeDateString(0), // Today
  },
  {
    id: 'fc-2',
    subjectId: 'subj-bio',
    topic: 'Signal Transduction',
    question: 'What is the function of the SH2 domain on the Grb2 adaptor protein in RTK signaling?',
    answer: 'The SH2 domain specifically recognizes and binds phosphorylated tyrosine residues on the activated receptor tyrosine kinase, recruiting Sos (GEF) to activate membrane-bound Ras.',
    mnemonicOrHint: 'SH2 binds P-Tyr (Phospho-Tyrosine).',
    difficulty: 'hard',
    intervalDays: 1,
    repetitions: 1,
    nextReviewDate: getRelativeDateString(0),
  },
  {
    id: 'fc-3',
    subjectId: 'subj-cs',
    topic: 'Graph Algorithms',
    question: 'Why does Dijkstra’s algorithm fail when a graph contains edges with negative weights?',
    answer: 'Dijkstra assumes that adding an edge to a path never decreases total distance (greedy choice property). Once a vertex is marked visited, its distance is finalized; a negative edge later in the path can invalidate this optimality assumption.',
    mnemonicOrHint: 'Greedy finality breaks if costs can shrink.',
    difficulty: 'medium',
    intervalDays: 5,
    repetitions: 3,
    nextReviewDate: getRelativeDateString(0),
  },
  {
    id: 'fc-4',
    subjectId: 'subj-chem',
    topic: 'Carbonyl Chemistry',
    question: 'What reaction conditions favor the thermodynamic enolate over the kinetic enolate?',
    answer: 'Small, unhindered base (e.g. NaOEt), protic solvent, and higher temperatures (room temperature or heat). This allows equilibrium to favor the more substituted, stable double bond.',
    mnemonicOrHint: 'Heat + small base = thermodynamic equilibrium.',
    difficulty: 'medium',
    intervalDays: 2,
    repetitions: 1,
    nextReviewDate: getRelativeDateString(1),
  },
  {
    id: 'fc-5',
    subjectId: 'subj-stat',
    topic: 'Hypothesis Testing',
    question: 'What is the exact definition of a p-value?',
    answer: 'The probability of observing a test statistic at least as extreme as the one calculated, assuming the null hypothesis (H0) is true.',
    mnemonicOrHint: 'P-value is NOT the probability that H0 is true!',
    difficulty: 'hard',
    intervalDays: 4,
    repetitions: 2,
    nextReviewDate: getRelativeDateString(2),
  },
];

export const initialStudyLogs: StudyLog[] = [
  { id: 'log-1', date: getRelativeDateString(-4), durationMinutes: 120, subjectId: 'subj-bio', technique: 'Deep Reading', pomodorosCompleted: 4 },
  { id: 'log-2', date: getRelativeDateString(-3), durationMinutes: 150, subjectId: 'subj-cs', technique: 'Problem Solving', pomodorosCompleted: 5 },
  { id: 'log-3', date: getRelativeDateString(-2), durationMinutes: 90, subjectId: 'subj-chem', technique: 'Active Recall', pomodorosCompleted: 3 },
  { id: 'log-4', date: getRelativeDateString(-1), durationMinutes: 180, subjectId: 'subj-bio', technique: 'Feynman Technique', pomodorosCompleted: 6 },
  { id: 'log-5', date: getRelativeDateString(0), durationMinutes: 50, subjectId: 'subj-bio', technique: 'Feynman Technique', pomodorosCompleted: 2 },
];

export const initialGoals: StudyGoalSettings = {
  weeklyHoursTarget: 20,
  dailyHoursTarget: 3,
  preferredStudySlots: ['morning', 'afternoon'],
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
};

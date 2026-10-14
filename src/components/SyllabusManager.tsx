import React, { useState } from 'react';
import { Subject, TopicItem } from '../types';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Trash2,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SyllabusManagerProps {
  subjects: Subject[];
  onUpdateSubject: (subject: Subject) => void;
  onAddSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onNavigateToAIArchitect: (subjectName: string) => void;
}

export const SyllabusManager: React.FC<SyllabusManagerProps> = ({
  subjects,
  onUpdateSubject,
  onAddSubject,
  onDeleteSubject,
  onNavigateToAIArchitect,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicHours, setNewTopicHours] = useState('3');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainingTopic, setExplainingTopic] = useState<string | null>(null);
  const [conceptExplanation, setConceptExplanation] = useState<any | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  // New course form
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [targetGrade, setTargetGrade] = useState('A');
  const [courseColor, setCourseColor] = useState('#059669');
  const [creditHours, setCreditHours] = useState(3);
  const [examDate, setExamDate] = useState('');

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleToggleTopicMastery = (topicId: string) => {
    if (!activeSubject) return;
    const updatedTopics = activeSubject.topics.map((t) => {
      if (t.id !== topicId) return t;
      let nextMastery: TopicItem['masteryLevel'] = 'learning';
      let completed = false;
      if (t.masteryLevel === 'novice') {
        nextMastery = 'learning';
      } else if (t.masteryLevel === 'learning') {
        nextMastery = 'mastered';
        completed = true;
      } else {
        nextMastery = 'novice';
        completed = false;
      }
      return { ...t, masteryLevel: nextMastery, completed };
    });

    onUpdateSubject({ ...activeSubject, topics: updatedTopics });
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !activeSubject) return;

    const newTopic: TopicItem = {
      id: `top-${Date.now()}`,
      title: newTopicTitle.trim(),
      completed: false,
      masteryLevel: 'novice',
      estimatedHours: parseFloat(newTopicHours) || 3,
    };

    onUpdateSubject({
      ...activeSubject,
      topics: [...activeSubject.topics, newTopic],
    });

    setNewTopicTitle('');
  };

  const handleDeleteTopic = (topicId: string) => {
    if (!activeSubject) return;
    const updated = activeSubject.topics.filter((t) => t.id !== topicId);
    onUpdateSubject({ ...activeSubject, topics: updated });
  };

  const handleExplainConcept = async (topicTitle: string) => {
    if (!activeSubject) return;
    setIsExplaining(true);
    setExplainingTopic(topicTitle);
    setConceptExplanation(null);

    try {
      const res = await fetch('/api/study-plan/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: topicTitle,
          subject: `${activeSubject.code}: ${activeSubject.name}`,
        }),
      });
      const data = await res.json();
      if (data.explanation) {
        setConceptExplanation(data.explanation);
      }
    } catch (e) {
      console.error('Failed to explain concept:', e);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    const newSub: Subject = {
      id: `subj-${Date.now()}`,
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      color: courseColor,
      targetGrade,
      currentGrade: 'In Progress',
      creditHours,
      examDate: examDate || undefined,
      topics: [
        { id: `top-${Date.now()}-1`, title: 'Foundational Introduction & Scope', completed: false, masteryLevel: 'novice', estimatedHours: 2 },
        { id: `top-${Date.now()}-2`, title: 'Core Principles & Analytical Methods', completed: false, masteryLevel: 'novice', estimatedHours: 4 },
      ],
    };

    onAddSubject(newSub);
    setSelectedSubjectId(newSub.id);
    setShowAddCourseModal(false);
    setCourseCode('');
    setCourseName('');
  };

  if (!activeSubject) {
    return (
      <div className="p-8 text-center text-slate-500">
        No courses found. Please add a course.
      </div>
    );
  }

  const masteredCount = activeSubject.topics.filter((t) => t.masteryLevel === 'mastered').length;
  const learningCount = activeSubject.topics.filter((t) => t.masteryLevel === 'learning').length;
  const totalCount = activeSubject.topics.length;
  const pctMastered = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
  const totalEstimatedHours = activeSubject.topics.reduce((acc, t) => acc + t.estimatedHours, 0);

  return (
    <div className="space-y-6">
      {/* Top Bar for Subject Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Subject Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {subjects.map((sub) => {
            const isSelected = sub.id === activeSubject.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: sub.color }}
                ></span>
                <span>{sub.code}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddCourseModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Course
        </button>
      </div>

      {/* Course Detail Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span style={{ color: activeSubject.color }} className="font-bold">
                {activeSubject.code}
              </span>
              <span>·</span>
              <span>{activeSubject.creditHours} Academic Credits</span>
              {activeSubject.examDate && (
                <>
                  <span>·</span>
                  <span className="text-rose-600 font-mono tabular-nums">
                    Exam Date: {activeSubject.examDate}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {activeSubject.name}
            </h2>
            {activeSubject.examTitle && (
              <p className="text-xs text-slate-500 mt-1">{activeSubject.examTitle}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-500">Target Grade: </span>
              <strong className="text-slate-900 font-bold">{activeSubject.targetGrade}</strong>
            </div>

            <button
              onClick={() => onNavigateToAIArchitect(activeSubject.name)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Build AI Study Schedule
            </button>

            {subjects.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${activeSubject.code}?`)) {
                    onDeleteSubject(activeSubject.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Syllabus Progress Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-center sm:text-left">
          <div>
            <span className="text-xs text-slate-500">Syllabus Completion</span>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {pctMastered}%
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Topics Mastered</span>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 mt-0.5">
              {masteredCount} <span className="text-xs font-normal text-slate-400">/ {totalCount}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">In Progress</span>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-600 mt-0.5">
              {learningCount}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Total Study Time</span>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {totalEstimatedHours}h <span className="text-xs font-normal text-slate-400">budgeted</span>
            </div>
          </div>
        </div>

        {/* Topics Checklist Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Syllabus Topics & Mastery Rubric
            </h3>
            <span className="text-xs text-slate-500">
              Click status to cycle: Novice → In Progress → Mastered
            </span>
          </div>

          <div className="space-y-2">
            {activeSubject.topics.map((topic) => {
              const masteryBadge =
                topic.masteryLevel === 'mastered'
                  ? { label: 'Mastered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                  : topic.masteryLevel === 'learning'
                  ? { label: 'In Progress', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
                  : { label: 'Novice', bg: 'bg-slate-100 text-slate-600 border-slate-200' };

              return (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTopicMastery(topic.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${masteryBadge.bg}`}
                    >
                      {masteryBadge.label}
                    </button>

                    <div>
                      <h4
                        className={`text-sm font-semibold tracking-tight ${
                          topic.completed ? 'text-slate-700' : 'text-slate-900'
                        }`}
                      >
                        {topic.title}
                      </h4>
                      <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                        ~{topic.estimatedHours} hrs study budget
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleExplainConcept(topic.title)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 rounded border border-indigo-200 transition-colors"
                      title="AI Concept Explainer & Analogy"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Explain with AI
                    </button>

                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove Topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Topic Form */}
          <form onSubmit={handleAddTopic} className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Add next syllabus module or topic..."
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="20"
                value={newTopicHours}
                onChange={(e) => setNewTopicHours(e.target.value)}
                className="w-20 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono tabular-nums"
                title="Estimated study hours"
              />
              <span className="text-xs text-slate-500">hrs</span>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                + Add Topic
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI Concept Explanation Drawer / Card */}
      {(isExplaining || conceptExplanation) && (
        <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Cognitive Concept Breakdown: <span className="text-indigo-600">{explainingTopic}</span>
              </h3>
            </div>
            <button
              onClick={() => {
                setConceptExplanation(null);
                setExplainingTopic(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Dismiss
            </button>
          </div>

          {isExplaining ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-spin mx-auto mb-2" />
              Synthesizing intuition, mnemonics, and exam trap analysis for {explainingTopic}...
            </div>
          ) : (
            conceptExplanation && (
              <div className="space-y-4 text-xs">
                <div>
                  <strong className="text-slate-900 font-semibold block mb-1">
                    Plain-English Intuition:
                  </strong>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {conceptExplanation.plainEnglishSummary}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-900 font-semibold block mb-1">
                    Mental Analogy (Impossible to Forget):
                  </strong>
                  <p className="text-slate-700 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                    {conceptExplanation.intuitionAnalogy}
                  </p>
                </div>

                {conceptExplanation.keyRulesOrSteps && (
                  <div>
                    <strong className="text-slate-900 font-semibold block mb-1">
                      Critical Principles & Exam Rules:
                    </strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                      {conceptExplanation.keyRulesOrSteps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {conceptExplanation.commonExamTrap && (
                  <div>
                    <strong className="text-rose-700 font-semibold block mb-1">
                      Classic Exam Pitfall to Avoid:
                    </strong>
                    <p className="text-rose-900 bg-rose-50 p-3 rounded-lg border border-rose-100">
                      {conceptExplanation.commonExamTrap}
                    </p>
                  </div>
                )}

                {conceptExplanation.practiceQuestion && (
                  <div className="border-t border-slate-100 pt-3">
                    <strong className="text-slate-900 font-semibold block mb-1">
                      Sample Retrieval Question:
                    </strong>
                    <p className="text-slate-800 font-medium mb-1">
                      {conceptExplanation.practiceQuestion.question}
                    </p>
                    <div className="text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-100">
                      <strong>Solution: </strong> {conceptExplanation.practiceQuestion.solution}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Academic Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Code (e.g. MATH-220, CS-301)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHYS-150"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classical Mechanics & Wave Motion"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Grade
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="A+">A+ (4.0)</option>
                    <option value="A">A (4.0)</option>
                    <option value="A-">A- (3.7)</option>
                    <option value="B+">B+ (3.3)</option>
                    <option value="B">B (3.0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={creditHours}
                    onChange={(e) => setCreditHours(parseInt(e.target.value, 10) || 3)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  {['#059669', '#4f46e5', '#d97706', '#0284c7', '#dc2626', '#7c3aed'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setCourseColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        courseColor === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Final Exam Date (Optional)
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

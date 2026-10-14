import React, { useState } from 'react';
import { Subject, Flashcard } from '../types';
import {
  Layers,
  Plus,
  Sparkles,
  RotateCw,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Trash2,
  Filter,
} from 'lucide-react';

interface FlashcardDeckProps {
  subjects: Subject[];
  flashcards: Flashcard[];
  onUpdateFlashcard: (card: Flashcard) => void;
  onAddFlashcards: (cards: Flashcard[]) => void;
  onDeleteFlashcard: (cardId: string) => void;
  notesImg: string;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  subjects,
  flashcards,
  onUpdateFlashcard,
  onAddFlashcards,
  onDeleteFlashcard,
  notesImg,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [reviewDueOnly, setReviewDueOnly] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // AI Generator Modal state
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('');
  const [aiNotes, setAiNotes] = useState<string>('');
  const [aiSubjectId, setAiSubjectId] = useState<string>(subjects[0]?.id || '');
  const [aiCount, setAiCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Manual Add Modal state
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualQuestion, setManualQuestion] = useState<string>('');
  const [manualAnswer, setManualAnswer] = useState<string>('');
  const [manualHint, setManualHint] = useState<string>('');
  const [manualTopic, setManualTopic] = useState<string>('');
  const [manualSubjectId, setManualSubjectId] = useState<string>(subjects[0]?.id || '');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredCards = flashcards.filter((card) => {
    if (selectedSubjectId !== 'all' && card.subjectId !== selectedSubjectId) return false;
    if (reviewDueOnly && card.nextReviewDate > todayStr) return false;
    return true;
  });

  const currentCard = filteredCards[currentIndex] || null;
  const currentSubject = currentCard ? subjects.find((s) => s.id === currentCard.subjectId) : null;

  const handleNext = () => {
    setIsFlipped(false);
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }
  };

  // Spaced Repetition Rating
  const handleRate = (intervalDays: number) => {
    if (!currentCard) return;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const updatedCard: Flashcard = {
      ...currentCard,
      intervalDays,
      repetitions: intervalDays === 1 ? 0 : currentCard.repetitions + 1,
      nextReviewDate: nextDate.toISOString().split('T')[0],
    };

    onUpdateFlashcard(updatedCard);
    handleNext();
  };

  // AI Card Generation
  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsGenerating(true);
    const sub = subjects.find((s) => s.id === aiSubjectId);

    try {
      const res = await fetch('/api/study-plan/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          subject: sub ? `${sub.code}: ${sub.name}` : 'General',
          context: aiNotes,
          count: aiCount,
        }),
      });

      const data = await res.json();
      if (data.cards) {
        const formatted: Flashcard[] = data.cards.map((c: any) => ({
          ...c,
          subjectId: aiSubjectId,
        }));
        onAddFlashcards(formatted);
        setShowAIModal(false);
        setAiTopic('');
        setAiNotes('');
      }
    } catch (err) {
      console.error('Error generating cards:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Manual Card Creation
  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuestion.trim() || !manualAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `fc-manual-${Date.now()}`,
      subjectId: manualSubjectId,
      topic: manualTopic.trim() || 'General',
      question: manualQuestion.trim(),
      answer: manualAnswer.trim(),
      mnemonicOrHint: manualHint.trim() || undefined,
      difficulty: 'medium',
      intervalDays: 1,
      repetitions: 0,
      nextReviewDate: todayStr,
    };

    onAddFlashcards([newCard]);
    setShowManualModal(false);
    setManualQuestion('');
    setManualAnswer('');
    setManualHint('');
    setManualTopic('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
            <Layers className="w-4 h-4" />
            <span>Active Recall & Spaced Repetition</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Concept Mastery Decks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test yourself before flipping. Rate recall difficulty to optimize Leitner interval spacing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Decks with AI
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Flashcard
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Deck:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 focus:outline-none"
          >
            <option value="all">All Courses ({flashcards.length})</option>
            {subjects.map((sub) => {
              const count = flashcards.filter((f) => f.subjectId === sub.id).length;
              return (
                <option key={sub.id} value={sub.id}>
                  {sub.code}: {sub.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={reviewDueOnly}
            onChange={(e) => {
              setReviewDueOnly(e.target.checked);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
          />
          <span>Only show cards due today</span>
        </label>
      </div>

      {/* Main Flashcard Interactive View */}
      {filteredCards.length > 0 && currentCard ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
            <span>
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span style={{ color: currentSubject?.color }} className="font-bold">
                {currentSubject?.code}
              </span>
              <span>·</span>
              <span className="capitalize">{currentCard.topic}</span>
            </div>
          </div>

          {/* Flashcard Body with 3D Flip */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[280px] sm:min-h-[320px] bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between select-none relative"
            style={{
              borderTopWidth: '5px',
              borderTopColor: currentSubject?.color || '#6366f1',
            }}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase tracking-wider font-semibold">
                {isFlipped ? 'Answer & Mechanism' : 'Active Recall Prompt'}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <RotateCw className="w-3 h-3" /> Click to flip
              </span>
            </div>

            <div className="my-auto py-4">
              {!isFlipped ? (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug tracking-tight">
                    {currentCard.question}
                  </h3>
                  {currentCard.mnemonicOrHint && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60 inline-flex">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                      <span>Hint: {currentCard.mnemonicOrHint}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
                    {currentCard.answer}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
              <span className="capitalize">Difficulty: {currentCard.difficulty}</span>
              <span className="font-mono tabular-nums">Interval: {currentCard.intervalDays}d</span>
            </div>
          </div>

          {/* Spaced Repetition Action Buttons (Visible when flipped) */}
          {isFlipped ? (
            <div className="grid grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handleRate(1)}
                className="py-2.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold text-center transition-colors"
              >
                <div>Again</div>
                <div className="text-[10px] text-rose-500 font-mono">1 Day</div>
              </button>

              <button
                onClick={() => handleRate(2)}
                className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold text-center transition-colors"
              >
                <div>Hard</div>
                <div className="text-[10px] text-amber-500 font-mono">2 Days</div>
              </button>

              <button
                onClick={() => handleRate(4)}
                className="py-2.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold text-center transition-colors"
              >
                <div>Good</div>
                <div className="text-[10px] text-indigo-500 font-mono">4 Days</div>
              </button>

              <button
                onClick={() => handleRate(7)}
                className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold text-center transition-colors"
              >
                <div>Easy</div>
                <div className="text-[10px] text-emerald-500 font-mono">7 Days</div>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => setIsFlipped(true)}
                className="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                Reveal Answer
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (confirm('Delete this flashcard?')) {
                  onDeleteFlashcard(currentCard.id);
                  handleNext();
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove card
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No cards in this deck</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All reviews for today are finished, or no cards match your current filter.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Generate Cards with AI
            </button>
          </div>
        </div>
      )}

      {/* AI Generate Cards Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Active Recall Deck Synthesis</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Generate High-Yield Flashcards
            </h3>

            <form onSubmit={handleGenerateCards} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course
                </label>
                <select
                  value={aiSubjectId}
                  onChange={(e) => setAiSubjectId(e.target.value)}
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
                  Topic / Concept
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lac Operon Repressor vs CAP-cAMP Activation"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Notes / Keywords (Optional)
                </label>
                <textarea
                  placeholder="Paste lecture notes or bullet points to ground the questions..."
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none h-20"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Card Count:</label>
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(parseInt(e.target.value, 10))}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded-md"
                >
                  <option value={4}>4 Cards</option>
                  <option value={6}>6 Cards</option>
                  <option value={8}>8 Cards</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Synthesizing...
                    </>
                  ) : (
                    'Generate Cards'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Card Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Custom Flashcard</h3>
            <form onSubmit={handleCreateManual} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={manualSubjectId}
                  onChange={(e) => setManualSubjectId(e.target.value)}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Aromatic Electrophilic Substitution"
                  value={manualTopic}
                  onChange={(e) => setManualTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question / Prompt</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Why are halogens ortho/para directors despite being deactivating?"
                  value={manualQuestion}
                  onChange={(e) => setManualQuestion(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Answer / Solution</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Inductive electron withdrawal (-I) deactivates the ring, but lone-pair resonance (+M) stabilizes ortho/para carbocation intermediates."
                  value={manualAnswer}
                  onChange={(e) => setManualAnswer(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mnemonic / Hint (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Induction vs Resonance tug of war"
                  value={manualHint}
                  onChange={(e) => setManualHint(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

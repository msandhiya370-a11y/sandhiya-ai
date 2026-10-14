import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudySession, StudyLog } from '../types';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  Coffee,
  Flame,
  CheckCircle2,
  FileText,
  Clock,
} from 'lucide-react';

interface FocusTimerProps {
  subjects: Subject[];
  activeSession?: StudySession | null;
  onLogCompletedSession: (log: StudyLog) => void;
  onMarkSessionComplete?: (sessionId: string) => void;
}

type TimerMode = 'pomodoro' | 'deep' | 'shortBreak' | 'longBreak';

export const FocusTimer: React.FC<FocusTimerProps> = ({
  subjects,
  activeSession,
  onLogCompletedSession,
  onMarkSessionComplete,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeSession?.subjectId || subjects[0]?.id || ''
  );
  const [sessionNotes, setSessionNotes] = useState<string>(
    activeSession?.notes || ''
  );

  // Time in seconds
  const getInitialSeconds = (m: TimerMode): number => {
    switch (m) {
      case 'pomodoro':
        return 25 * 60;
      case 'deep':
        return 50 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
    }
  };

  const [totalSeconds, setTotalSeconds] = useState<number>(getInitialSeconds('pomodoro'));
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // Ambient sound selection
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'focus-drone' | 'coffee-shop' | 'campfire'>('none');
  const [volume, setVolume] = useState<number>(0.4);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Change mode
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const secs = getInitialSeconds(newMode);
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Handle Timer Finished
  const handleTimerComplete = () => {
    setIsRunning(false);
    soundEngine.playChime();

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    if (mode === 'pomodoro' || mode === 'deep') {
      const durationMins = Math.round(totalSeconds / 60);
      setCompletedCycles((c) => c + 1);

      // Log study time
      const newLog: StudyLog = {
        id: `log-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        durationMinutes: durationMins,
        subjectId: selectedSubjectId,
        technique: mode === 'deep' ? 'Deep Work (50m)' : 'Pomodoro Focus (25m)',
        pomodorosCompleted: 1,
      };
      onLogCompletedSession(newLog);

      if (activeSession && onMarkSessionComplete) {
        onMarkSessionComplete(activeSession.id);
      }
    }
  };

  // Sound changes
  useEffect(() => {
    if (ambientSound === 'none') {
      soundEngine.stopAmbient();
    } else {
      soundEngine.startAmbient(ambientSound, volume);
    }
    return () => {
      soundEngine.stopAmbient();
    };
  }, [ambientSound]);

  useEffect(() => {
    soundEngine.setVolume(volume);
  }, [volume]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const strokeDashoffset = 283 - 283 * progressRatio;

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Context */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Clock className="w-4 h-4" />
            <span>Cognitive Focus Chamber</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {activeSession ? activeSession.title : 'Deep Study Session'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain unbroken attention. Ambient soundscapes mask distractions and promote flow.
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Course:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code}: {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Focus Console */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left: Timer Display */}
        <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-between">
          {/* Mode Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => handleModeChange('pomodoro')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                mode === 'pomodoro' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => handleModeChange('deep')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                mode === 'deep' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              50m Deep
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                mode === 'shortBreak' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5m Break
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                mode === 'longBreak' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              15m Long Break
            </button>
          </div>

          {/* SVG Progress Circle and Large Tabular Timer */}
          <div className="relative w-64 h-64 my-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Active countdown circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={activeSubject?.color || '#0f172a'}
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-extrabold font-mono tabular-nums tracking-tight text-slate-900">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                {isRunning ? 'Flow in Progress' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Start Focus
                </>
              )}
            </button>

            <button
              onClick={handleTimerComplete}
              className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Complete session early"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 text-xs text-slate-400 font-mono tabular-nums">
            Cycles Completed Today: <strong className="text-slate-700">{completedCycles}</strong>
          </div>
        </div>

        {/* Right: Ambient Soundscapes & Study Scratchpad */}
        <div className="md:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Ambient Soundscapes Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Synthesized Soundscapes
              </span>
              <span className="text-xs text-slate-400">Web Audio API</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAmbientSound(ambientSound === 'rain' ? 'none' : 'rain')}
                className={`p-3 rounded-lg border text-left text-xs font-medium flex items-center gap-2.5 transition-all ${
                  ambientSound === 'rain'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <CloudRain className="w-4 h-4 text-sky-400" />
                <span>Rain & Storm</span>
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === 'focus-drone' ? 'none' : 'focus-drone')}
                className={`p-3 rounded-lg border text-left text-xs font-medium flex items-center gap-2.5 transition-all ${
                  ambientSound === 'focus-drone'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Radio className="w-4 h-4 text-purple-400" />
                <span>432Hz Drone</span>
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === 'coffee-shop' ? 'none' : 'coffee-shop')}
                className={`p-3 rounded-lg border text-left text-xs font-medium flex items-center gap-2.5 transition-all ${
                  ambientSound === 'coffee-shop'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Café Murmur</span>
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === 'campfire' ? 'none' : 'campfire')}
                className={`p-3 rounded-lg border text-left text-xs font-medium flex items-center gap-2.5 transition-all ${
                  ambientSound === 'campfire'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Campfire</span>
              </button>
            </div>

            {/* Volume Slider */}
            {ambientSound !== 'none' && (
              <div className="pt-2 flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-slate-900"
                />
                <span className="text-xs font-mono tabular-nums text-slate-500 w-8">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Focus Notepad / Brain Dump */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Session Brain Dump & Quick Notes</span>
            </div>
            <textarea
              placeholder="Jot down quick thoughts, formulas to review later, or distracting thoughts you want to park..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full flex-1 min-h-[140px] p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none font-mono text-slate-700 leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

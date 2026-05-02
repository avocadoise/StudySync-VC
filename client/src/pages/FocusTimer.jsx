import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSubjects } from '../api/subjectApi';
import {
  createFocusSession,
  deleteFocusSession,
  getFocusSessions,
  getFocusStats
} from '../api/focusApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Trash2,
  X
} from 'lucide-react';

const SESSION_MINUTES = {
  Pomodoro: 25,
  'Short Break': 5,
  'Long Break': 15
};

const SESSION_TYPES = ['Pomodoro', 'Short Break', 'Long Break', 'Custom'];
const TIMER_STORAGE_KEY = 'studysync.focusTimer';

const getTotalSecondsForSession = (type, minutes) => {
  const normalizedMinutes = type === 'Custom'
    ? Math.max(1, Number(minutes) || 1)
    : SESSION_MINUTES[type] || SESSION_MINUTES.Pomodoro;

  return normalizedMinutes * 60;
};

const getInitialTimerState = () => {
  const fallback = {
    selectedSubjectId: '',
    sessionType: 'Pomodoro',
    customMinutes: 25,
    timerStatus: 'idle',
    remainingSeconds: SESSION_MINUTES.Pomodoro * 60,
    timerEndsAt: null
  };

  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    const sessionType = SESSION_TYPES.includes(parsed.sessionType) ? parsed.sessionType : 'Pomodoro';
    const customMinutes = Math.max(1, Number(parsed.customMinutes) || 25);
    const totalSeconds = getTotalSecondsForSession(sessionType, customMinutes);
    const timerEndsAt = Number(parsed.timerEndsAt) || null;
    let timerStatus = ['idle', 'running', 'paused', 'finished'].includes(parsed.timerStatus)
      ? parsed.timerStatus
      : 'idle';
    let remainingSeconds = Math.min(
      totalSeconds,
      Math.max(0, Number(parsed.remainingSeconds) || totalSeconds)
    );

    if (timerStatus === 'running' && timerEndsAt) {
      remainingSeconds = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
      if (remainingSeconds === 0) {
        timerStatus = 'finished';
      }
    }

    if (timerStatus === 'finished') {
      remainingSeconds = 0;
    }

    if (timerStatus === 'idle') {
      remainingSeconds = totalSeconds;
    }

    return {
      selectedSubjectId: parsed.selectedSubjectId || '',
      sessionType,
      customMinutes,
      timerStatus,
      remainingSeconds,
      timerEndsAt: timerStatus === 'running' ? timerEndsAt : null
    };
  } catch {
    window.localStorage.removeItem(TIMER_STORAGE_KEY);
    return fallback;
  }
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const formatMinutes = (minutes = 0) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
};

const FocusTimer = () => {
  const initialTimer = useMemo(() => getInitialTimerState(), []);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedSubjectId, setSelectedSubjectId] = useState(initialTimer.selectedSubjectId);
  const [sessionType, setSessionType] = useState(initialTimer.sessionType);
  const [customMinutes, setCustomMinutes] = useState(initialTimer.customMinutes);
  const [timerStatus, setTimerStatus] = useState(initialTimer.timerStatus);
  const [remainingSeconds, setRemainingSeconds] = useState(initialTimer.remainingSeconds);
  const [timerEndsAt, setTimerEndsAt] = useState(initialTimer.timerEndsAt);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const selectedMinutes = useMemo(() => {
    if (sessionType === 'Custom') {
      return Math.max(1, Number(customMinutes) || 1);
    }
    return SESSION_MINUTES[sessionType];
  }, [customMinutes, sessionType]);

  const totalSeconds = getTotalSecondsForSession(sessionType, customMinutes);
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progress = totalSeconds > 0 ? Math.min(100, (elapsedSeconds / totalSeconds) * 100) : 0;
  const isTimerLocked = timerStatus === 'running' || timerStatus === 'paused';

  const getCurrentRemainingSeconds = () => {
    if (timerStatus === 'running' && timerEndsAt) {
      return Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
    }

    return remainingSeconds;
  };

  const fetchFocusData = async () => {
    setError('');
    try {
      const [subjectsRes, sessionsRes, statsRes] = await Promise.all([
        getSubjects(),
        getFocusSessions(),
        getFocusStats()
      ]);

      const nextSubjects = subjectsRes.data || [];
      setSubjects(nextSubjects);
      setSessions(sessionsRes.data || []);
      setStats(statsRes.data || null);

      if (!selectedSubjectId && nextSubjects.length > 0) {
        setSelectedSubjectId(nextSubjects[0]._id);
      }
    } catch (err) {
      console.error('Failed to load focus timer data:', err);
      setError('Failed to load focus timer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFocusData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timerStatus === 'idle') {
      setRemainingSeconds(totalSeconds);
      setTimerEndsAt(null);
    }
  }, [timerStatus, totalSeconds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        TIMER_STORAGE_KEY,
        JSON.stringify({
          selectedSubjectId,
          sessionType,
          customMinutes,
          timerStatus,
          remainingSeconds,
          timerEndsAt,
          totalSeconds,
          updatedAt: Date.now()
        })
      );
    } catch (error) {
      console.warn('Failed to persist focus timer state:', error);
    }
  }, [
    selectedSubjectId,
    sessionType,
    customMinutes,
    timerStatus,
    remainingSeconds,
    timerEndsAt,
    totalSeconds
  ]);

  useEffect(() => {
    if (timerStatus !== 'running' || !timerEndsAt) return undefined;

    const tick = () => {
      const nextRemaining = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining === 0) {
        setTimerEndsAt(null);
        setTimerStatus('finished');
        setSuccess('Timer complete. Save the session to add it to your focus history.');
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [timerEndsAt, timerStatus]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleStart = () => {
    clearMessages();

    if (!selectedSubjectId) {
      setError('Select a subject before starting a focus session.');
      return;
    }

    const secondsToRun = remainingSeconds > 0 && timerStatus !== 'finished'
      ? remainingSeconds
      : totalSeconds;
    setRemainingSeconds(secondsToRun);
    setTimerEndsAt(Date.now() + secondsToRun * 1000);
    setTimerStatus('running');
  };

  const handlePause = () => {
    clearMessages();
    const nextRemaining = getCurrentRemainingSeconds();
    setRemainingSeconds(nextRemaining);
    setTimerEndsAt(null);
    setTimerStatus(nextRemaining === 0 ? 'finished' : 'paused');
  };

  const handleResume = () => {
    clearMessages();
    const secondsToRun = remainingSeconds > 0 ? remainingSeconds : totalSeconds;
    setRemainingSeconds(secondsToRun);
    setTimerEndsAt(Date.now() + secondsToRun * 1000);
    setTimerStatus('running');
  };

  const handleReset = () => {
    clearMessages();
    setTimerStatus('idle');
    setRemainingSeconds(totalSeconds);
    setTimerEndsAt(null);
  };

  const handleSaveCompletedSession = async () => {
    clearMessages();

    if (!selectedSubjectId) {
      setError('Select a subject before saving a focus session.');
      return;
    }

    if (timerStatus !== 'finished' || remainingSeconds > 0) {
      setError('Only completed sessions can be saved. Let the timer finish first.');
      return;
    }

    setIsSaving(true);
    try {
      await createFocusSession({
        subjectId: selectedSubjectId,
        duration: selectedMinutes,
        sessionType,
        completedAt: new Date().toISOString()
      });

      setSuccess('Focus session saved.');
      setTimerStatus('idle');
      setRemainingSeconds(totalSeconds);
      setTimerEndsAt(null);
      await fetchFocusData();
    } catch (err) {
      console.error('Failed to save focus session:', err);
      setError(err.response?.data?.message || 'Failed to save the completed focus session.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this focus session from your history?')) return;

    clearMessages();
    setDeletingId(id);
    try {
      await deleteFocusSession(id);
      setSuccess('Focus session deleted.');
      await fetchFocusData();
    } catch (err) {
      console.error('Failed to delete focus session:', err);
      setError(err.response?.data?.message || 'Failed to delete the focus session.');
    } finally {
      setDeletingId(null);
    }
  };

  const getSubject = (subjectData) => {
    const id = subjectData?._id || subjectData;
    return subjects.find((subject) => subject._id === id) || subjectData || null;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
            <Timer size={28} className="text-orange-600" />
            Focus Timer
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Run completed study sessions and save them to your focus history.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchFocusData}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
        >
          <RotateCcw size={15} />
          Refresh
        </button>
      </div>

      {subjects.length === 0 && !error && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-center shadow-sm">
          <BookOpen size={32} className="mx-auto mb-3 text-yellow-500" />
          <h2 className="text-lg font-bold text-yellow-800">Subjects Required</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-yellow-700">
            Focus sessions must be linked to a subject. Add a subject before starting the timer.
          </p>
          <Link
            to="/subjects"
            className="mt-4 inline-flex rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-yellow-950 transition-colors hover:bg-yellow-600"
          >
            Go to Subjects setup
          </Link>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1 text-sm">{error}</div>
          <button type="button" onClick={() => setError('')} className="rounded-md p-1 hover:bg-red-100">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1 text-sm">{success}</div>
          <button type="button" onClick={() => setSuccess('')} className="rounded-md p-1 hover:bg-emerald-100">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={subjects.length === 0 || isTimerLocked}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
              >
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => {
                  setSessionType(e.target.value);
                  setTimerStatus('idle');
                  setTimerEndsAt(null);
                }}
                disabled={isTimerLocked}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
              >
                {SESSION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Minutes</label>
              <input
                type="number"
                min="1"
                max="240"
                value={selectedMinutes}
                onChange={(e) => {
                  setCustomMinutes(e.target.value);
                  setSessionType('Custom');
                  setTimerStatus('idle');
                  setTimerEndsAt(null);
                }}
                disabled={isTimerLocked}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center text-center">
            <div className="relative grid h-72 w-72 place-items-center rounded-full bg-orange-50">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#ea580c ${progress}%, #fed7aa ${progress}% 100%)`
                }}
              />
              <div className="relative grid h-60 w-60 place-items-center rounded-full bg-white shadow-inner">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                    {timerStatus === 'finished' ? 'Complete' : sessionType}
                  </p>
                  <p className="mt-2 font-mono text-6xl font-black text-gray-900">
                    {formatTime(remainingSeconds)}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {formatMinutes(selectedMinutes)} planned
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {timerStatus === 'idle' || timerStatus === 'finished' ? (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={subjects.length === 0}
                  className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play size={18} />
                  Start
                </button>
              ) : null}

              {timerStatus === 'running' && (
                <button
                  type="button"
                  onClick={handlePause}
                  className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gray-800"
                >
                  <Pause size={18} />
                  Pause
                </button>
              )}

              {timerStatus === 'paused' && (
                <button
                  type="button"
                  onClick={handleResume}
                  className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700"
                >
                  <Play size={18} />
                  Resume
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <RotateCcw size={18} />
                Reset
              </button>

              <button
                type="button"
                onClick={handleSaveCompletedSession}
                disabled={timerStatus !== 'finished' || isSaving}
                className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                {isSaving ? 'Saving...' : 'Save Session'}
              </button>
            </div>

            <p className="mt-4 max-w-xl text-xs text-gray-500">
              Unfinished sessions are not saved. The save button unlocks after the timer reaches zero.
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <BarChart3 size={18} className="text-orange-500" />
              Focus Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Minutes</p>
                <p className="mt-1 text-2xl font-black text-gray-900">
                  {stats?.totalFocusMinutes || 0}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-500">Sessions</p>
                <p className="mt-1 text-2xl font-black text-gray-900">
                  {stats?.totalSessions || 0}
                </p>
              </div>
              <div className="col-span-2 rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">This Week</p>
                <p className="mt-1 text-2xl font-black text-gray-900">
                  {stats?.sessionsThisWeek || 0} sessions
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-sm font-bold text-gray-700">Minutes by Subject</p>
              {stats?.focusMinutesBySubject?.length > 0 ? (
                stats.focusMinutesBySubject.map((item) => (
                  <div key={item.subjectId} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-gray-700">{item.subjectName}</span>
                    <span className="text-gray-500">{formatMinutes(item.focusMinutes)}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                  No focus stats yet.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
          <Clock3 size={18} className="text-gray-500" />
          Focus History
        </h2>

        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
            <Timer size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No completed focus sessions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => {
              const subject = getSubject(session.subjectId);
              return (
                <div key={session._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: subject?.color || '#f97316' }}
                        />
                        <p className="truncate text-sm font-bold text-gray-900">
                          {subject?.name || 'Unknown subject'}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {formatMinutes(session.duration)} - {session.sessionType}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">{formatDateTime(session.completedAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(session._id)}
                      disabled={deletingId === session._id}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Delete focus session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default FocusTimer;

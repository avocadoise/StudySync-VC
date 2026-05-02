import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../api/dashboardApi';
import { getStudyRecommendation } from '../api/aiApi';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BookOpen,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader,
  FileText,
  Timer,
  CalendarDays,
  Tag,
  RefreshCw,
  LayoutDashboard,
  Inbox,
  Sparkles,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// ── Color palettes for charts ──────────────────────────────────────────
const STATUS_COLORS = {
  Pending: '#FBBF24',       // amber-400
  'In Progress': '#60A5FA', // blue-400
  Completed: '#34D399',     // emerald-400
};

const PRIORITY_COLORS = {
  Low: '#34D399',    // emerald-400
  Medium: '#FBBF24', // amber-400
  High: '#F87171',   // red-400
};

// ── Tiny helper to format a date string ────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ── Priority badge component ──────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const map = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[priority] || 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  );
};

// ── Status badge component ────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// ── Custom Recharts tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-gray-100 text-sm">
        <p className="font-semibold text-gray-700">{payload[0].name}</p>
        <p className="text-gray-500">{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};

// ═══════════════════════════════════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Fetch dashboard data on mount
  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDashboardSummary();
      setData(response.data); // backend returns { success, message, data }
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
      setError(
        err.response?.data?.message ||
        'Failed to load dashboard data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleGenerateRecommendation = async () => {
    setAiLoading(true);
    setAiError('');
    setAiRecommendation(null);
    try {
      const response = await getStudyRecommendation();
      setAiRecommendation(response.data);
    } catch (err) {
      console.error('AI Recommendation failed:', err);
      setAiError(
        err.response?.data?.message ||
        'Failed to generate AI Study Recommendation. Please try again.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return <LoadingSpinner />;
  }

  // ── Error state ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state (new user, no data yet) ────────────────────────────
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-10 max-w-lg w-full">
          <Inbox size={56} className="text-blue-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to StudySync!
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your dashboard is empty for now. Start by adding subjects, creating tasks,
            or taking notes — your progress will appear right here.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/subjects"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              <BookOpen size={16} /> Add Subjects
            </a>
            <a
              href="/tasks"
              className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-300 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              <ListTodo size={16} /> Create Tasks
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Prepare chart data arrays ──────────────────────────────────────
  const isDashboardEmpty =
    data.totalSubjects === 0 &&
    data.totalTasks === 0 &&
    data.totalNotes === 0 &&
    data.totalFocusMinutes === 0;

  const statusChartData = Object.entries(data.tasksByStatus || {})
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  const priorityChartData = Object.entries(data.tasksByPriority || {})
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  // ── Main dashboard ─────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <LayoutDashboard size={28} className="text-blue-600" />
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's an overview of your study progress, {user?.name ? user.name.split(' ')[0] : 'Student'}.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm self-start"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ────────── Stat Cards Grid ────────── */}
      {isDashboardEmpty && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center shadow-sm">
          <Inbox size={48} className="text-blue-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to StudySync!
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your dashboard is empty for now. Start by adding subjects, creating tasks,
            or taking notes. Your progress will appear here as you work.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/subjects"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              <BookOpen size={16} /> Add Subjects
            </a>
            <a
              href="/tasks"
              className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-300 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              <ListTodo size={16} /> Create Tasks
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen size={22} />}
          label="Subjects"
          value={data.totalSubjects}
          color="indigo"
        />
        <StatCard
          icon={<ListTodo size={22} />}
          label="Total Tasks"
          value={data.totalTasks}
          color="blue"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Pending"
          value={data.pendingTasks}
          color="yellow"
          subText="Awaiting action"
        />
        <StatCard
          icon={<Loader size={22} />}
          label="In Progress"
          value={data.inProgressTasks}
          color="teal"
          subText="Currently working"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Completed"
          value={data.completedTasks}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={22} />}
          label="Overdue"
          value={data.overdueTasks}
          color="red"
          subText={data.overdueTasks > 0 ? 'Needs attention!' : 'All caught up'}
        />
        <StatCard
          icon={<FileText size={22} />}
          label="Notes"
          value={data.totalNotes}
          color="purple"
        />
        <StatCard
          icon={<Timer size={22} />}
          label="Focus Minutes"
          value={data.totalFocusMinutes}
          color="orange"
          subText={`≈ ${(data.totalFocusMinutes / 60).toFixed(1)} hrs`}
        />
      </div>

      {/* ────────── AI Study Recommendation ────────── */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              AI Study Recommendation
            </h3>
            <p className="text-indigo-700 text-sm mt-1 max-w-2xl">
              Get personalized, real-time advice tailored to your pending tasks, upcoming study sessions, and focus history. 
              <span className="block mt-1 text-xs opacity-80 font-medium">
                Note: Recommendations are based on your current tasks, study plans, and focus records.
              </span>
            </p>
          </div>
          <button
            onClick={handleGenerateRecommendation}
            disabled={aiLoading}
            className="shrink-0 inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {aiLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb size={18} />
                Generate Recommendation
              </>
            )}
          </button>
        </div>

        {/* Dynamic Display Area */}
        <div className="relative z-10">
          {aiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <div className="flex-1 text-sm">{aiError}</div>
            </div>
          )}

          {aiRecommendation && !aiError && !aiLoading && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-50">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <ArrowRight size={16} className="text-indigo-500" />
                  Priority Focus
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiRecommendation.mainRecommendation || 'No primary recommendation was returned.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-50">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide opacity-80">
                    Priority Subjects
                  </h4>
                  {aiRecommendation.prioritySubjects?.length > 0 ? (
                    <ul className="space-y-2">
                      {aiRecommendation.prioritySubjects.map((sub, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                          <span className="flex-1">
                            <span className="font-semibold">{sub.subject || sub}</span>
                            {sub.reason ? <span className="block text-gray-500">{sub.reason}</span> : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No specific subjects flagged.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-50">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide opacity-80">
                    Suggested Actions
                  </h4>
                  {aiRecommendation.suggestedActions?.length > 0 ? (
                    <ul className="space-y-2">
                      {aiRecommendation.suggestedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                          <span className="flex-1">{action}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No specific actions suggested.</p>
                  )}
                </div>
              </div>

              {aiRecommendation.warning && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-5 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 shrink-0 text-yellow-500" size={20} />
                  <div>
                    <h4 className="font-bold mb-1">Warning</h4>
                    <p className="text-sm leading-relaxed">{aiRecommendation.warning}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Default Placeholder when untouched */}
          {!aiRecommendation && !aiError && !aiLoading && (
            <div className="bg-white/60 rounded-xl p-6 border border-white/40 text-center backdrop-blur-sm">
              <Lightbulb size={28} className="text-indigo-300 mx-auto mb-2 opacity-70" />
              <p className="text-indigo-900/60 text-sm font-medium">
                Click "Generate Recommendation" to calculate your optimal study strategy for today.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ────────── Charts Row ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status — Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tasks by Status</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {statusChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No task data to display.</p>
          )}
        </div>

        {/* Tasks by Priority — Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tasks by Priority</h3>
          {priorityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityChartData} barSize={40}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 13, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {priorityChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PRIORITY_COLORS[entry.name] || '#94A3B8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No task data to display.</p>
          )}
        </div>
      </div>

      {/* ────────── Lists Row ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-blue-500" />
            Upcoming Tasks
          </h3>
          {data.upcomingTasks && data.upcomingTasks.length > 0 ? (
            <ul className="space-y-3">
              {data.upcomingTasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                >
                  <div className="mt-0.5">
                    <ListTodo size={16} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Due: {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="text-green-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No upcoming tasks. You're all clear!</p>
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-purple-500" />
            Recent Notes
          </h3>
          {data.recentNotes && data.recentNotes.length > 0 ? (
            <ul className="space-y-3">
              {data.recentNotes.map((note) => (
                <li
                  key={note._id}
                  className="p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {note.title}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex flex-wrap gap-1">
                      {note.tags && note.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-0.5 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full"
                        >
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <FileText size={32} className="text-purple-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No notes yet. Start writing!</p>
            </div>
          )}
        </div>

        {/* Recent Focus Sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Timer size={18} className="text-orange-500" />
            Recent Focus Sessions
          </h3>
          {data.recentFocusSessions && data.recentFocusSessions.length > 0 ? (
            <ul className="space-y-3">
              {data.recentFocusSessions.map((session) => (
                <li
                  key={session._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 text-orange-500">
                    <Timer size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {session.duration} min
                      {session.sessionType && (
                        <span className="text-xs font-normal text-gray-400 ml-1">
                          · {session.sessionType}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {session.subjectId?.name && (
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: session.subjectId.color || '#6B7280' }}
                        />
                      )}
                      {session.subjectId?.name || 'General'}
                      {' · '}
                      {formatDate(session.completedAt)}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    session.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {session.status || '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <Timer size={32} className="text-orange-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No sessions yet. Start focusing!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

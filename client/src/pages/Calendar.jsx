import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getCalendarEvents } from '../api/calendarApi';
import { getSubjects } from '../api/subjectApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Filter,
  ListTodo,
  Timer,
  X
} from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'task', label: 'Tasks' },
  { value: 'studyPlan', label: 'Study Plans' },
  { value: 'focusSession', label: 'Focus Sessions' }
];

const TYPE_META = {
  task: {
    label: 'Task',
    icon: ListTodo,
    bg: '#f97316',
    border: '#ea580c',
    text: '#ffffff',
    pill: 'bg-orange-100 text-orange-700'
  },
  studyPlan: {
    label: 'Study Plan',
    icon: CalendarDays,
    bg: '#6366f1',
    border: '#4f46e5',
    text: '#ffffff',
    pill: 'bg-indigo-100 text-indigo-700'
  },
  focusSession: {
    label: 'Focus Session',
    icon: Timer,
    bg: '#10b981',
    border: '#059669',
    text: '#ffffff',
    pill: 'bg-emerald-100 text-emerald-700'
  }
};

const toDateOnly = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    start: toDateOnly(start),
    end: toDateOnly(end)
  };
};

const formatDateTime = (value) => {
  if (!value) return 'Not set';

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const formatDateOnly = (value) => {
  if (!value) return 'Not set';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getEventStyle = (event) => {
  const base = TYPE_META[event.type] || TYPE_META.task;
  const isMuted = event.type !== 'focusSession' && ['Completed', 'Done', 'Cancelled'].includes(event.status);

  if (isMuted) {
    return {
      backgroundColor: '#e5e7eb',
      borderColor: '#cbd5e1',
      textColor: '#475569'
    };
  }

  return {
    backgroundColor: base.bg,
    borderColor: base.border,
    textColor: base.text
  };
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [range, setRange] = useState(getDefaultRange);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectsLoading(true);
      try {
        const response = await getSubjects();
        setSubjects(response.data || []);
      } catch (err) {
        console.error('Failed to load subjects for calendar:', err);
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!range.start || !range.end) return;

      setLoading(true);
      setError('');
      try {
        const response = await getCalendarEvents(range);
        setEvents(response.data || []);
      } catch (err) {
        console.error('Failed to load calendar events:', err);
        setError(err.response?.data?.message || 'Failed to load calendar events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [range]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = selectedType === 'all' || event.type === selectedType;
      const matchesSubject = selectedSubject ? event.subjectId === selectedSubject : true;
      return matchesType && matchesSubject;
    });
  }, [events, selectedSubject, selectedType]);

  const calendarEvents = useMemo(() => {
    return filteredEvents.map((event) => {
      const style = getEventStyle(event);
      const isTask = event.type === 'task';

      return {
        id: event.id,
        title: event.title,
        start: isTask ? event.start?.split('T')[0] : event.start,
        end: isTask ? event.end?.split('T')[0] : event.end,
        allDay: isTask,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        textColor: style.textColor,
        extendedProps: event
      };
    });
  }, [filteredEvents]);

  const counts = useMemo(() => {
    return events.reduce(
      (acc, event) => ({
        ...acc,
        [event.type]: (acc[event.type] || 0) + 1
      }),
      { task: 0, studyPlan: 0, focusSession: 0 }
    );
  }, [events]);

  const handleDatesSet = (info) => {
    const inclusiveEnd = new Date(info.end);
    inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);

    const nextRange = {
      start: toDateOnly(info.start),
      end: toDateOnly(inclusiveEnd)
    };

    setRange((previousRange) =>
      previousRange.start === nextRange.start && previousRange.end === nextRange.end
        ? previousRange
        : nextRange
    );
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event.extendedProps);
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedSubject('');
  };

  const typeMeta = selectedEvent ? TYPE_META[selectedEvent.type] : null;
  const EventIcon = typeMeta?.icon || Clock;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
            <CalendarDays size={28} className="text-blue-600" />
            Academic Calendar
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View tasks, study sessions, and completed focus sessions in one calendar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 font-semibold text-orange-700">
            <ListTodo size={16} /> {counts.task} Tasks
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 font-semibold text-indigo-700">
            <CalendarDays size={16} /> {counts.studyPlan} Study Plans
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
            <Timer size={16} /> {counts.focusSession} Focus Sessions
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1 text-sm">{error}</div>
          <button type="button" onClick={() => setError('')} className="rounded-md p-1 hover:bg-red-100">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <Filter size={18} />
            Filters
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              disabled={subjectsLoading || subjects.length === 0}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>

            {(selectedType !== 'all' || selectedSubject) && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading && events.length === 0 ? (
          <div className="flex min-h-[520px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="relative">
            {loading && (
              <div className="absolute inset-x-0 top-0 z-10 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                Refreshing calendar events...
              </div>
            )}
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
              }}
              datesSet={handleDatesSet}
              eventClick={handleEventClick}
              events={calendarEvents}
              height="auto"
              dayMaxEvents={3}
              eventDisplay="block"
              nowIndicator
            />
          </div>
        )}

        {!loading && events.length > 0 && filteredEvents.length === 0 && (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-center text-sm font-medium text-gray-500">
            No calendar events match the active filters.
          </div>
        )}
      </section>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: getEventStyle(selectedEvent).backgroundColor }}
                >
                  <EventIcon size={22} />
                </div>
                <div>
                  <p className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${typeMeta?.pill}`}>
                    {typeMeta?.label || 'Calendar Event'}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Subject" value={selectedEvent.subject} color={selectedEvent.color} />
                <Detail label="Status" value={selectedEvent.status || 'Not set'} />
                {selectedEvent.priority && <Detail label="Priority" value={selectedEvent.priority} />}
                {selectedEvent.sessionType && <Detail label="Session Type" value={selectedEvent.sessionType} />}
                {selectedEvent.duration && <Detail label="Duration" value={`${selectedEvent.duration} minutes`} />}
                <Detail
                  label="Start"
                  value={selectedEvent.type === 'task' ? formatDateOnly(selectedEvent.start) : formatDateTime(selectedEvent.start)}
                />
                {selectedEvent.type === 'studyPlan' && <Detail label="End" value={formatDateTime(selectedEvent.end)} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value, color }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
    <div className="flex items-center gap-2 font-semibold text-gray-800">
      {color && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />}
      <span>{value}</span>
    </div>
  </div>
);

export default CalendarPage;

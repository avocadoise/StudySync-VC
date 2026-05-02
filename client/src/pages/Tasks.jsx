import { useState, useEffect } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} from '../api/taskApi';
import { getSubjects } from '../api/subjectApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ListTodo, Plus, Pencil, Trash2, AlertTriangle, CalendarDays,
  BookOpen, X, Filter, Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Styling utilities for Priority and Status tags
const PRIORITY_COLORS = {
  Urgent: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
};

const STATUS_COLORS = {
  Pending: 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Overdue: 'bg-rose-100 text-rose-700 border-rose-200',
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // Modals & Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
  });

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, subjectsRes] = await Promise.all([
        getTasks(),
        getSubjects()
      ]);
      setTasks(tasksRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load tasks or subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Derived State: filtered and sorted tasks
  const filteredTasks = tasks
    .filter(task => (filterStatus ? task.status === filterStatus : true))
    .filter(task => (filterPriority ? task.priority === filterPriority : true))
    .filter(task => {
      // Check subject filter using underlying nested structure if populated
      const id = task.subjectId?._id || task.subjectId;
      return filterSubject ? id === filterSubject : true;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Ascending by date

  // Helpers
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'No Date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const openAddModal = () => {
    if (subjects.length === 0) return;
    setFormError('');
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      subjectId: subjects.length > 0 ? subjects[0]._id : '',
      dueDate: '',
      priority: 'Medium',
      status: 'Pending',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (task) => {
    setFormError('');
    setEditingId(task._id);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      subjectId: task.subjectId?._id || task.subjectId || '',
      dueDate: formatDateForInput(task.dueDate),
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => setIsFormModalOpen(false);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setFormError('Title is required.'); return; }
    if (!formData.subjectId) { setFormError('Subject is required.'); return; }
    if (!formData.dueDate) { setFormError('Due date is required.'); return; }
    if (!formData.priority) { setFormError('Priority is required.'); return; }
    if (!formData.status) { setFormError('Status is required.'); return; }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateTask(editingId, formData);
      } else {
        await createTask(formData);
      }
      setIsFormModalOpen(false);
      fetchData(); // Refresh to catch populated subjects
    } catch (err) {
      console.error('Save failed:', err);
      setFormError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(deletingId);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.message || 'Failed to delete task.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickStatusUpdate = async (taskId, newStatus) => {
    try {
      // Optimistic flush
      setTasks(tasks.map(t => (t._id === taskId ? { ...t, status: newStatus } : t)));
      await updateTaskStatus(taskId, newStatus);
      fetchData(); // Re-sync quietly
    } catch (err) {
      console.error('Status update failed:', err);
      setError(err.response?.data?.message || 'Failed to update task status.');
      fetchData(); // Revert on fail
    }
  };

  const getSubjectDisplayInfo = (taskSubjObj) => {
    if (!taskSubjObj) return { name: 'Unknown Subject', color: '#9CA3AF' };
    // It might be populated object { _id, name, color } or a string (ID)
    if (typeof taskSubjObj === 'object') {
      return { name: taskSubjObj.name, color: taskSubjObj.color || '#3b82f6' };
    }
    // fallback if unpopulated but in state
    const matched = subjects.find(s => s._id === taskSubjObj);
    return matched ? { name: matched.name, color: matched.color || '#3b82f6' } : { name: 'Unknown', color: '#9CA3AF' };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <ListTodo size={28} className="text-blue-600" />
            Tasks & Assignments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your assignments, essays, and to-do items.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={subjects.length === 0}
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={subjects.length === 0 ? "You must create a subject first." : ""}
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* ── Require Subject Warning Banner ── */}
      {subjects.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <BookOpen size={32} className="text-yellow-500 mb-3" />
          <h2 className="text-lg font-bold text-yellow-800 mb-1">Subjects Required</h2>
          <p className="text-yellow-700 text-sm max-w-lg mb-4">
            Before you can create tasks, you need to add your school subjects. Tasks must be linked to a specific class or module.
          </p>
          <Link to="/subjects" className="bg-yellow-500 text-yellow-950 font-medium px-4 py-2 rounded-xl text-sm hover:bg-yellow-600 transition-colors">
            Go to Subjects setup
          </Link>
        </div>
      )}

      {/* ── Error Display ── */}
      {error && !isDeleteModalOpen && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-md">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Filters Bar ── */}
      {subjects.length > 0 && tasks.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-end lg:items-center">
          <div className="flex items-center gap-2 text-gray-500 font-medium whitespace-nowrap">
            <Filter size={18} />
            <span className="text-sm">Filters:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {(filterStatus || filterPriority || filterSubject) && (
            <button
              onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterSubject(''); }}
              className="text-sm text-gray-500 hover:text-gray-800 whitespace-nowrap uppercase tracking-wider font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Main Task Content ── */}
      {subjects.length > 0 && tasks.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm min-h-[40vh]">
          <div className="w-16 h-16 bg-blue-50 text-blue-400 flex items-center justify-center rounded-2xl mb-4">
            <Inbox size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No tasks available</h2>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            You're all caught up! Create a new task to start tracking your workload.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={16} /> Create First Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const subjInfo = getSubjectDisplayInfo(task.subjectId);
            return (
              <div
                key={task._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col group relative"
              >
                {/* Visual Status Indicator / Corner dot */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-white/80 backdrop-blur pl-2 rounded-l-lg">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(task._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Subject & Priority Tags */}
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-100 truncate max-w-[50%] overflow-hidden">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subjInfo.color }} />
                    <span className="truncate">{subjInfo.name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border ${PRIORITY_COLORS[task.priority] || 'bg-gray-100'}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 mb-4">
                  <h3 className={`text-lg font-bold truncate pr-14 ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`} title={task.title}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Footer details */}
                <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500 gap-1.5">
                      <CalendarDays size={14} className={new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-500' : 'text-gray-400'} />
                      <span className={new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-600 font-medium' : ''}>
                        {formatDateDisplay(task.dueDate)}
                      </span>
                    </div>

                    {/* Quick Status Dropdown */}
                    <div className="relative">
                      <select
                        value={task.status}
                        onChange={(e) => handleQuickStatusUpdate(task._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[task.status] || 'bg-white text-gray-800'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1 text-current opacity-70">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {subjects.length > 0 && tasks.length > 0 && filteredTasks.length === 0 && (
             <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
               <p className="text-gray-500 font-medium">No tasks found matching your active filters.</p>
               <button onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterSubject(''); }} className="mt-2 text-sm text-blue-600 hover:underline">
                 Clear all filters
               </button>
             </div>
          )}
        </div>
      )}

      {/* ── Form Modal ── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Task' : 'Add Task'}
              </h2>
              <button onClick={closeFormModal} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleFormSubmit}>
                {formError && (
                  <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                      placeholder="e.g. Complete chapter 4 reading"
                      autoFocus
                    />
                  </div>
                  
                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    >
                      {subjects.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>

                  {/* Description Box */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white resize-none"
                      placeholder="Add any extra details, links, or instructions..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3 justify-end border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;

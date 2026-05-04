import { useState, useEffect } from 'react';
import {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  updateStudyPlanStatus,
  deleteStudyPlan
} from '../api/studyPlanApi';
import { getSubjects } from '../api/subjectApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Plus, Pencil, Trash2, AlertTriangle, BookOpen,
  Clock, X, Filter, Target
} from 'lucide-react';

const STATUS_COLORS = {
  Planned: 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Missed: 'bg-red-100 text-red-700 border-red-200',
  Cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
};

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [filterDate, setFilterDate] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals & Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    topic: '',
    subjectId: '',
    studyDate: '',
    startTime: '',
    endTime: '',
    notes: '',
    status: 'Planned',
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
      const [plansRes, subjectsRes] = await Promise.all([
        getStudyPlans(),
        getSubjects()
      ]);
      setPlans(plansRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load study plans or subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for date & time
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'No Date';
    // Ensure we handle the timezone correctly to prevent off-by-one errors for just pure dates.
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  // Derived State: filtered and sorted plans
  const filteredPlans = plans
    .filter(plan => (filterStatus ? plan.status === filterStatus : true))
    .filter(plan => {
      if (!filterSubject) return true;
      const id = plan.subjectId?._id || plan.subjectId;
      return id === filterSubject;
    })
    .filter(plan => {
      if (!filterDate) return true;
      const planDate = formatDateForInput(plan.studyDate);
      return planDate === filterDate;
    })
    .sort((a, b) => {
      // Primary sort by date, Secondary sort by start time
      const dateA = new Date(a.studyDate).getTime();
      const dateB = new Date(b.studyDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });

  const getSubjectDisplayInfo = (subjObj) => {
    if (!subjObj) return { name: 'Unknown Subject', color: '#9CA3AF' };
    if (typeof subjObj === 'object') {
      return { name: subjObj.name, color: subjObj.color || '#3b82f6' };
    }
    const matched = subjects.find(s => s._id === subjObj);
    return matched ? { name: matched.name, color: matched.color || '#3b82f6' } : { name: 'Unknown', color: '#9CA3AF' };
  };

  const openAddModal = () => {
    if (subjects.length === 0) return;
    setFormError('');
    setEditingId(null);
    setFormData({
      topic: '',
      subjectId: subjects.length > 0 ? subjects[0]._id : '',
      studyDate: formatDateForInput(new Date().toISOString()),
      startTime: '',
      endTime: '',
      notes: '',
      status: 'Planned',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (plan) => {
    setFormError('');
    setEditingId(plan._id);
    setFormData({
      topic: plan.topic || '',
      subjectId: plan.subjectId?._id || plan.subjectId || '',
      studyDate: formatDateForInput(plan.studyDate),
      startTime: plan.startTime || '',
      endTime: plan.endTime || '',
      notes: plan.notes || '',
      status: plan.status || 'Planned',
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
    if (!formData.topic.trim()) { setFormError('Topic is required.'); return; }
    if (!formData.subjectId) { setFormError('Subject is required.'); return; }
    if (!formData.studyDate) { setFormError('Study Date is required.'); return; }
    if (!formData.startTime) { setFormError('Start time is required.'); return; }
    if (!formData.endTime) { setFormError('End time is required.'); return; }
    if (!formData.status) { setFormError('Status is required.'); return; }

    // End Time Validation
    const startObj = new Date(`1970-01-01T${formData.startTime}:00Z`);
    const endObj = new Date(`1970-01-01T${formData.endTime}:00Z`);
    
    if (endObj <= startObj) {
      setFormError('End time must be later than start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateStudyPlan(editingId, formData);
      } else {
        await createStudyPlan(formData);
      }
      setIsFormModalOpen(false);
      fetchData(); // Refresh list cleanly
    } catch (err) {
      console.error('Save failed:', err);
      setFormError(err.response?.data?.message || 'Failed to save study plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async (planId, newStatus) => {
    try {
      // Optimistic update
      setPlans(plans.map(p => (p._id === planId ? { ...p, status: newStatus } : p)));
      await updateStudyPlanStatus(planId, newStatus);
      fetchData();
    } catch (err) {
      console.error('Status update failed:', err);
      setError(err.response?.data?.message || 'Failed to update plan status.');
      fetchData(); // revert mapping on error
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
      await deleteStudyPlan(deletingId);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.message || 'Failed to delete study plan.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // UI rendering
  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <CalendarDays size={28} className="text-teal-600" />
            Study Planner
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Schedule study sessions and track your prep time.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={subjects.length === 0}
          className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={subjects.length === 0 ? "You must create a subject first." : ""}
        >
          <Plus size={16} />
          Plan Session
        </button>
      </div>

      {/* Warning Banner */}
      {subjects.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <BookOpen size={32} className="text-yellow-500 mb-3" />
          <h2 className="text-lg font-bold text-yellow-800 mb-1">Subjects Required</h2>
          <p className="text-yellow-700 text-sm max-w-lg mb-4">
            Before you can map out a study plan, you need to add your school subjects. Study plans are linked to specific classes.
          </p>
          <Link to="/subjects" className="bg-yellow-500 text-yellow-950 font-medium px-4 py-2 rounded-xl text-sm hover:bg-yellow-600 transition-colors">
            Configure Subjects
          </Link>
        </div>
      )}

      {/* Error Message */}
      {error && !isDeleteModalOpen && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-md">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      {subjects.length > 0 && plans.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-end lg:items-center">
          <div className="flex items-center gap-2 text-gray-500 font-medium whitespace-nowrap">
            <Filter size={18} />
            <span className="text-sm">Filters:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none"
              title="Filter by Exact Date"
            />

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {(filterStatus || filterDate || filterSubject) && (
            <button
              onClick={() => { setFilterStatus(''); setFilterDate(''); setFilterSubject(''); }}
              className="text-sm text-gray-500 hover:text-gray-800 whitespace-nowrap uppercase tracking-wider font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Main List Content */}
      {subjects.length > 0 && plans.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm min-h-[40vh]">
          <div className="w-16 h-16 bg-teal-50 text-teal-400 flex items-center justify-center rounded-2xl mb-4">
            <Target size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No study sessions planned</h2>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            Preparation is the key to success. Start organizing your study sessions now!
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-teal-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors text-sm"
          >
            <Plus size={16} /> Plan First Session
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPlans.map((plan) => {
            const subjInfo = getSubjectDisplayInfo(plan.subjectId);
            const isCompleted = plan.status === 'Completed';
            const isMissed = plan.status === 'Missed' || plan.status === 'Cancelled';
            
            return (
              <div
                key={plan._id}
                className={`bg-white border text-left border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:items-center group relative overflow-hidden ${isCompleted ? 'opacity-70' : ''}`}
              >
                {/* Visual Status Indicator Color Strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: subjInfo.color }}
                />

                {/* Left block: Date/Time */}
                <div className="pl-2 sm:pl-4 min-w-[160px] flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-gray-100 pb-3 sm:pb-0 sm:pr-4">
                  <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
                    <CalendarDays size={16} className={`shrink-0 ${isMissed ? 'text-red-400' : 'text-teal-500'}`} />
                    <span className="text-sm">{formatDateDisplay(plan.studyDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={14} className="shrink-0 text-gray-400" />
                    <span className="text-xs font-medium">
                      {formatTimeDisplay(plan.startTime)} - {formatTimeDisplay(plan.endTime)}
                    </span>
                  </div>
                </div>

                {/* Center block: Details */}
                <div className="flex-1 flex flex-col pl-2 sm:pl-0 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-2 py-0.5 rounded text-[11px] font-bold border border-gray-100 uppercase tracking-wider truncate max-w-[150px]">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: subjInfo.color }} />
                      <span className="truncate">{subjInfo.name}</span>
                    </span>
                  </div>
                  <h3 className={`text-base font-bold truncate pr-2 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`} title={plan.topic}>
                    {plan.topic}
                  </h3>
                  {plan.notes && (
                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5" title={plan.notes}>
                      {plan.notes}
                    </p>
                  )}
                </div>

                {/* Right block: Action & Quick Status Update */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-2 sm:pl-0 mt-2 sm:mt-0">
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={plan.status}
                      onChange={(e) => handleQuickStatusUpdate(plan._id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border appearance-none cursor-pointer pr-7 focus:outline-none focus:ring-2 focus:ring-teal-500 ${STATUS_COLORS[plan.status] || 'bg-white text-gray-800'}`}
                    >
                      <option value="Planned">Planned</option>
                      <option value="Completed">Completed</option>
                      <option value="Missed">Missed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-1 text-current opacity-70">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>

                  {/* Icon Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(plan._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {subjects.length > 0 && plans.length > 0 && filteredPlans.length === 0 && (
             <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
               <p className="text-gray-500 font-medium">No study sessions matching your filters.</p>
               <button onClick={() => { setFilterStatus(''); setFilterDate(''); setFilterSubject(''); }} className="mt-2 text-sm text-teal-600 hover:underline">
                 Clear all filters
               </button>
             </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Study Session' : 'Plan Session'}
              </h2>
              <button onClick={closeFormModal} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleFormSubmit} id="planForm">
                {formError && (
                  <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Topic & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Topic <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="topic"
                        value={formData.topic}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white"
                        placeholder="What are you studying?"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white"
                      >
                        {subjects.map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date, Start Time, End Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-gray-100 py-4 my-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="studyDate"
                        value={formData.studyDate}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Notes Area & Status */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="w-full sm:w-1/2 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white"
                      >
                        <option value="Planned">Planned</option>
                        <option value="Completed">Completed</option>
                        <option value="Missed">Missed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleFormChange}
                        rows="2"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white resize-none text-sm"
                        placeholder="Any goals or materials for this session?"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={closeFormModal}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="planForm"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-sm"
              >
                {isSubmitting ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Session</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this study session block?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
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

export default StudyPlanner;

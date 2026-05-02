import { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjectApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BookOpen, Plus, Pencil, Trash2, AlertTriangle, User,
  Clock, Hash, X
} from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    instructor: '',
    schedule: '',
    color: '#3b82f6'
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getSubjects();
      // response.data holds the actual array from the backend controller
      setSubjects(response.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError(err.response?.data?.message || 'Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormError('');
    setEditingId(null);
    setFormData({ name: '', code: '', instructor: '', schedule: '', color: '#3b82f6' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (subject) => {
    setFormError('');
    setEditingId(subject._id);
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      instructor: subject.instructor || '',
      schedule: subject.schedule || '',
      color: subject.color || '#3b82f6'
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateSubject(editingId, formData);
      } else {
        await createSubject(formData);
      }
      setIsFormModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error('Save failed:', err);
      setFormError(err.response?.data?.message || 'Failed to save subject.');
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
      await deleteSubject(deletingId);
      setIsDeleteModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.message || 'Failed to delete subject.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <BookOpen size={28} className="text-indigo-600" />
            Subjects
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your courses and learning modules.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm"
        >
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {error && !isDeleteModalOpen && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-md">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content */}
      {subjects.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm min-h-[50vh]">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-400 flex items-center justify-center rounded-2xl mb-4">
            <BookOpen size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No subjects yet</h2>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            You haven't added any subjects. Create your first subject to start tracking tasks and notes!
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus size={16} /> Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="bg-white border text-left border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col pt-7"
            >
              {/* Top border color decor */}
              <div
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ backgroundColor: sub.color || '#4f46e5' }}
              />

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-2">
                    {sub.name}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Subject"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(sub._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  <div className="flex items-start text-sm text-gray-600">
                    <div className="w-5 flex justify-center text-gray-400 mr-2 mt-0.5"><Hash size={14} /></div>
                    <span className="truncate">{sub.code || <span className="text-gray-400 italic">No code set</span>}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <div className="w-5 flex justify-center text-gray-400 mr-2 mt-0.5"><User size={14} /></div>
                    <span className="truncate">{sub.instructor || <span className="text-gray-400 italic">No instructor</span>}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <div className="w-5 flex justify-center text-gray-400 mr-2 mt-0.5"><Clock size={14} /></div>
                    <span className="line-clamp-2">{sub.schedule || <span className="text-gray-400 italic">No schedule</span>}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <button
                onClick={closeFormModal}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-50 focus:bg-white"
                      placeholder="e.g. Mathematics"
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Code
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
                        placeholder="e.g. MAT101"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Color Tag
                      </label>
                      <div className="flex items-center gap-3 mt-1 h-11 px-2 border border-gray-300 rounded-xl bg-gray-50">
                        <input
                          type="color"
                          name="color"
                          value={formData.color}
                          onChange={handleFormChange}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="text-sm text-gray-600 font-mono uppercase">
                          {formData.color}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
                      placeholder="e.g. Dr. Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Schedule
                    </label>
                    <input
                      type="text"
                      name="schedule"
                      value={formData.schedule}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
                      placeholder="e.g. Mon/Wed 10:00 AM"
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
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Subject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Subject</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this subject? It might break tasks associated with it. This action cannot be undone.
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

export default Subjects;

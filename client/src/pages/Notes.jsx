import { useState, useEffect } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from '../api/noteApi';
import { getSubjects } from '../api/subjectApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText, Plus, Pencil, Trash2, AlertTriangle, BookOpen,
  Search, X, Sparkles, Filter, Inbox, Tag, Calendar, Eye
} from 'lucide-react';

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [filterSubject, setFilterSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    content: '',
    tags: '', // We'll handle this as a comma-separated string in the form
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
      const [notesRes, subjectsRes] = await Promise.all([
        getNotes(),
        getSubjects()
      ]);
      setNotes(notesRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load notes or subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Derived State: filtered and searched notes
  const filteredNotes = notes
    .filter(note => {
      if (!filterSubject) return true;
      const subjId = note.subjectId?._id || note.subjectId;
      return subjId === filterSubject;
    })
    .filter(note => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (note.title && note.title.toLowerCase().includes(query)) ||
        (note.content && note.content.toLowerCase().includes(query)) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getSubjectDisplayInfo = (subjData) => {
    if (!subjData) return { name: 'Unknown Subject', color: '#9CA3AF' };
    if (typeof subjData === 'object') {
      return { name: subjData.name, color: subjData.color || '#8b5cf6' };
    }
    const matched = subjects.find(s => s._id === subjData);
    return matched ? { name: matched.name, color: matched.color || '#8b5cf6' } : { name: 'Unknown', color: '#9CA3AF' };
  };

  const openAddModal = () => {
    if (subjects.length === 0) return;
    setFormError('');
    setEditingId(null);
    setSelectedNote(null);
    setFormData({
      title: '',
      subjectId: subjects.length > 0 ? subjects[0]._id : '',
      content: '',
      tags: '',
    });
    setIsFormModalOpen(true);
  };

  const openViewModal = (note) => {
    setSelectedNote(note);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedNote(null);
  };

  const openEditModal = (note) => {
    setFormError('');
    setIsViewModalOpen(false);
    setSelectedNote(note);
    setEditingId(note._id);
    setFormData({
      title: note.title || '',
      subjectId: note.subjectId?._id || note.subjectId || '',
      content: note.content || '',
      tags: note.tags ? note.tags.join(', ') : '',
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setFormError('Title is required.'); return; }
    if (!formData.subjectId) { setFormError('Subject is required.'); return; }
    if (!formData.content.trim()) { setFormError('Content is required.'); return; }

    setIsSubmitting(true);
    try {
      // Convert comma-separated tags to array
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t !== '');

      const payload = {
        ...formData,
        tags: tagsArray
      };

      if (editingId) {
        await updateNote(editingId, payload);
      } else {
        await createNote(payload);
      }
      setIsFormModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save failed:', err);
      setFormError(err.response?.data?.message || 'Failed to save note.');
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
      await deleteNote(deletingId);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.message || 'Failed to delete note.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateAI = (note) => {
    if (!note.content || note.content.trim() === '') {
      setError('Cannot generate AI Reviewer for an empty note.');
      return;
    }
    // Navigate to AI Reviewer and pass the note data via route state
    navigate('/ai-reviewer', { state: { noteId: note._id, prefilledContent: note.content } });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <FileText size={28} className="text-purple-600" />
            Notes & Reviewer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Organize your study materials and generate AI quizzes.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={subjects.length === 0}
          className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={subjects.length === 0 ? "You must create a subject first." : ""}
        >
          <Plus size={16} />
          Create Note
        </button>
      </div>

      {/* ── Require Subject Warning Banner ── */}
      {subjects.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <BookOpen size={32} className="text-yellow-500 mb-3" />
          <h2 className="text-lg font-bold text-yellow-800 mb-1">Subjects Required</h2>
          <p className="text-yellow-700 text-sm max-w-lg mb-4">
            Before creating notes, you need to add your subjects. Notes must be linked to a class.
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

      {/* ── Search & Filters Bar ── */}
      {subjects.length > 0 && (notes.length > 0 || searchQuery || filterSubject) && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search in notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={18} className="text-gray-400 hidden md:block" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-xl px-3 py-2 w-full md:w-48 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            
            {(searchQuery || filterSubject) && (
              <button
                onClick={() => { setSearchQuery(''); setFilterSubject(''); }}
                className="text-sm text-gray-500 hover:text-gray-800 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Main Notes Content ── */}
      {subjects.length > 0 && notes.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm min-h-[40vh]">
          <div className="w-16 h-16 bg-purple-50 text-purple-400 flex items-center justify-center rounded-2xl mb-4">
            <Inbox size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No notes yet</h2>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Keep your study materials organized. Create your first note.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors text-sm"
          >
            <Plus size={16} /> Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredNotes.map((note) => {
            const subjInfo = getSubjectDisplayInfo(note.subjectId);
            return (
              <div
                key={note._id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group relative min-h-80"
              >
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-white/90 backdrop-blur pl-2 rounded-l-lg dark:bg-slate-900/90 dark:border dark:border-slate-700 dark:shadow-lg">
                  <button
                    onClick={() => openViewModal(note)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                    title="View Note"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors dark:text-slate-400 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
                    title="Edit Note"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(note._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                    title="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Subject Badge */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-100">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subjInfo.color }} />
                    <span className="truncate max-w-[150px]">{subjInfo.name}</span>
                  </div>
                </div>

                {/* Content */}
                <button
                  type="button"
                  className="flex-1 mb-5 cursor-pointer text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  onClick={() => openViewModal(note)}
                >
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 pr-20 mb-3" title={note.title}>
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-6 leading-7 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </button>

                {/* Footer details */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                         <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                           <Tag size={10} /> {tag}
                         </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-medium">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-gray-400 text-xs gap-1.5">
                      <Calendar size={12} />
                      {formatDate(note.createdAt)}
                    </div>
                    
                    <button
                      onClick={() => handleGenerateAI(note)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Sparkles size={14} />
                      AI Reviewer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {notes.length > 0 && filteredNotes.length === 0 && (
             <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
               <p className="text-gray-500 font-medium">No notes match your active search or filters.</p>
               <button onClick={() => { setSearchQuery(''); setFilterSubject(''); }} className="mt-2 text-sm text-purple-600 hover:underline">
                 Clear all filters
               </button>
             </div>
          )}
        </div>
      )}

      {/* Read-only View Modal */}
      {isViewModalOpen && selectedNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-start md:justify-between dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getSubjectDisplayInfo(selectedNote.subjectId).color }}
                    />
                    {getSubjectDisplayInfo(selectedNote.subjectId).name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                    <Calendar size={12} />
                    {formatDate(selectedNote.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Eye size={12} />
                    Read-only
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight dark:text-slate-50">
                  {selectedNote.title}
                </h2>
              </div>
              <button onClick={closeViewModal} className="self-end md:self-start p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 dark:bg-slate-950/40">
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-200">
                      <Tag size={12} /> {tag}
                    </span>
                  ))}
                </div>
              )}

              <article className="min-h-[360px] rounded-2xl border border-gray-200 bg-gray-50/70 p-6 text-base leading-8 text-gray-800 whitespace-pre-wrap dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                {selectedNote.content}
              </article>
            </div>

            <div className="p-5 border-t border-gray-100 flex flex-col gap-3 bg-gray-50/50 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => handleGenerateAI(selectedNote)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
              >
                <Sparkles size={16} />
                Generate AI Reviewer
              </button>
              <button
                type="button"
                onClick={() => openEditModal(selectedNote)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
              >
                <Pencil size={16} />
                Edit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Modal ── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Note' : 'Create Note'}
              </h2>
              <button onClick={closeFormModal} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form onSubmit={handleFormSubmit} id="noteForm">
                {formError && (
                  <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Note Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white"
                        placeholder="e.g. Chapter 4: Cell Biology"
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
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white"
                      >
                        {subjects.map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleFormChange}
                      rows="14"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white font-mono text-sm leading-relaxed resize-y"
                      placeholder="Write your study notes here..."
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Tags <span className="text-gray-400 font-normal text-xs ml-1">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white"
                      placeholder="e.g. midterm, definitions, important"
                    />
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
                form="noteForm"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-sm"
              >
                {isSubmitting ? 'Saving...' : 'Save Note'}
              </button>
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Note</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this note? It will be gone forever.
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

export default Notes;

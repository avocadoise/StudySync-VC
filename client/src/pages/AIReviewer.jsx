import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getNotes } from '../api/noteApi';
import { generateReviewer, getReviewers, deleteReviewer } from '../api/aiApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Sparkles, FileText, Trash2, AlertTriangle, BookOpen,
  Info, ChevronDown, ChevronRight, X, Layers, Lightbulb, PlayCircle,
  ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2, XCircle
} from 'lucide-react';

const QUESTIONS_PER_PAGE = 4;
const FLASHCARDS_PER_PAGE = 1;

const AIReviewer = () => {
  const location = useLocation();
  const preselectedNoteId = location.state?.noteId || '';

  // Data States
  const [notes, setNotes] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(preselectedNoteId);
  const [activeReviewer, setActiveReviewer] = useState(null);

  // App States
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // View States for the Result
  const [openSections, setOpenSections] = useState({
    summary: true,
    keyTerms: true,
  });
  const [questionPage, setQuestionPage] = useState(1);
  const [flashcardPage, setFlashcardPage] = useState(1);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [flippedFlashcards, setFlippedFlashcards] = useState({});
  const [selectedChoices, setSelectedChoices] = useState({});

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [notesRes, reviewersRes] = await Promise.all([
        getNotes(),
        getReviewers()
      ]);
      setNotes(notesRes.data || []);
      setReviewers(reviewersRes.data || []);

      // If we navigated here with a preselected note, let's see if a reviewer already exists for it
      if (preselectedNoteId) {
        const existing = (reviewersRes.data || []).find(r => r.noteId === preselectedNoteId || r.noteId?._id === preselectedNoteId);
        if (existing) {
          setActiveReviewer(existing);
        }
      } else if (reviewersRes.data && reviewersRes.data.length > 0) {
        // Auto select the first saved reviewer
        setActiveReviewer(reviewersRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load notes or reviewer history.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedNoteId) {
      setError('Please select a note first.');
      return;
    }

    const selectedNote = notes.find(n => n._id === selectedNoteId);
    if (!selectedNote || !selectedNote.content || selectedNote.content.trim() === '') {
      setError('Cannot generate a reviewer from an empty note. Please add content to your note first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const res = await generateReviewer({ noteId: selectedNoteId });
      const newReviewer = res.data;
      
      // Update history and set active
      setReviewers(prev => [newReviewer, ...prev]);
      setActiveReviewer(newReviewer);
      
      // Reset result views to the beginning.
      setOpenSections({ summary: true, keyTerms: true });
      setQuestionPage(1);
      setFlashcardPage(1);
      setRevealedAnswers({});
      setFlippedFlashcards({});
      setSelectedChoices({});
    } catch (err) {
      console.error('Generation failed:', err);
      // Show friendly message for insufficient AI errors
      const msg = err.response?.data?.message || 'Failed to generate AI Reviewer. The note content might be insufficient.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReviewer = async (id, e) => {
    e.stopPropagation(); // prevent accordion/row click
    if (!window.confirm('Are you sure you want to delete this specific AI Reviewer?')) return;

    try {
      await deleteReviewer(id);
      setReviewers(prev => prev.filter(r => r._id !== id));
      if (activeReviewer?._id === id) {
        setActiveReviewer(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete the saved reviewer.');
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleAnswer = (index) => {
    setRevealedAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleFlashcard = (index) => {
    setFlippedFlashcards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSelectReviewer = (reviewer) => {
    setActiveReviewer(reviewer);
    setQuestionPage(1);
    setFlashcardPage(1);
    setRevealedAnswers({});
    setFlippedFlashcards({});
    setSelectedChoices({});
  };

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getPageItems = (items = [], page, pageSize) => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  };

  const getPageCount = (items = [], pageSize) => Math.max(1, Math.ceil(items.length / pageSize));

  const selectChoice = (questionIndex, choice) => {
    setSelectedChoices((prev) => ({ ...prev, [questionIndex]: choice }));
  };

  const getQuestionChoices = (question) =>
    Array.isArray(question.choices)
      ? question.choices.map((choice) => String(choice || '').trim()).filter(Boolean)
      : [];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Sparkles size={28} className="text-indigo-600" />
            AI Reviewer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Transform your notes into study guides, flashcards, and quizzes.
          </p>
        </div>
      </div>

      {/* ── Warning Info Banner ── */}
      <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <Info className="mt-0.5 shrink-0 text-indigo-500" size={20} />
        <div>
          <h4 className="font-bold text-sm">How it works</h4>
          <p className="text-sm mt-0.5 opacity-90 leading-relaxed">
            The AI reviewer generates study resources <strong>strictly based on the notes you input</strong>. 
            It will not invent facts outside of your saved note context, ensuring your study material strictly follows your curriculum.
          </p>
        </div>
      </div>

      {/* ── Error Display ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-md">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Main Body Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Controls & History */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Generate Block */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-indigo-500" />
              Generate Study Guide
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Select a Note
                </label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  disabled={isGenerating || notes.length === 0}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white text-sm disabled:opacity-60"
                >
                  <option value="">-- Choose a Note --</option>
                  {notes.map(note => (
                    <option key={note._id} value={note._id}>
                      {note.title} {note.subjectId?.name ? `(${note.subjectId.name})` : ''}
                    </option>
                  ))}
                </select>
                {notes.length === 0 && (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    You have no notes. Please create a note first.
                  </p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedNoteId}
                className="w-full bg-indigo-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing your notes...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Reviewer
                  </>
                )}
              </button>
            </div>
          </div>

          {/* History Block */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Layers size={18} className="text-gray-500" />
              Saved Reviewers
            </h3>
            
            {reviewers.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <FileText size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No saved history.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {reviewers.map(rev => {
                  // The reviewer noteId might be populated, or we match it manually
                  let noteTitle = 'Unknown Note';
                  if (rev.noteId?.title) {
                    noteTitle = rev.noteId.title;
                  } else {
                    const matchedNote = notes.find(n => n._id === rev.noteId);
                    if (matchedNote) noteTitle = matchedNote.title;
                  }

                  const isActive = activeReviewer && activeReviewer._id === rev._id;

                  return (
                    <div
                      key={rev._id}
                      onClick={() => handleSelectReviewer(rev)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border ${
                        isActive 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                          : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-indigo-800' : 'text-gray-800'}`}>
                          {noteTitle}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(rev.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteReviewer(rev._id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shrink-0"
                        title="Delete History"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: The Active Result */}
        <div className="lg:col-span-2">
          {isGenerating ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-indigo-50/50 rounded-2xl border border-indigo-100/50 shadow-sm p-8 text-center max-w-2xl mx-auto lg:mx-0">
               <div className="relative">
                 {/* Decorative spinner ring */}
                 <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={24} />
               </div>
               <h3 className="mt-6 text-xl font-bold text-gray-800">Cranking the gears...</h3>
               <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                 The AI is currently analyzing your note content, identifying key concepts, generating questions, and drafting flashcards. This may take up to 20 seconds.
               </p>
            </div>
          ) : !activeReviewer ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-5 border border-gray-100">
                <Sparkles size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Reviewer Selected</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Generate a new study guide from your notes, or click on a previously saved item from your history to view it.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Note specific header */}
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 flex items-center gap-3 border-l-4 border-l-indigo-500">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                   <BookOpen size={20} />
                 </div>
                 <div>
                   <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Active Study Guide</p>
                   <h2 className="text-lg font-bold text-gray-900">
                     {activeReviewer.noteId?.title || notes.find(n => n._id === activeReviewer.noteId)?.title || 'Reviewer Results'}
                   </h2>
                 </div>
              </div>

              {/* Sections Accordion */}
              
              {/* 1. Summary */}
              {activeReviewer.summary && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left cursor-default">
                  <div
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer select-none border-b border-gray-100"
                    onClick={() => toggleSection('summary')}
                  >
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                       <FileText size={18} className="text-blue-500" />
                       Concept Summary
                    </h3>
                    {openSections.summary ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                  </div>
                  {openSections.summary && (
                    <div className="p-5 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {activeReviewer.summary}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Key Terms */}
              {activeReviewer.keyTerms && activeReviewer.keyTerms.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left cursor-default">
                  <div
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer select-none border-b border-gray-100"
                    onClick={() => toggleSection('keyTerms')}
                  >
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                       <Lightbulb size={18} className="text-yellow-500" />
                       Key Terms Dictionary
                    </h3>
                    {openSections.keyTerms ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                  </div>
                  {openSections.keyTerms && (
                    <div className="p-0">
                      <ul className="divide-y divide-gray-100">
                        {activeReviewer.keyTerms.map((item, idx) => (
                          <li key={idx} className="p-4 hover:bg-gray-50/50 transition-colors">
                            <span className="font-bold text-indigo-700 block mb-1">{item.term}</span>
                            <span className="text-gray-600 text-sm leading-relaxed">{item.definition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Practice Questions */}
              {activeReviewer.questions && activeReviewer.questions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left cursor-default">
                  <div className="flex flex-col gap-3 border-b border-gray-100 bg-rose-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-rose-950/30">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 dark:text-slate-100">
                         <PlayCircle size={18} className="text-rose-500" />
                         Practice Quiz
                      </h3>
                      <p className="mt-1 text-xs font-medium text-gray-500 dark:text-slate-400">
                        {activeReviewer.questions.length} questions. Showing up to {QUESTIONS_PER_PAGE} at a time to keep the quiz focused.
                      </p>
                    </div>
                    <PageControls
                      page={questionPage}
                      totalPages={getPageCount(activeReviewer.questions, QUESTIONS_PER_PAGE)}
                      onPrevious={() => setQuestionPage((page) => Math.max(1, page - 1))}
                      onNext={() => setQuestionPage((page) => Math.min(getPageCount(activeReviewer.questions, QUESTIONS_PER_PAGE), page + 1))}
                    />
                  </div>
                  <div className="p-5 grid grid-cols-1 gap-4">
                    {getPageItems(activeReviewer.questions, questionPage, QUESTIONS_PER_PAGE).map((q, idx) => {
                      const absoluteIndex = (questionPage - 1) * QUESTIONS_PER_PAGE + idx;
                      const isAnswerVisible = Boolean(revealedAnswers[absoluteIndex]);

                      return (
                        <div key={absoluteIndex} className="rounded-xl border border-rose-100 bg-rose-50/30 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                          <div className="flex items-start gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-extrabold text-rose-600 dark:bg-rose-500/20 dark:text-rose-200">
                              {absoluteIndex + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold leading-relaxed text-gray-900 dark:text-slate-50">
                                {q.question}
                              </p>
                              {getQuestionChoices(q).length > 0 ? (
                                <div className="mt-4 grid gap-2">
                                  {getQuestionChoices(q).map((choice, choiceIndex) => {
                                    const selectedChoice = selectedChoices[absoluteIndex];
                                    const hasSelected = Boolean(selectedChoice);
                                    const isSelected = selectedChoice === choice;
                                    const isCorrect = choice === q.answer;
                                    const showCorrect = hasSelected && isCorrect;
                                    const showWrong = hasSelected && isSelected && !isCorrect;

                                    return (
                                      <button
                                        key={`${absoluteIndex}-${choiceIndex}-${choice}`}
                                        type="button"
                                        onClick={() => selectChoice(absoluteIndex, choice)}
                                        className={`flex items-start gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition-colors ${
                                          showCorrect
                                            ? 'border-green-200 bg-green-50 text-green-800 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-100'
                                            : showWrong
                                              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-400/40 dark:bg-red-500/15 dark:text-red-100'
                                              : isSelected
                                                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-100'
                                                : 'border-gray-200 text-gray-700 hover:border-rose-200 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-rose-400/40 dark:hover:bg-rose-500/10'
                                        }`}
                                      >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-extrabold">
                                          {String.fromCharCode(65 + choiceIndex)}
                                        </span>
                                        <span className="flex-1 leading-relaxed">{choice}</span>
                                        {showCorrect && <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600 dark:text-emerald-300" />}
                                        {showWrong && <XCircle size={16} className="mt-0.5 shrink-0 text-red-600 dark:text-red-300" />}
                                      </button>
                                    );
                                  })}
                                  {selectedChoices[absoluteIndex] && (
                                    <div className="mt-2 rounded-lg border border-green-100 bg-green-50 p-3 text-gray-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-slate-100">
                                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-green-600 dark:text-emerald-300">Correct Answer</span>
                                      <p className="leading-relaxed">{q.answer}</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => toggleAnswer(absoluteIndex)}
                                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-400/30 dark:bg-slate-950 dark:text-rose-200 dark:hover:bg-rose-500/10"
                                  >
                                    {isAnswerVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {isAnswerVisible ? 'Hide answer' : 'Show answer'}
                                  </button>
                                  {isAnswerVisible && (
                                    <div className="mt-3 rounded-lg border border-green-100 bg-green-50 p-3 text-gray-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-slate-100">
                                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-green-600 dark:text-emerald-300">Answer</span>
                                      <p className="leading-relaxed">{q.answer}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Flashcards */}
              {activeReviewer.flashcards && activeReviewer.flashcards.length > 0 && (
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left cursor-default">
                  <div className="flex flex-col gap-3 border-b border-gray-100 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-emerald-950/30">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 dark:text-slate-100">
                         <Layers size={18} className="text-emerald-500" />
                         Flashcards
                      </h3>
                      <p className="mt-1 text-xs font-medium text-gray-500 dark:text-slate-400">
                        Study one card at a time. Click the card to flip between prompt and answer.
                      </p>
                    </div>
                    <PageControls
                      page={flashcardPage}
                      totalPages={getPageCount(activeReviewer.flashcards, FLASHCARDS_PER_PAGE)}
                      onPrevious={() => setFlashcardPage((page) => Math.max(1, page - 1))}
                      onNext={() => setFlashcardPage((page) => Math.min(getPageCount(activeReviewer.flashcards, FLASHCARDS_PER_PAGE), page + 1))}
                    />
                  </div>
                  <div className="p-5">
                    {getPageItems(activeReviewer.flashcards, flashcardPage, FLASHCARDS_PER_PAGE).map((fc, idx) => {
                      const absoluteIndex = (flashcardPage - 1) * FLASHCARDS_PER_PAGE + idx;
                      const isFlipped = Boolean(flippedFlashcards[absoluteIndex]);

                      return (
                        <button
                          type="button"
                          key={absoluteIndex}
                          className="group mx-auto block min-h-72 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-0 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950"
                          onClick={() => toggleFlashcard(absoluteIndex)}
                        >
                          <div className={`flex min-h-72 flex-col justify-between rounded-2xl p-6 transition-colors sm:p-8 ${
                            isFlipped
                              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-slate-50'
                              : 'bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-50'
                          }`}>
                            <div>
                              <span className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                isFlipped
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200'
                                  : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                Card {absoluteIndex + 1} / {activeReviewer.flashcards.length}
                              </span>
                              <p className="mt-8 text-center text-lg font-extrabold leading-relaxed sm:text-xl">
                                {isFlipped ? fc.back : fc.front}
                              </p>
                            </div>
                            <span className="mt-8 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-300">
                              {isFlipped ? 'Click to see front' : 'Click to reveal answer'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                 </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PageControls = ({ page, totalPages, onPrevious, onNext }) => (
  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-300">
    <button
      type="button"
      onClick={onPrevious}
      disabled={page <= 1}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label="Previous page"
    >
      <ArrowLeft size={14} />
    </button>
    <span className="min-w-16 text-center">
      {page} / {totalPages}
    </span>
    <button
      type="button"
      onClick={onNext}
      disabled={page >= totalPages}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label="Next page"
    >
      <ArrowRight size={14} />
    </button>
  </div>
);

export default AIReviewer;

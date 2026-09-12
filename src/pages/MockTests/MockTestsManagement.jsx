import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import QuestionEditorModal from '../../components/QuestionEditorModal';
import { 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  BarChart2, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  HelpCircle,
  Eye,
  FileCheck,
  Send,
  Tag,
  AlertCircle,
  FileText,
  CheckSquare,
  MoreVertical,
  Layers,
  FolderPlus,
  Check
} from 'lucide-react';

export default function MockTestsManagement() {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Filter Tab: 'all' | 'published' | 'draft' | 'archived'
  const [activeTab, setActiveTab] = useState('all');

  // Create / Edit Test Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isTimed, setIsTimed] = useState(true);
  const [timingMode, setTimingMode] = useState('overall'); // 'overall' | 'perQuestion'
  const [sameTimePerQuestion, setSameTimePerQuestion] = useState(true);
  const [defaultQuestionTime, setDefaultQuestionTime] = useState(60);
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState('published');
  const [testQuestions, setTestQuestions] = useState([]); // array of Question objects
  const [sections, setSections] = useState([]); // array of { name: string, description: string }
  const [activeSectionFilter, setActiveSectionFilter] = useState('all'); // 'all' or section name
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [sectionFormName, setSectionFormName] = useState('');
  const [sectionFormDesc, setSectionFormDesc] = useState('');
  const [openQuestionMenuIndex, setOpenQuestionMenuIndex] = useState(null); // original index of question with menu open

  // Question Editor Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  // Test Analytics Modal
  const [selectedTestAnalytics, setSelectedTestAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const [testsRes, catsRes] = await Promise.all([
        api.get('/tests?status=all'),
        api.get('/categories'),
      ]);
      if (testsRes.data.success) setTests(testsRes.data.tests || []);
      if (catsRes.data.success) {
        setCategories(catsRes.data.categories || []);
        if (catsRes.data.categories.length > 0 && !categoryId) {
          setCategoryId(catsRes.data.categories[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleOpenCreateTest = () => {
    setEditingTestId(null);
    setTitle('');
    setDescription('');
    setInstructions('• Read each question carefully before submitting.\n• Ensure an uninterrupted internet connection throughout this simulator session.\n• Test will auto-submit when the allocated time limit elapses.');
    setTagsInput('trending, mock series');
    setCategoryId(categories[0]?._id || '');
    setDifficulty('Medium');
    setIsTimed(true);
    setTimingMode('overall');
    setSameTimePerQuestion(true);
    setDefaultQuestionTime(60);
    setDuration(30);
    setStatus('published');
    setTestQuestions([]);
    setSections([]);
    setActiveSectionFilter('all');
    setOpenQuestionMenuIndex(null);
    setIsTestModalOpen(true);
  };

  const handleOpenEditTest = async (test) => {
    setEditingTestId(test._id);
    setTitle(test.title);
    setDescription(test.description || '');
    setInstructions(test.instructions || '');
    setTagsInput((test.tags || []).join(', '));
    setCategoryId(test.categoryId?._id || test.categoryId || categories[0]?._id);
    setDifficulty(test.difficulty || 'Medium');
    setIsTimed(test.timing?.enabled ?? true);
    setTimingMode(test.timing?.mode || 'overall');
    setSameTimePerQuestion(test.timing?.sameTimePerQuestion ?? true);
    setDefaultQuestionTime(test.timing?.defaultQuestionTime || 60);
    setDuration(test.timing?.duration || 30);
    setStatus(test.status || 'published');
    setSections(test.sections || []);
    setActiveSectionFilter('all');
    setOpenQuestionMenuIndex(null);

    // Fetch full test with populated questions
    try {
      const res = await api.get(`/tests/${test._id}`);
      if (res.data.success) {
        setTestQuestions(res.data.test.questions || []);
        if (res.data.test.sections) {
          setSections(res.data.test.sections || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch test questions:', err);
      setTestQuestions([]);
    }

    setIsTestModalOpen(true);
  };

  const handleDuplicate = async (testId) => {
    try {
      const res = await api.post(`/tests/${testId}/duplicate`);
      if (res.data.success) {
        fetchTests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Duplication failed');
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to permanently delete this mock test?')) return;
    try {
      const res = await api.delete(`/tests/${testId}`);
      if (res.data.success) {
        setTests(tests.filter(t => t._id !== testId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleViewAnalytics = async (testId) => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get(`/tests/${testId}/analytics`);
      if (res.data.success) {
        setSelectedTestAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load test analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Question authoring in current test
  const handleOpenAddQuestion = () => {
    setEditingQuestionIndex(null);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (questionData) => {
    if (editingQuestionIndex !== null) {
      const updated = [...testQuestions];
      updated[editingQuestionIndex] = questionData;
      setTestQuestions(updated);
    } else {
      const qWithSection = {
        ...questionData,
        section: questionData.section || (activeSectionFilter !== 'all' ? activeSectionFilter : ''),
      };
      setTestQuestions([...testQuestions, qWithSection]);
    }
  };

  const handleRemoveQuestion = (index) => {
    setTestQuestions(testQuestions.filter((_, i) => i !== index));
    if (openQuestionMenuIndex === index) setOpenQuestionMenuIndex(null);
  };

  // Section Management Handlers
  const handleOpenAddSection = () => {
    setEditingSectionIndex(null);
    setSectionFormName('');
    setSectionFormDesc('');
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (index) => {
    setEditingSectionIndex(index);
    setSectionFormName(sections[index]?.name || '');
    setSectionFormDesc(sections[index]?.description || '');
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = (e) => {
    e.preventDefault();
    const trimmedName = sectionFormName.trim();
    if (!trimmedName) {
      alert('Section name is required.');
      return;
    }
    if (editingSectionIndex !== null) {
      const oldName = sections[editingSectionIndex].name;
      const updated = [...sections];
      updated[editingSectionIndex] = {
        name: trimmedName,
        description: sectionFormDesc.trim(),
      };
      setSections(updated);
      if (oldName !== trimmedName) {
        setTestQuestions(prev => prev.map(q => q.section === oldName ? { ...q, section: trimmedName } : q));
        if (activeSectionFilter === oldName) setActiveSectionFilter(trimmedName);
      }
    } else {
      if (sections.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
        alert('A section with this name already exists.');
        return;
      }
      setSections([...sections, { name: trimmedName, description: sectionFormDesc.trim() }]);
      setActiveSectionFilter(trimmedName);
    }
    setIsSectionModalOpen(false);
  };

  const handleDeleteSection = (indexToDelete) => {
    const secToDelete = sections[indexToDelete];
    if (!window.confirm(`Are you sure you want to delete section "${secToDelete.name}"? Questions in this section will become unassigned.`)) {
      return;
    }
    setSections(sections.filter((_, i) => i !== indexToDelete));
    setTestQuestions(prev => prev.map(q => q.section === secToDelete.name ? { ...q, section: '' } : q));
    if (activeSectionFilter === secToDelete.name) {
      setActiveSectionFilter('all');
    }
  };

  const handleMoveQuestionToSection = (targetOriginalIdx, targetSectionName) => {
    const updated = [...testQuestions];
    updated[targetOriginalIdx] = {
      ...updated[targetOriginalIdx],
      section: targetSectionName,
    };
    setTestQuestions(updated);
    setOpenQuestionMenuIndex(null);
  };

  // Submit test creation / update with specific target status
  const handleSaveTest = async (targetStatus = status) => {
    if (!title.trim()) {
      alert('Test title is required.');
      return;
    }
    if (testQuestions.length === 0) {
      alert('Please add at least 1 question to this mock test.');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title,
      description,
      instructions,
      tags: parsedTags,
      sections: sections.map(s => ({ name: s.name, description: s.description || '' })),
      categoryId,
      difficulty,
      timing: {
        enabled: isTimed,
        mode: isTimed ? timingMode : 'none',
        duration: isTimed ? Number(duration) : 0,
        sameTimePerQuestion: timingMode === 'perQuestion' ? sameTimePerQuestion : true,
        defaultQuestionTime: Number(defaultQuestionTime),
      },
      status: targetStatus,
      questions: testQuestions,
    };

    try {
      if (editingTestId) {
        const res = await api.put(`/tests/${editingTestId}`, payload);
        if (res.data.success) {
          fetchTests();
          setIsTestModalOpen(false);
        }
      } else {
        const res = await api.post('/tests', payload);
        if (res.data.success) {
          fetchTests();
          setIsTestModalOpen(false);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  // Filter tests by active tab
  const filteredTests = tests.filter(t => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  const publishedCount = tests.filter(t => t.status === 'published').length;
  const draftCount = tests.filter(t => t.status === 'draft').length;
  const archivedCount = tests.filter(t => t.status === 'archived').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mock Test Curricula & Exam Authoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Author comprehensive timed mock tests, manage tags, configure per-question clocks, and monitor student attempts.
          </p>
        </div>

        <button
          onClick={handleOpenCreateTest}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Mock Test</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>All Tests</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-700/50 text-indigo-100">
            {tests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'published'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Published</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-700/50 text-emerald-100">
            {publishedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('draft')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'draft'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Drafts</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-700/50 text-amber-100">
            {draftCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'archived'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Archived</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {archivedCount}
          </span>
        </button>
      </div>

      {/* Tests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading tests from database...</div>
        ) : filteredTests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No mock tests in '{activeTab}' category. Click "Create New Mock Test" above to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Test Title & Tags</th>
                  <th className="p-3.5">Stream Category</th>
                  <th className="p-3.5">Timing Policy</th>
                  <th className="p-3.5">Questions</th>
                  <th className="p-3.5">Difficulty</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Attempts</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTests.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{t.title}</span>
                      </div>
                      <span className="block text-[11px] font-normal text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                        {t.description || 'No description provided'}
                      </span>
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {t.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">{t.categoryId?.name || 'General'}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {t.timing?.enabled ? (
                        <div>
                          <span className="font-bold">
                            {t.timing.mode === 'perQuestion' ? 'Per Question' : `${t.timing.duration} mins`}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {t.timing.mode === 'perQuestion' 
                              ? (t.timing.sameTimePerQuestion ? `${t.timing.defaultQuestionTime || 60}s uniform` : 'Variable per Q')
                              : 'Overall duration'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Untimed</span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                      {t.questionCount || t.questions?.length || 0}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        t.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' :
                        t.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' :
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                      }`}>
                        {t.difficulty}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        t.status === 'published' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 
                        t.status === 'draft' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 font-semibold">
                      {t.attemptCount || 0}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewAnalytics(t._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View Test Analytics"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(t._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Duplicate Test"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditTest(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Test & Questions"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(t._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                          title="Delete Test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Create / Edit Test Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={editingTestId ? 'Edit Mock Test Specifications & Questions' : 'Create New Mock Test'}
        subtitle="Configure title, stream category, timing rules, instructions, and author questions"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Basic metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Test Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NEET Medical Full Syllabus Grand Mock 2026"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exam Stream Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of test coverage..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. trending, more complex, high yield"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tags appear as badges on the test card in the student portal.
              </p>
            </div>
          </div>

          {/* Instructions for Students */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Examination Instructions & Rules (Displayed to student before starting)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. • Fullscreen exam environment.\n• +4 marks for correct answer, -1 for wrong answer.\n• Do not switch tabs."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Timing & Difficulty Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Examination Timing Controls
                </span>
                <span className="text-[11px] text-slate-500">
                  Configure whether exam is timed overall, per-question with uniform or customized time limits, or untimed.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsTimed(!isTimed)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isTimed
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isTimed ? 'Timed Simulator' : 'No Time Limit'}
              </button>
            </div>

            {isTimed && (
              <div className="space-y-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Timing Mode
                    </label>
                    <select
                      value={timingMode}
                      onChange={(e) => setTimingMode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="overall">Overall Test Duration</option>
                      <option value="perQuestion">Per-Question Timing</option>
                    </select>
                  </div>

                  {timingMode === 'overall' ? (
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Default Time per Q (Sec)
                      </label>
                      <input
                        type="number"
                        min={10}
                        value={defaultQuestionTime}
                        onChange={(e) => setDefaultQuestionTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Per-Question Custom Timing Checkbox */}
                {timingMode === 'perQuestion' && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 dark:text-amber-300">
                      <input
                        type="checkbox"
                        checked={sameTimePerQuestion}
                        onChange={(e) => setSameTimePerQuestion(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Same time for every question ({defaultQuestionTime}s each)</span>
                    </label>
                    <span className="text-slate-400">|</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {sameTimePerQuestion 
                        ? 'All questions share the exact same countdown duration.'
                        : 'Unchecked: You can alter/customize individual countdown time for each question in the question editor.'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sections & Question Management in this Test */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Sections & Question Authoring ({testQuestions.length} Questions)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Organize questions into sections with custom descriptions and instructions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddSection}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Add Section</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddQuestion}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Sections Pills / Tab Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveSectionFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeSectionFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>All Questions</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeSectionFilter === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {testQuestions.length}
                </span>
              </button>

              {sections.map((sec, sIdx) => {
                const qCount = testQuestions.filter(q => q.section === sec.name).length;
                const isActive = activeSectionFilter === sec.name;
                return (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setActiveSectionFilter(sec.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <span>{sec.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {qCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Section Description & Controls Banner */}
            {activeSectionFilter !== 'all' && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-indigo-900 dark:text-indigo-200">
                      {activeSectionFilter}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-200/60 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      {testQuestions.filter(q => q.section === activeSectionFilter).length} questions
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    {sections.find(s => s.name === activeSectionFilter)?.description || 'No section description provided.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = sections.findIndex(s => s.name === activeSectionFilter);
                      if (idx !== -1) handleOpenEditSection(idx);
                    }}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 hover:text-indigo-600 shadow-2xs transition"
                    title="Edit Section Name / Description"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = sections.findIndex(s => s.name === activeSectionFilter);
                      if (idx !== -1) handleDeleteSection(idx);
                    }}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 hover:text-rose-600 shadow-2xs transition"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {(() => {
              const displayedQuestions = testQuestions
                .map((q, originalIdx) => ({ q, originalIdx }))
                .filter(({ q }) => activeSectionFilter === 'all' || (q.section || '') === activeSectionFilter);

              if (displayedQuestions.length === 0) {
                return (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                    {activeSectionFilter === 'all'
                      ? 'No questions added to this test yet. Click "Add Question" above to author questions.'
                      : `No questions assigned to "${activeSectionFilter}" yet. Click "Add Question" or move existing questions here using the question action menu.`}
                  </div>
                );
              }

              return (
                <div className="space-y-2 max-h-72 overflow-y-auto p-1">
                  {displayedQuestions.map(({ q, originalIdx }) => (
                    <div
                      key={q._id || originalIdx}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                          {originalIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {q.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {q.section && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                <span>{q.section}</span>
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {q.subject || 'General'} • {q.topic || 'Item'} • (+{q.marks || 4} / -{q.negativeMarks || 1})
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                              {q.questionType === 'multiple' ? 'Multi-Answer' : q.questionType === 'blank' ? 'Blank' : 'Single MCQ'}
                            </span>
                            {q.codeSnippet && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Code
                              </span>
                            )}
                            {q.passageSnippet && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600">
                                Passage
                              </span>
                            )}
                            {timingMode === 'perQuestion' && !sameTimePerQuestion && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600">
                                {q.timeLimitSeconds || defaultQuestionTime}s
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 relative">
                        <button
                          type="button"
                          onClick={() => handleOpenEditQuestion(originalIdx)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 transition"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(originalIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Remove Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Question Menu Button with Move to Section */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenQuestionMenuIndex(openQuestionMenuIndex === originalIdx ? null : originalIdx)}
                            className={`p-1.5 rounded-lg transition ${
                              openQuestionMenuIndex === originalIdx
                                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Question Menu / Move to Section"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Action Dropdown Menu */}
                          {openQuestionMenuIndex === originalIdx && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenQuestionMenuIndex(null)}
                              />
                              <div className="absolute right-0 top-8 z-50 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 text-xs animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <span>Move to Section</span>
                                  <Layers className="w-3 h-3 text-indigo-500" />
                                </div>

                                <div className="py-1 space-y-0.5 max-h-40 overflow-y-auto">
                                  {/* Unassigned Option */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveQuestionToSection(originalIdx, '')}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                                      !q.section
                                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    <span className="truncate">Default / General</span>
                                    {!q.section && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                  </button>

                                  {sections.length === 0 ? (
                                    <div className="px-2.5 py-1.5 text-[11px] text-slate-400 italic">
                                      No sections created yet. Click "+ Add Section" to create one.
                                    </div>
                                  ) : (
                                    sections.map((sec, sIdx) => {
                                      const isCurrent = q.section === sec.name;
                                      return (
                                        <button
                                          key={sIdx}
                                          type="button"
                                          onClick={() => handleMoveQuestionToSection(originalIdx, sec.name)}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                                            isCurrent
                                              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold'
                                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                          }`}
                                        >
                                          <span className="truncate">{sec.name}</span>
                                          {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>

                                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenQuestionMenuIndex(null);
                                      handleOpenEditQuestion(originalIdx);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit Question</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenQuestionMenuIndex(null);
                                      handleRemoveQuestion(originalIdx);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove Question</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Action Buttons: Save as Draft vs Publish */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsTestModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveTest('draft')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveTest('published')}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
              >
                {editingTestId ? 'Save & Publish Test' : 'Publish Mock Test'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Question Authoring Modal */}
      {isQuestionModalOpen && (
        <QuestionEditorModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          onSave={handleSaveQuestion}
          initialData={editingQuestionIndex !== null ? testQuestions[editingQuestionIndex] : null}
          categories={categories}
          defaultCategoryId={categoryId}
          sections={sections}
          defaultSection={activeSectionFilter !== 'all' ? activeSectionFilter : ''}
          showQuestionTimer={timingMode === 'perQuestion' && !sameTimePerQuestion}
        />
      )}

      {/* Section Authoring / Edit Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={editingSectionIndex !== null ? 'Edit Test Section' : 'Create New Test Section'}
        subtitle="Configure section title and candidate instructions or syllabus scope"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Section Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sectionFormName}
              onChange={(e) => setSectionFormName(e.target.value)}
              placeholder="e.g. Section A: Quantitative Aptitude"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Section Description / Instructions
            </label>
            <textarea
              rows={3}
              value={sectionFormDesc}
              onChange={(e) => setSectionFormDesc(e.target.value)}
              placeholder="e.g. Contains 20 questions covering mechanics. +4 marks for correct, -1 for incorrect."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsSectionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
            >
              {editingSectionIndex !== null ? 'Update Section' : 'Save Section'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Test Analytics Modal */}
      {selectedTestAnalytics && (
        <Modal
          isOpen={!!selectedTestAnalytics}
          onClose={() => setSelectedTestAnalytics(null)}
          title={`Analytics: ${selectedTestAnalytics.title}`}
          subtitle="Detailed attempt engagement metrics and question miss rate diagnostics"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Attempts</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedTestAnalytics.totalAttempts}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Mean Score</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {selectedTestAnalytics.averageScore}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Pass Rate</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedTestAnalytics.passRate}%
                </span>
              </div>
            </div>

            {/* Most Missed Questions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Top Concept Bottlenecks (Most Missed Questions)</span>
              </h4>

              {selectedTestAnalytics.mostMissedQuestions?.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No questions missed yet across test attempts.</p>
              ) : (
                <div className="space-y-2">
                  {selectedTestAnalytics.mostMissedQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{q.text}</p>
                        <span className="text-[10px] text-slate-400">{q.subject} • {q.topic}</span>
                      </div>
                      <span className="font-bold text-rose-500 text-xs shrink-0">
                        Missed {q.missedCount} / {q.totalAttempts} times
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

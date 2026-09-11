import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import QuestionEditorModal from '../../components/QuestionEditorModal';
import { 
  Dumbbell, 
  Plus, 
  Search, 
  CheckCircle2, 
  Filter, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function PracticeManagement() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (categoryFilter !== 'all') query.append('categoryId', categoryFilter);
      if (difficultyFilter !== 'all') query.append('difficulty', difficultyFilter);

      const [qRes, cRes] = await Promise.all([
        api.get(`/practice/questions?${query.toString()}&limit=100`),
        api.get('/categories'),
      ]);

      if (qRes.data.success) setQuestions(qRes.data.questions);
      if (cRes.data.success) setCategories(cRes.data.categories);
    } catch (err) {
      console.error('Failed to load practice questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter, difficultyFilter]);

  const handleSaveQuestion = async (qData) => {
    try {
      const res = await api.post('/practice/questions', {
        ...qData,
        practiceMode: 'both',
      });
      if (res.data.success) {
        fetchQuestions();
        setIsModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Practice Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Author and categorize untimed practice drills by examination stream, subject module, and concept topic.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Author Practice Question</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
        >
          <option value="all">All Exam Streams</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading practice questions...</div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No practice questions found for this selection.</div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q._id || idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {q.subject}
                    </span>
                    <span className="text-slate-500">• {q.topic}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    q.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600' :
                    q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {q.text}
                </p>

                {q.codeSnippet && (
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto">
                    {q.codeSnippet}
                  </pre>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options?.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border ${
                        optIdx === q.correctOptionIndex
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-mono font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <strong>Solution:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Authoring Modal */}
      {isModalOpen && (
        <QuestionEditorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveQuestion}
          categories={categories}
        />
      )}
    </div>
  );
}

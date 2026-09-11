import React, { useState } from 'react';
import Modal from './Modal';
import { Plus, Trash2, CheckCircle2, Sparkles, Code, FileText, CheckSquare, Clock } from 'lucide-react';

export default function QuestionEditorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  categories = [],
  defaultCategoryId = '',
  showQuestionTimer = false
}) {
  const [text, setText] = useState(initialData?.text || '');
  
  // Question Type: 'single' | 'multiple' | 'blank'
  const [questionType, setQuestionType] = useState(initialData?.questionType || 'single');

  // Snippets checkboxes
  const [hasCodeSnippet, setHasCodeSnippet] = useState(Boolean(initialData?.codeSnippet));
  const [codeSnippet, setCodeSnippet] = useState(initialData?.codeSnippet || '');
  
  const [hasPassageSnippet, setHasPassageSnippet] = useState(Boolean(initialData?.passageSnippet));
  const [passageSnippet, setPassageSnippet] = useState(initialData?.passageSnippet || '');

  const [subject, setSubject] = useState(initialData?.subject || '');
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'Medium');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || defaultCategoryId || categories[0]?._id || '');
  
  // Single MCQ Options & Correct Index
  const [options, setOptions] = useState(initialData?.options?.length ? initialData.options : ['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(initialData?.correctOptionIndex ?? 0);
  
  // Multi-answer indices
  const [correctOptionIndices, setCorrectOptionIndices] = useState(
    initialData?.correctOptionIndices?.length 
      ? initialData.correctOptionIndices 
      : [initialData?.correctOptionIndex ?? 0]
  );

  // Blank / Numerical answer
  const [blankAnswer, setBlankAnswer] = useState(initialData?.blankAnswer || '');

  // Marks & Time
  const [marks, setMarks] = useState(initialData?.marks || 4);
  const [negativeMarks, setNegativeMarks] = useState(initialData?.negativeMarks || 1);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(initialData?.timeLimitSeconds || 60);
  const [explanation, setExplanation] = useState(initialData?.explanation || '');

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (idx) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== idx);
      setOptions(updated);
      if (correctOptionIndex >= updated.length) {
        setCorrectOptionIndex(0);
      }
      setCorrectOptionIndices(prev => prev.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));
    }
  };

  const handleToggleMultiIndex = (idx) => {
    setCorrectOptionIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx].sort((a, b) => a - b)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Question statement is required.');
      return;
    }

    if (questionType === 'blank') {
      if (!blankAnswer.trim()) {
        alert('Please enter the expected blank or numerical answer.');
        return;
      }
    } else {
      if (options.some(opt => !opt.trim())) {
        alert('All option fields must have text.');
        return;
      }
      if (questionType === 'multiple' && correctOptionIndices.length === 0) {
        alert('Please select at least 1 correct option for multi-answer question.');
        return;
      }
    }

    onSave({
      _id: initialData?._id,
      text,
      questionType,
      codeSnippet: hasCodeSnippet ? codeSnippet : '',
      passageSnippet: hasPassageSnippet ? passageSnippet : '',
      subject: subject || 'General',
      topic: topic || 'Mock Problem',
      difficulty,
      categoryId,
      options: questionType === 'blank' ? [] : options,
      correctOptionIndex: questionType === 'multiple' ? (correctOptionIndices[0] ?? 0) : Number(correctOptionIndex),
      correctOptionIndices: questionType === 'multiple' ? correctOptionIndices : [Number(correctOptionIndex)],
      blankAnswer: questionType === 'blank' ? blankAnswer.trim() : '',
      marks: Number(marks),
      negativeMarks: Number(negativeMarks),
      timeLimitSeconds: Number(timeLimitSeconds),
      explanation,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Question Item' : 'Author Question Item'}
      subtitle="Configure problem statement, question format, optional snippets, and scoring rules"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Question Type Selection Bar */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            Question Format / Answer Type:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition text-xs font-semibold ${
              questionType === 'single'
                ? 'border-indigo-600 bg-white dark:bg-slate-800 text-indigo-900 dark:text-white shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="radio"
                name="qType"
                value="single"
                checked={questionType === 'single'}
                onChange={() => setQuestionType('single')}
                className="w-4 h-4 text-indigo-600"
              />
              <div>
                <span className="block font-bold">Single MCQ</span>
                <span className="text-[10px] text-slate-500 font-normal">1 correct option</span>
              </div>
            </label>

            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition text-xs font-semibold ${
              questionType === 'multiple'
                ? 'border-indigo-600 bg-white dark:bg-slate-800 text-indigo-900 dark:text-white shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="radio"
                name="qType"
                value="multiple"
                checked={questionType === 'multiple'}
                onChange={() => setQuestionType('multiple')}
                className="w-4 h-4 text-indigo-600"
              />
              <div>
                <span className="block font-bold">Multi-Answer</span>
                <span className="text-[10px] text-slate-500 font-normal">Multiple correct options</span>
              </div>
            </label>

            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition text-xs font-semibold ${
              questionType === 'blank'
                ? 'border-indigo-600 bg-white dark:bg-slate-800 text-indigo-900 dark:text-white shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="radio"
                name="qType"
                value="blank"
                checked={questionType === 'blank'}
                onChange={() => setQuestionType('blank')}
                className="w-4 h-4 text-indigo-600"
              />
              <div>
                <span className="block font-bold">Fill in Blank</span>
                <span className="text-[10px] text-slate-500 font-normal">Numerical / Exact text</span>
              </div>
            </label>
          </div>
        </div>

        {/* 2. Snippet Checkboxes */}
        <div className="flex items-center gap-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={hasCodeSnippet}
              onChange={(e) => setHasCodeSnippet(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-500" />
              Add Code Snippet
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={hasPassageSnippet}
              onChange={(e) => setHasPassageSnippet(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Add Passage / Paragraph Snippet
            </span>
          </label>
        </div>

        {/* Conditional Passage Snippet */}
        {hasPassageSnippet && (
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
            <label className="block text-[11px] font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Passage / Reading Context / Case Study
            </label>
            <textarea
              rows={3}
              value={passageSnippet}
              onChange={(e) => setPassageSnippet(e.target.value)}
              placeholder="Paste reading passage, comprehension text, or clinical case description..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-200"
            />
          </div>
        )}

        {/* Classification row (Auto-inherits stream category) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Stream Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Algorithms / Physiology"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Dynamic Programming"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Question Statement */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Question Statement</label>
          <textarea
            required
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type the question problem statement..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Conditional Code Snippet */}
        {hasCodeSnippet && (
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-500" />
              Code Snippet / Technical Syntax
            </label>
            <textarea
              rows={3}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste C++, Python, SQL, or pseudocode snippet..."
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 text-slate-100 border border-slate-800"
            />
          </div>
        )}

        {/* Format Specific Form (MCQ Options vs Fill in the blank) */}
        {questionType === 'blank' ? (
          <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-slate-800/40 border border-indigo-100 dark:border-slate-700 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Expected Answer (Numerical or Exact Term):
            </label>
            <input
              type="text"
              required
              value={blankAnswer}
              onChange={(e) => setBlankAnswer(e.target.value)}
              placeholder="e.g. 42 or 3.14 or Mitochondria"
              className="w-full max-w-md px-3.5 py-2 text-xs font-mono rounded-xl border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-[10px] text-slate-400">
              Answers will be evaluated in a case-insensitive, whitespace-trimmed manner during grading.
            </p>
          </div>
        ) : (
          /* MCQ Options (Single or Multi-Answer) */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase text-slate-500">
                {questionType === 'multiple' 
                  ? 'Options (Check each correct option for multi-answer)' 
                  : 'Options (Pick radio button for single correct answer)'}
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => {
                const isCheckedMulti = correctOptionIndices.includes(idx);
                const isCheckedSingle = Number(correctOptionIndex) === idx;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    {questionType === 'multiple' ? (
                      <input
                        type="checkbox"
                        checked={isCheckedMulti}
                        onChange={() => handleToggleMultiIndex(idx)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="Mark as one of correct answers"
                      />
                    ) : (
                      <input
                        type="radio"
                        name="correctOption"
                        checked={isCheckedSingle}
                        onChange={() => setCorrectOptionIndex(idx)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="Mark as correct answer"
                      />
                    )}
                    <span className="w-6 font-mono font-bold text-xs text-slate-400">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} statement`}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl border ${
                        (questionType === 'multiple' ? isCheckedMulti : isCheckedSingle)
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                      } text-slate-800 dark:text-slate-200`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scoring & Timing */}
        <div className={`grid ${showQuestionTimer ? 'grid-cols-4' : 'grid-cols-3'} gap-3`}>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Correct Marks (+)</label>
            <input
              type="number"
              min={1}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Negative Marks (-)</label>
            <input
              type="number"
              min={0}
              step={0.25}
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-rose-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {showQuestionTimer && (
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                Time (Sec)
              </label>
              <input
                type="number"
                min={10}
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-amber-600"
              />
            </div>
          )}
        </div>

        {/* Detailed Explanation */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            Solution & Concept Explanation
          </label>
          <textarea
            rows={3}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain why the answer is correct, equations, or common misconceptions..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            {initialData ? 'Save Changes' : 'Save Question to Test'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

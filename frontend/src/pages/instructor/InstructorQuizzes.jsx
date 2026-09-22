import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  HelpCircle,
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const InstructorQuizzes = () => {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Create Quiz Modal
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    courseId: '',
    title: '',
    description: '',
    durationMinutes: 15,
    passingScore: 60
  });

  // Add Question Modal
  const [activeQuizForQuestion, setActiveQuizForQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    marks: 1
  });

  const fetchQuizzesAndCourses = async () => {
    setLoading(true);
    try {
      const courseRes = await api.get('/courses/instructor/my-courses');
      const cList = courseRes.data || [];
      setCourses(cList);

      const allQuizzes = [];
      for (const c of cList) {
        const qRes = await api.get(`/quizzes/course/${c._id}`);
        if (qRes.data) {
          allQuizzes.push(...qRes.data);
        }
      }
      setQuizzes(allQuizzes);
    } catch (err) {
      toast.error(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesAndCourses();
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!newQuiz.courseId || !newQuiz.title.trim()) {
      toast.error('Course and quiz title are required.');
      return;
    }

    try {
      const res = await api.post('/quizzes', newQuiz);
      toast.success('Quiz created! Now add MCQ questions.');
      setQuizzes((prev) => [...prev, res.data.quiz]);
      setCreateQuizOpen(false);
      setNewQuiz({
        courseId: '',
        title: '',
        description: '',
        durationMinutes: 15,
        passingScore: 60
      });
    } catch (err) {
      toast.error(err.message || 'Failed to create quiz');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (newQuestion.options.some((opt) => !opt.trim())) {
      toast.error('All 4 MCQ options must have text.');
      return;
    }

    try {
      await api.post(`/quizzes/${activeQuizForQuestion._id}/questions`, newQuestion);
      toast.success('Question added successfully!');
      setActiveQuizForQuestion(null);
      setNewQuestion({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
        marks: 1
      });
      fetchQuizzesAndCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to add question');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      toast.success('Quiz deleted successfully');
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading quiz management dashboard..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="indigo">Assessments Manager</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Quiz & MCQ Authoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create automated MCQ assessments, configure questions and answer keys, and set passing benchmarks.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateQuizOpen(true)}
          icon={Plus}
        >
          Create New Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes authored yet"
          description="Build timed assessments with automatic grading for your courses."
          actionLabel="Create Quiz"
          onAction={() => setCreateQuizOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz._id} className="flex flex-col justify-between">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="indigo" size="sm">
                    {quiz.durationMinutes || 15} Mins
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">
                    Pass: {quiz.passingScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{quiz.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">
                    {quiz.totalMarks || 0} Total Marks
                  </span>
                  <button
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    aria-label="Delete quiz"
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveQuizForQuestion(quiz)}
                    icon={Plus}
                  >
                    Add Question
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      {createQuizOpen && (
        <Modal
          isOpen={createQuizOpen}
          onClose={() => setCreateQuizOpen(false)}
          title="Create New Quiz"
        >
          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Course *
              </label>
              <select
                required
                value={newQuiz.courseId}
                onChange={(e) => setNewQuiz({ ...newQuiz, courseId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="">Select a Course...</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                required
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                placeholder="e.g. Reconciliation Engine & Hooks Assessment"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  value={newQuiz.durationMinutes}
                  onChange={(e) =>
                    setNewQuiz({ ...newQuiz, durationMinutes: parseInt(e.target.value, 10) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={newQuiz.passingScore}
                  onChange={(e) =>
                    setNewQuiz({ ...newQuiz, passingScore: parseInt(e.target.value, 10) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCreateQuizOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create Quiz
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Question Modal */}
      {activeQuizForQuestion && (
        <Modal
          isOpen={!!activeQuizForQuestion}
          onClose={() => setActiveQuizForQuestion(null)}
          title={`Add MCQ Question: ${activeQuizForQuestion.title}`}
        >
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question Text *
              </label>
              <textarea
                required
                rows={3}
                value={newQuestion.questionText}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, questionText: e.target.value })
                }
                placeholder="What is the time complexity of reconciliation?"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-sans"
              />
            </div>

            {/* 4 Options */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Options (Select the correct radio choice) *
              </label>
              {newQuestion.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newQuestion.correctAnswerIndex === optIdx}
                    onChange={() =>
                      setNewQuestion({ ...newQuestion, correctAnswerIndex: optIdx })
                    }
                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newQuestion.options];
                      updated[optIdx] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: updated });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Explanation (Shown to students post-evaluation)
              </label>
              <textarea
                rows={2}
                value={newQuestion.explanation}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, explanation: e.target.value })
                }
                placeholder="Explain why the chosen option is correct..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-sans"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveQuizForQuestion(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add Question
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InstructorQuizzes;

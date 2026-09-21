import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const QuizRunner = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Result state after submission
  const [result, setResult] = useState(null);
  const [detailedAttempt, setDetailedAttempt] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/quizzes/${quizId}`);
        if (res.data?.quiz) {
          setQuiz(res.data.quiz);
          setQuestions(res.data.questions || []);
          setTimeLeft((res.data.quiz.durationMinutes || 15) * 60);

          // If there was a previous attempt, load it for review
          if (res.data.previousAttempt) {
            try {
              const attemptRes = await api.get(
                `/quizzes/attempt/${res.data.previousAttempt._id}/result`
              );
              setDetailedAttempt(attemptRes.data?.attempt);
              setResult({
                score: res.data.previousAttempt.score,
                totalMarks: res.data.previousAttempt.totalMarks,
                percentage: res.data.previousAttempt.percentage,
                passed: res.data.previousAttempt.passed
              });
            } catch (e) {
              // Ignore
            }
          }
        }
      } catch (err) {
        toast.error(err.message || 'Error loading quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!result && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz(); // Auto-submit when time expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, result]);

  const handleSelectOption = (questionId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    setConfirmModalOpen(false);
    setIsSubmitting(true);
    try {
      const payloadAnswers = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
        questionId: qId,
        selectedOptionIndex: optIdx
      }));

      const res = await api.post(`/quizzes/${quizId}/attempt`, {
        answers: payloadAnswers
      });

      setResult(res.data);
      toast.success('Quiz evaluated successfully!');

      // Fetch detailed result with explanation breakdown
      if (res.data?.attemptId) {
        const attemptRes = await api.get(`/quizzes/attempt/${res.data.attemptId}/result`);
        setDetailedAttempt(attemptRes.data?.attempt);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setDetailedAttempt(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft((quiz.durationMinutes || 15) * 60);
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Preparing quiz examination..." />;
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No Questions Found</h2>
        <p className="text-xs text-slate-500">
          This quiz has not yet been populated with questions by the instructor.
        </p>
        <Link to="/student/quizzes">
          <Button variant="primary">Return to Quizzes</Button>
        </Link>
      </div>
    );
  }

  // Format timer
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  // Render Post-Quiz Scorecard
  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        {/* Score Card Header */}
        <div
          className={`p-8 rounded-3xl border text-center space-y-4 shadow-xl ${
            result.passed
              ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-emerald-200'
              : 'bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-amber-200'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              result.passed
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <div>
            <Badge variant={result.passed ? 'emerald' : 'amber'} size="md">
              {result.passed ? 'Assessment Passed' : 'Did Not Pass'}
            </Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">{quiz.title}</h1>
            <p className="text-xs text-slate-500">Passing Benchmark: {quiz.passingScore}%</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto pt-4 border-t border-slate-200/60">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{result.percentage}%</div>
              <div className="text-[11px] text-slate-500 font-medium">Final Percentage</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {result.score} / {result.totalMarks}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Points Earned</div>
            </div>
            <div>
              <div
                className={`text-2xl font-extrabold ${
                  result.passed ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {result.passed ? 'PASS' : 'FAIL'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Final Status</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button variant="outline" size="sm" onClick={handleRetake} icon={RotateCcw}>
              Retake Quiz
            </Button>
            <Link to="/student/results">
              <Button variant="primary" size="sm">
                View Full Gradebook
              </Button>
            </Link>
          </div>
        </div>

        {/* Detailed Question Review Breakdown */}
        {detailedAttempt?.questions && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Question Evaluation Breakdown</h3>
            <div className="space-y-4">
              {detailedAttempt.questions.map((q, idx) => {
                const isCorrect = q.isCorrect;
                return (
                  <Card
                    key={q._id}
                    className={`border-l-4 ${
                      isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
                    }`}
                  >
                    <CardBody className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{q.questionText}</h4>
                        </div>
                        <Badge variant={isCorrect ? 'emerald' : 'rose'}>
                          {isCorrect ? `+${q.marks} pts` : '0 pts'}
                        </Badge>
                      </div>

                      {/* Options Review */}
                      <div className="space-y-2 pl-9">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = q.selectedOptionIndex === optIdx;
                          const isActualCorrect = q.correctAnswerIndex === optIdx;

                          let optionStyle = 'border-slate-200 bg-white text-slate-700';
                          if (isActualCorrect) {
                            optionStyle = 'border-emerald-300 bg-emerald-50/80 text-emerald-900 font-semibold';
                          } else if (isSelected && !isActualCorrect) {
                            optionStyle = 'border-rose-300 bg-rose-50/80 text-rose-900 font-semibold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <span className="text-[10px] uppercase font-bold opacity-75">
                                    Your Choice
                                  </span>
                                )}
                                {isActualCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                )}
                                {isSelected && !isActualCorrect && (
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="ml-9 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                          <span className="font-bold text-slate-800">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Banner: Quiz Info, Stepper, Timer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Assessment
          </span>
          <h2 className="text-base font-bold text-slate-900">{quiz.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              timeLeft < 180
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setConfirmModalOpen(true)}
            isLoading={isSubmitting}
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Question Stepper Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[q._id] !== undefined;
          const isCurrent = idx === currentQuestionIndex;

          return (
            <button
              key={q._id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isCurrent
                  ? 'bg-brand-600 text-white ring-2 ring-brand-400/40 shadow-sm'
                  : isAnswered
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Card */}
      <Card className="shadow-elevated">
        <CardBody className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <Badge variant="indigo">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <span className="text-xs font-semibold text-slate-500">
              Worth {currentQuestion.marks || 1} mark(s)
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {currentQuestion.questionText}
          </h3>

          {/* 4 MCQ Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQuestion._id] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion._id, optIdx)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-900 font-semibold ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span>{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Next & Previous Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              icon={ArrowLeft}
            >
              Previous
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                icon={ArrowRight}
                iconPosition="right"
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setConfirmModalOpen(true)}
              >
                Review & Submit ({answeredCount}/{questions.length})
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Submit Quiz Assessment"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            You have answered <span className="font-bold text-slate-900">{answeredCount}</span> of{' '}
            <span className="font-bold text-slate-900">{questions.length}</span> questions.
          </p>
          {answeredCount < questions.length && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                You have {questions.length - answeredCount} unanswered question(s). Are you sure you want to submit?
              </span>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Back to Quiz
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleSubmitQuiz}
            >
              Yes, Submit Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizRunner;

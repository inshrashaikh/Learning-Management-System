import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle2, Clock, Award, PlayCircle, AlertCircle, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        // Fetch enrollments first to get course IDs
        const enrRes = await api.get('/enrollments/my-enrollments');
        const courseIds = (enrRes.data || []).map((e) => e.courseId?._id).filter(Boolean);

        const allQuizzes = [];
        for (const cId of courseIds) {
          const qRes = await api.get(`/quizzes/course/${cId}`);
          if (qRes.data) {
            allQuizzes.push(...qRes.data);
          }
        }

        setQuizzes(allQuizzes);
      } catch (err) {
        console.error('Failed to load quizzes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading course quizzes..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Badge variant="indigo">Assessments & Evaluations</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Course Quizzes & Tests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Attempt multiple choice assessments, test your comprehension, and receive instant server-graded scores.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes available"
          description="None of your enrolled courses currently have published quizzes."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const hasAttempted = quiz.hasAttempted;
            const attempt = quiz.latestAttempt;
            const isPassed = attempt?.passed;

            return (
              <Card key={quiz._id} className="flex flex-col justify-between">
                <CardBody className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant={hasAttempted ? (isPassed ? 'emerald' : 'amber') : 'slate'} size="sm">
                      {hasAttempted
                        ? isPassed
                          ? 'Passed'
                          : 'Attempted'
                        : 'Unattempted'}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      Pass score: {quiz.passingScore}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 leading-snug">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {quiz.description || 'Test your knowledge on course concepts.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.questionCount || 0} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.durationMinutes || 15} Mins
                    </span>
                  </div>

                  {/* Result Box if Attempted */}
                  {hasAttempted && attempt && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                        isPassed
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-amber-50/70 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div>
                        <div className="font-bold">Latest Score: {attempt.percentage}%</div>
                        <div className="text-[10px] opacity-75">
                          {attempt.score} of {attempt.totalMarks} points
                        </div>
                      </div>
                      <Badge variant={isPassed ? 'emerald' : 'amber'}>
                        {isPassed ? 'Passed ✓' : 'Did not pass'}
                      </Badge>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link to={`/student/quizzes/${quiz._id}`}>
                      <Button
                        variant={hasAttempted ? 'outline' : 'primary'}
                        size="sm"
                        className="w-full"
                        icon={PlayCircle}
                      >
                        {hasAttempted ? 'Retake / Review Quiz' : 'Start Quiz Now'}
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, FileText, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StudentResults = () => {
  const [results, setResults] = useState({ assignments: [], quizzes: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get('/quizzes/student/results');
        setResults(res.data || { assignments: [], quizzes: [] });
      } catch (err) {
        console.error('Failed to load student results', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your official academic gradebook..." />;
  }

  const gradedAssignments = results.assignments.filter((a) => a.status === 'graded');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="indigo">Academic Gradebook</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Evaluations & Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official marks, percentages, and faculty commentary for assignments and quizzes.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'assignments'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assignments ({gradedAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'quizzes'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quizzes ({results.quizzes.length})
          </button>
        </div>
      </div>

      {activeTab === 'assignments' ? (
        gradedAssignments.length === 0 ? (
          <EmptyState
            title="No graded assignments yet"
            description="Once your submitted assignments are evaluated by your instructors, their scores and feedback will appear here."
          />
        ) : (
          <div className="space-y-4">
            {gradedAssignments.map((sub) => {
              const max = sub.assignmentId?.maxMarks || 100;
              const percentage = Math.round((sub.marksAwarded / max) * 100);

              return (
                <Card key={sub._id}>
                  <CardBody className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {sub.assignmentId?.courseId?.title}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {sub.assignmentId?.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xl font-extrabold text-slate-900">
                            {sub.marksAwarded} / {max}
                          </div>
                          <div className="text-xs font-semibold text-emerald-600">
                            {percentage}% Score
                          </div>
                        </div>
                        <Badge variant="emerald" size="md">
                          Graded
                        </Badge>
                      </div>
                    </div>

                    {/* Instructor Feedback */}
                    {sub.feedback && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-brand-600" /> Instructor
                          Feedback:
                        </span>
                        <p className="text-slate-600 leading-relaxed italic">"{sub.feedback}"</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )
      ) : results.quizzes.length === 0 ? (
        <EmptyState
          title="No quiz attempts recorded"
          description="You haven't attempted any quizzes yet. Visit the Quizzes page to take an assessment."
        />
      ) : (
        <div className="space-y-4">
          {results.quizzes.map((att) => (
            <Card key={att._id}>
              <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {att.courseId?.title}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{att.quizId?.title}</h3>
                  <div className="text-xs text-slate-400">
                    Attempted on {new Date(att.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-slate-900">{att.percentage}%</div>
                    <div className="text-xs text-slate-500">
                      {att.score} / {att.totalMarks} Marks
                    </div>
                  </div>
                  <Badge variant={att.passed ? 'emerald' : 'amber'} size="md">
                    {att.passed ? 'Passed ✓' : 'Failed'}
                  </Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResults;

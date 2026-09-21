import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, CheckCircle2, BookOpen, Award, FileText } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentProgress = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/progress/student/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load progress analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating dynamic learning metrics..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <Badge variant="indigo">Academic Analytics</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Learning Progress & Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Dynamically calculated milestones, completed curriculum ratios, and academic benchmarks.
        </p>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center space-y-2">
          <div className="text-4xl font-extrabold text-brand-600">
            {analytics?.averageProgress || 0}%
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Completion Rate
          </div>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <div className="text-4xl font-extrabold text-emerald-600">
            {analytics?.totalLessonsCompleted || 0}
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Lessons Finished
          </div>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <div className="text-4xl font-extrabold text-amber-600">
            {analytics?.totalAssignmentsDone || 0}
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Assignments Submitted
          </div>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <div className="text-4xl font-extrabold text-purple-600">
            {analytics?.passedQuizzesCount || 0} / {analytics?.totalQuizAttempts || 0}
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quizzes Passed
          </div>
        </Card>
      </div>

      {/* Course-Wise Progress Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Curriculum-Specific Progress Meters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(analytics?.courseProgressDetails || []).map((detail, idx) => (
            <Card key={idx} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="indigo" size="sm">
                    {detail.course?.category}
                  </Badge>
                  <h4 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
                    {detail.course?.title}
                  </h4>
                </div>
                <Badge variant={detail.isCompleted ? 'emerald' : 'slate'}>
                  {detail.isCompleted ? '100% Completed' : `${detail.percentage}% Done`}
                </Badge>
              </div>

              <div className="space-y-2">
                <ProgressBar
                  value={detail.percentage}
                  color={detail.isCompleted ? 'emerald' : 'indigo'}
                  size="md"
                />
                <div className="flex justify-between text-xs text-slate-500 pt-1">
                  <span>Completed Lessons: {detail.completedLessonsCount}</span>
                  <span className="capitalize">{detail.course?.difficulty} difficulty</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;

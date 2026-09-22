import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Award,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [enrollmentRes, analyticsRes, assignmentRes] = await Promise.all([
          api.get('/enrollments/my-enrollments'),
          api.get('/progress/student/analytics'),
          api.get('/assignments/student/my-assignments')
        ]);

        setEnrollments(enrollmentRes.data || []);
        setAnalytics(analyticsRes.data || null);
        setAssignments(assignmentRes.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your student learning dashboard..." />;
  }

  // Active in-progress course
  const activeEnrollment = enrollments[0];
  const pendingAssignments = assignments.filter((a) => !a.submission);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="emerald" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
            Active Student Session
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-sm text-brand-100 max-w-xl">
            You are enrolled in {enrollments.length} active curriculums. Continue where you left off or review pending deadlines.
          </p>
        </div>
        <Link to="/courses">
          <Button
            variant="outline-white"
            size="sm"
            icon={BookOpen}
          >
            Browse More Courses
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{enrollments.length}</div>
              <div className="text-xs font-semibold text-slate-500">Enrolled Courses</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analytics?.totalLessonsCompleted || 0}
              </div>
              <div className="text-xs font-semibold text-slate-500">Completed Lessons</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{pendingAssignments.length}</div>
              <div className="text-xs font-semibold text-slate-500">Pending Submissions</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analytics?.averageProgress || 0}%
              </div>
              <div className="text-xs font-semibold text-slate-500">Average Progress</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Active Course + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Continue Learning Card */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
            <span>Continue Learning</span>
            <Link to="/student/courses" className="text-xs text-brand-600 font-semibold hover:underline">
              View All ({enrollments.length})
            </Link>
          </h2>

          {activeEnrollment ? (
            <Card hover className="overflow-hidden border-brand-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-12">
                <div className="sm:col-span-5 h-48 sm:h-auto overflow-hidden bg-slate-100">
                  <img
                    src={activeEnrollment.courseId?.thumbnail}
                    alt={activeEnrollment.courseId?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{activeEnrollment.courseId?.category}</Badge>
                      <span className="text-xs text-slate-400 capitalize">
                        {activeEnrollment.courseId?.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                      {activeEnrollment.courseId?.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {activeEnrollment.courseId?.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <ProgressBar
                      value={activeEnrollment.progress?.percentage || 0}
                      color="indigo"
                      size="sm"
                    />

                    <Link to={`/student/courses/${activeEnrollment.courseId?._id}/learn`}>
                      <Button variant="primary" size="sm" className="w-full" icon={PlayCircle}>
                        Resume Course
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center space-y-4">
              <p className="text-sm text-slate-500">You are not actively enrolled in any courses yet.</p>
              <Link to="/courses">
                <Button variant="primary" size="sm">
                  Explore Curriculums
                </Button>
              </Link>
            </Card>
          )}

          {/* Enrolled Courses Quick List */}
          {enrollments.length > 1 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold text-slate-800">Other Enrolled Curriculums</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.slice(1, 3).map((enr) => (
                  <Card key={enr._id} hover className="p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <Badge variant="slate" size="sm">
                        {enr.courseId?.category}
                      </Badge>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {enr.courseId?.title}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <ProgressBar value={enr.progress?.percentage || 0} size="sm" />
                      <Link to={`/student/courses/${enr.courseId?._id}/learn`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Go to Course
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Assignments & Deadlines */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Upcoming Assignments</h2>

          <Card>
            <CardBody className="p-4 space-y-3">
              {assignments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No assignments posted for your courses.
                </div>
              ) : (
                assignments.slice(0, 4).map((assign) => {
                  const isSubmitted = !!assign.submission;
                  const isPastDue = new Date() > new Date(assign.dueDate);

                  return (
                    <div
                      key={assign._id}
                      className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            isSubmitted
                              ? 'emerald'
                              : isPastDue
                              ? 'rose'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {isSubmitted
                            ? 'Submitted'
                            : isPastDue
                            ? 'Past Due'
                            : 'Pending'}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {assign.maxMarks} pts
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-800 line-clamp-1">
                        {assign.title}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(assign.dueDate).toLocaleDateString()}
                        </span>
                        <Link
                          to={`/student/assignments/${assign._id}`}
                          className="font-bold text-brand-600 hover:underline"
                        >
                          {isSubmitted ? 'View Details' : 'Submit'}
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

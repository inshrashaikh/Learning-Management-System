import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  BookOpen,
  Users,
  FileCheck,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorData = async () => {
      setLoading(true);
      try {
        const [courseRes, subRes] = await Promise.all([
          api.get('/courses/instructor/my-courses'),
          api.get('/submissions/instructor/all')
        ]);
        setCourses(courseRes.data || []);
        setSubmissions(subRes.data || []);
      } catch (err) {
        console.error('Error loading instructor dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your instructor analytics..." />;
  }

  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const totalStudents = courses.reduce((acc, c) => acc + (c.studentCount || 0), 0);
  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="indigo" className="bg-white/20 text-white border-white/30">
            Faculty Teaching Hub
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-brand-100 max-w-xl">
            Manage course curriculums, grade pending student submissions, and review cohort performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/instructor/courses/new">
            <Button
              variant="secondary"
              size="sm"
              icon={PlusCircle}
            >
              Create Course
            </Button>
          </Link>
          <Link to="/instructor/submissions">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              icon={FileCheck}
            >
              Grade Queue ({pendingSubmissions.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{courses.length}</div>
              <div className="text-xs font-semibold text-slate-500">Total Courses</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{publishedCount}</div>
              <div className="text-xs font-semibold text-slate-500">Published Courses</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{totalStudents}</div>
              <div className="text-xs font-semibold text-slate-500">Enrolled Learners</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{pendingSubmissions.length}</div>
              <div className="text-xs font-semibold text-slate-500">Pending Evaluations</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: My Courses + Submissions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Courses Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">My Curriculums</h2>
            <Link to="/instructor/courses" className="text-xs font-semibold text-brand-600 hover:underline">
              Manage All ({courses.length})
            </Link>
          </div>

          {courses.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-sm text-slate-500">You haven't authored any courses yet.</p>
              <Link to="/instructor/courses/new">
                <Button variant="primary" size="sm" icon={PlusCircle}>
                  Create Your First Course
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <Card key={course._id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={course.status === 'published' ? 'emerald' : 'slate'}
                          size="sm"
                        >
                          {course.status}
                        </Badge>
                        <span className="text-xs text-slate-400">{course.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {course.title}
                      </h4>
                      <div className="text-[11px] text-slate-500">
                        {course.moduleCount || 0} Modules • {course.studentCount || 0} Enrolled
                      </div>
                    </div>
                  </div>

                  <Link to={`/instructor/courses/${course._id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit Course
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pending Submissions Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Submissions Queue</h2>
            <Link to="/instructor/submissions" className="text-xs font-semibold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          <Card>
            <CardBody className="p-4 space-y-3">
              {pendingSubmissions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No submissions pending evaluation.
                </div>
              ) : (
                pendingSubmissions.slice(0, 4).map((sub) => (
                  <div
                    key={sub._id}
                    className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sub.studentId?.name}</span>
                      {sub.isLate && <Badge variant="rose">Late</Badge>}
                    </div>
                    <div className="text-slate-600 line-clamp-1">
                      {sub.assignmentId?.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                      <Link
                        to="/instructor/submissions"
                        className="font-bold text-brand-600 hover:underline"
                      >
                        Grade Now →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;

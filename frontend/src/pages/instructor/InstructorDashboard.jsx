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
  Award,
  GraduationCap
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalCourse, setActiveModalCourse] = useState(null);

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
              variant="white"
              size="sm"
              icon={PlusCircle}
            >
              Create Course
            </Button>
          </Link>
          <Link to="/instructor/submissions">
            <Button
              variant="outline-white"
              size="sm"
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
                <Card key={course._id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={course.status === 'published' ? 'emerald' : 'slate'}
                          size="sm"
                        >
                          {course.status}
                        </Badge>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {course.courseCode || `CRS-${course._id?.slice(-4).toUpperCase()}`}
                        </span>
                        <span className="text-xs text-slate-400">{course.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {course.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                        <span>{course.moduleCount || 0} Modules</span>
                        <span>•</span>
                        <span>{course.lessonCount || 0} Lessons</span>
                        <span>•</span>
                        <span>{course.assignmentCount || 0} Assignments</span>
                        <span>•</span>
                        <span>{course.quizCount || 0} Quizzes</span>
                        <span>•</span>
                        <span className="font-bold text-brand-600">{course.studentCount || 0} Enrolled</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Users}
                      onClick={() => setActiveModalCourse(course)}
                    >
                      Enrolled Students ({course.studentCount || 0})
                    </Button>
                    <Link to={`/instructor/courses/${course._id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
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

      {/* Enrolled Students per Course Section */}
      <div className="space-y-6 pt-4">
        <div>
          <Badge variant="indigo">Cohort Rosters</Badge>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Enrolled Students per Course
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Direct visibility of all learners currently enrolled in each of your authored curriculums.
          </p>
        </div>

        {courses.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No courses available to display student enrollments.
          </Card>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => {
              const students = course.enrolledStudents || [];

              return (
                <Card key={course._id} className="overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-brand-600 uppercase tracking-wider">
                          COURSE: {course.title}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 font-semibold text-slate-700">
                          {course.courseCode || `CRS-${course._id?.slice(-4).toUpperCase()}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Instructor: <span className="font-semibold text-slate-700">{user?.name}</span>
                      </p>
                    </div>
                    <Badge variant="indigo" size="sm">
                      {students.length} Enrolled {students.length === 1 ? 'Student' : 'Students'}
                    </Badge>
                  </CardHeader>

                  <CardBody className="p-0">
                    {students.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No students enrolled in this course yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="py-3 px-4 w-12 text-center">#</th>
                              <th className="py-3 px-4">Student Name</th>
                              <th className="py-3 px-4">Roll No / ID</th>
                              <th className="py-3 px-4">Email</th>
                              <th className="py-3 px-4">Enrolled Date</th>
                              <th className="py-3 px-4">Progress</th>
                              <th className="py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {students.map((student, idx) => (
                              <tr key={student._id || idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 text-center font-bold text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={
                                        student.avatar ||
                                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                                      }
                                      alt={student.name}
                                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                    />
                                    <span className="font-bold text-slate-900">{student.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-600">
                                  {student.rollNumber || `STU-${String(student._id).slice(-4).toUpperCase()}`}
                                </td>
                                <td className="py-3 px-4 text-slate-500">{student.email}</td>
                                <td className="py-3 px-4 text-slate-500">
                                  {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="py-3 px-4 w-36">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-700">
                                      {student.progress || 0}%
                                    </span>
                                    <ProgressBar value={student.progress || 0} size="sm" />
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    variant={student.status === 'completed' ? 'emerald' : 'indigo'}
                                    size="sm"
                                  >
                                    {student.status || 'active'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Enrolled Students Modal */}
      {activeModalCourse && (
        <Modal
          isOpen={!!activeModalCourse}
          onClose={() => setActiveModalCourse(null)}
          title={`Enrolled Students — ${activeModalCourse.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  COURSE: {activeModalCourse.title}
                </span>
                <span className="text-slate-500">
                  Instructor: <span className="font-semibold text-slate-700">{user?.name}</span>
                </span>
              </div>
              <Badge variant="indigo">
                {(activeModalCourse.enrolledStudents || []).length} Enrolled Learners
              </Badge>
            </div>

            {(activeModalCourse.enrolledStudents || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No students enrolled in this course yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Roll No / ID</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Enrolled</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activeModalCourse.enrolledStudents.map((st, idx) => (
                      <tr key={st._id || idx} className="hover:bg-slate-50/80">
                        <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{st.name}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {st.rollNumber || `STU-${String(st._id).slice(-4).toUpperCase()}`}
                        </td>
                        <td className="p-3 text-slate-500">{st.email}</td>
                        <td className="p-3 text-slate-500">
                          {st.enrolledAt ? new Date(st.enrolledAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3">
                          <Badge variant={st.status === 'completed' ? 'emerald' : 'indigo'} size="sm">
                            {st.status || 'active'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveModalCourse(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InstructorDashboard;

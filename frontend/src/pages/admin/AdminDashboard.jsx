import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  BookOpen,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  Award,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error loading admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading platform governance metrics..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <Badge variant="purple" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
            Platform Operations Center
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform System Overview
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Real-time telemetry across registered accounts, curriculums, student enrollments, and academic evaluations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/users">
            <Button variant="outline-white" size="sm">
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/courses">
            <Button variant="primary" size="sm">
              Manage Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid: Total Students, Instructors, Courses, Enrollments */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.totalStudents || 0}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.totalInstructors || 0}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Instructors</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.totalCourses || 0}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Courses</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.totalEnrollments || 0}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrollments</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Breakdown Row: Recent Registrations & Recent Enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent User Signups */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Registrations</h3>
            <Link to="/admin/users" className="text-xs font-semibold text-brand-600 hover:underline">
              View All ({stats?.totalUsers || 0})
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {(stats?.recentUsers || []).map((u) => (
                <div key={u._id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-slate-400">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === 'admin' ? 'purple' : u.role === 'instructor' ? 'indigo' : 'emerald'} size="sm">
                      {u.role}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent Enrollments (Student/Course Relationships) */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent System Enrollments</h3>
            <Link to="/admin/enrollments" className="text-xs font-semibold text-brand-600 hover:underline">
              View All ({stats?.totalEnrollments || 0})
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {(stats?.recentEnrollments || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent enrollments recorded in system.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {(stats?.recentEnrollments || []).map((e) => (
                  <div key={e._id} className="p-4 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {e.studentId?.name || 'Student'}
                        </span>
                        {e.studentId?.email && (
                          <span className="text-slate-400 text-[11px]">({e.studentId.email})</span>
                        )}
                      </div>
                      <div className="text-slate-500 flex items-center gap-2">
                        <span className="font-semibold text-brand-600">Course:</span>
                        <span>{e.courseId?.title || 'Curriculum Course'}</span>
                      </div>
                    </div>
                    <Badge variant="emerald" size="sm">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Course Enrollment Counts Breakdown */}
      {stats?.courseEnrollmentCounts && stats.courseEnrollmentCounts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Course Enrollment Counts</h3>
              <p className="text-xs text-slate-500">System-wide enrollment density per curriculum.</p>
            </div>
            <Link to="/admin/courses" className="text-xs font-semibold text-brand-600 hover:underline">
              Manage Courses
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Course Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Total Enrollments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stats.courseEnrollmentCounts.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{c.title}</td>
                      <td className="p-4 text-slate-600">{c.category}</td>
                      <td className="p-4 text-slate-600">{c.instructorName}</td>
                      <td className="p-4">
                        <Badge variant={c.status === 'published' ? 'emerald' : 'slate'} size="sm">
                          {c.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-extrabold text-brand-600">
                        {c.enrollmentCount} {c.enrollmentCount === 1 ? 'student' : 'students'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

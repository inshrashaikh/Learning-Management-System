import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Users, BookOpen, FileCheck, Award, TrendingUp } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InstructorAnalytics = () => {
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [courseRes, subRes] = await Promise.all([
          api.get('/courses/instructor/my-courses'),
          api.get('/submissions/instructor/all')
        ]);
        setCourses(courseRes.data || []);
        setSubmissions(subRes.data || []);
      } catch (err) {
        console.error('Failed to load instructor analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating cohort performance metrics..." />;
  }

  const totalEnrollments = courses.reduce((acc, c) => acc + (c.studentCount || 0), 0);
  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <Badge variant="indigo">Cohort Intelligence</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Curriculum & Learner Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Monitor student enrollments, module completion rates, and grading velocity across your courses.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center space-y-2">
          <div className="text-4xl font-extrabold text-brand-600">{courses.length}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Authored Curriculums
          </div>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <div className="text-4xl font-extrabold text-emerald-600">{totalEnrollments}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Learners
          </div>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <div className="text-4xl font-extrabold text-blue-600">{submissions.length}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Submissions Received
          </div>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <div className="text-4xl font-extrabold text-purple-600">
            {gradedSubmissions.length} / {submissions.length || 0}
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Evaluations Completed
          </div>
        </Card>
      </div>

      {/* Course Breakdown Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Per-Course Enrollment & Curriculum Density</h3>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Modules</th>
                  <th className="p-4">Lessons</th>
                  <th className="p-4">Enrolled Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{course.title}</td>
                    <td className="p-4 text-slate-600">{course.category}</td>
                    <td className="p-4">
                      <Badge variant={course.status === 'published' ? 'emerald' : 'slate'} size="sm">
                        {course.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600">{course.moduleCount || 0}</td>
                    <td className="p-4 text-slate-600">{course.lessonCount || 0}</td>
                    <td className="p-4 font-extrabold text-brand-600">
                      {course.studentCount || 0} students
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalytics;

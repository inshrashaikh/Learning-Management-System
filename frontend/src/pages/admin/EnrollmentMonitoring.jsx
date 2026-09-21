import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, BookOpen, Clock, Calendar } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EnrollmentMonitoring = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/enrollments');
        setEnrollments(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Auditing student enrollments..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Badge variant="purple">Auditing & Compliance</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Platform Enrollments Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Complete audit trail of student admissions, active enrollments, and completion statuses.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Course Enrolled</th>
                <th className="p-4">Enrolled Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {enrollments.map((enr) => (
                <tr key={enr._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          enr.studentId?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                        }
                        alt={enr.studentId?.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{enr.studentId?.name}</div>
                        <div className="text-slate-400 text-[11px]">{enr.studentId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{enr.courseId?.title}</td>
                  <td className="p-4 text-slate-500">
                    {new Date(enr.enrolledAt || enr.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Badge variant={enr.status === 'completed' ? 'emerald' : 'indigo'} size="sm">
                      {enr.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentMonitoring;

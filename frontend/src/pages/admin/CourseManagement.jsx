import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Star, Eye, Search, Filter, Globe, Lock } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const toast = useToast();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (status !== 'all') query.append('status', status);

      const res = await api.get(`/admin/courses?${query.toString()}`);
      setCourses(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [status]);

  const handleToggleFeatured = async (course) => {
    try {
      const res = await api.patch(`/admin/courses/${course._id}/feature`);
      toast.success(res.message);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, isFeatured: res.data.course.isFeatured } : c
        )
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update featured flag');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Badge variant="purple">Curriculum Quality Control</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Platform Course Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Supervise published curriculums, feature standout courses, and monitor enrollment densities.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
            placeholder="Search course title..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['all', 'published', 'draft'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                status === s ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading courses..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Course</th>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Enrolled</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {courses.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                          <div className="text-slate-400 text-[11px]">{c.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">{c.instructor?.name || 'Instructor'}</td>
                    <td className="p-4">
                      <Badge variant={c.status === 'published' ? 'emerald' : 'slate'} size="sm">
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleFeatured(c)}
                        className={`flex items-center gap-1 text-xs font-semibold p-1 rounded-lg ${
                          c.isFeatured ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${c.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        <span>{c.isFeatured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{c.studentCount || 0} students</td>
                    <td className="p-4 text-right">
                      <Link to={`/courses/${c._id}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;

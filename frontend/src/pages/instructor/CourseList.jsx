import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Globe,
  Lock,
  Users,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [deleteModalCourse, setDeleteModalCourse] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses/instructor/my-courses');
      setCourses(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTogglePublish = async (course) => {
    try {
      const res = await api.patch(`/courses/${course._id}/publish`);
      toast.success(res.message);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, status: res.data.course.status } : c
        )
      );
    } catch (err) {
      toast.error(err.message || 'Failed to change course status');
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteModalCourse) return;
    setDeleting(true);
    try {
      await api.delete(`/courses/${deleteModalCourse._id}`);
      toast.success('Course and associated curriculum deleted successfully.');
      setCourses((prev) => prev.filter((c) => c._id !== deleteModalCourse._id));
      setDeleteModalCourse(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading course curriculums..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="indigo">Teaching Portfolio</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Course Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish, edit modules and lessons, and monitor enrollment statistics.
          </p>
        </div>

        <Link to="/instructor/courses/new">
          <Button variant="primary" size="sm" icon={PlusCircle}>
            Create New Course
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses created yet"
          description="Start authoring your curriculum today. Add modules, lessons, downloadable resources, and quizzes."
          actionLabel="Create Course"
          onAction={() => (window.location.href = '/instructor/courses/new')}
        />
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const isPublished = course.status === 'published';

            return (
              <Card key={course._id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={isPublished ? 'emerald' : 'slate'} size="sm">
                        {course.status}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">{course.category}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400 capitalize">{course.difficulty}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>{course.moduleCount || 0} Modules</span>
                      <span>•</span>
                      <span>{course.lessonCount || 0} Lessons</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5" />
                        {course.studentCount || 0} Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(course)}
                    icon={isPublished ? Lock : Globe}
                  >
                    {isPublished ? 'Unpublish' : 'Publish'}
                  </Button>

                  <Link to={`/instructor/courses/${course._id}/edit`}>
                    <Button variant="secondary" size="sm" icon={Edit}>
                      Edit
                    </Button>
                  </Link>

                  <Link to={`/courses/${course._id}`} target="_blank">
                    <Button variant="ghost" size="sm" title="Preview Public Page">
                      <Eye className="w-4 h-4 text-slate-500" />
                    </Button>
                  </Link>

                  <button
                    onClick={() => setDeleteModalCourse(course)}
                    className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                    title="Delete Course"
                    aria-label="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalCourse && (
        <Modal
          isOpen={!!deleteModalCourse}
          onClose={() => setDeleteModalCourse(null)}
          title="Confirm Deletion"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Permanent Deletion Warning:</span>
                <p className="mt-0.5">
                  Deleting <span className="font-semibold">{deleteModalCourse.title}</span> will
                  permanently remove all its modules, lessons, assignments, and enrollments.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDeleteModalCourse(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleting}
                onClick={handleDeleteCourse}
              >
                Delete Course
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseList;

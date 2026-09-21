import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, PlayCircle, Clock, Award, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/enrollments/my-enrollments');
        setEnrollments(res.data || []);
      } catch (err) {
        console.error('Failed to load enrolled courses', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your enrolled courses..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Badge variant="indigo">Enrolled Curriculums</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          My Active Courses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track course completion percentages and jump straight into lessons.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          title="You haven't enrolled in any courses yet"
          description="Browse our course catalog to find a curriculum that fits your academic goals."
          actionLabel="Browse Course Catalog"
          onAction={() => (window.location.href = '/courses')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr) => {
            const course = enr.courseId;
            if (!course) return null;
            const progress = enr.progress || { percentage: 0 };
            const isFinished = progress.percentage === 100;

            return (
              <Card key={enr._id} hover className="flex flex-col h-full">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={isFinished ? 'emerald' : 'indigo'}>
                      {isFinished ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </div>

                <CardBody className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span>{course.category}</span>
                      <span>•</span>
                      <span className="capitalize">{course.difficulty}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Course Progress</span>
                      <span className="font-bold text-slate-900">{progress.percentage}%</span>
                    </div>
                    <ProgressBar
                      value={progress.percentage}
                      color={isFinished ? 'emerald' : 'indigo'}
                      showLabel={false}
                      size="sm"
                    />

                    <Link to={`/student/courses/${course._id}/learn`}>
                      <Button
                        variant={isFinished ? 'outline' : 'primary'}
                        size="sm"
                        className="w-full"
                        icon={isFinished ? CheckCircle2 : PlayCircle}
                      >
                        {isFinished ? 'Review Curriculum' : 'Continue Learning'}
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;

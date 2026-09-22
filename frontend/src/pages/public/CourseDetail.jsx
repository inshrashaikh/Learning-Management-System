import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  ChevronDown,
  PlayCircle,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/courses/${courseId}`);
        if (response.data && response.data.course) {
          setCourseData(response.data.course);
          // Expand first module by default
          if (response.data.course.modules?.length > 0) {
            setExpandedModules({ [response.data.course.modules[0]._id]: true });
          }
        }
      } catch (err) {
        toast.error(err.message || 'Unable to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, toast]);

  const toggleModule = (id) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${courseId}`);
      return;
    }

    if (user.role !== 'student' && user.role !== 'admin') {
      toast.error('Only students can enroll in courses.');
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      toast.success('Successfully enrolled in course! Welcome aboard.');
      navigate(`/student/courses/${courseId}/learn`);
    } catch (err) {
      toast.error(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading course curriculum..." />;
  }

  if (!courseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-slate-500">The requested curriculum does not exist or has been unpublished.</p>
        <Link to="/courses">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Course Header Banner */}
      <section className="bg-slate-900 text-white pt-12 pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Header Content */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="indigo">{courseData.category}</Badge>
                <Badge variant="emerald" className="capitalize">
                  {courseData.difficulty} Level
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {courseData.title}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
                {courseData.shortDescription}
              </p>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-400 pt-2">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      courseData.instructor?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                    }
                    alt={courseData.instructor?.name}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                  <span>
                    Created by{' '}
                    <span className="text-white font-semibold">{courseData.instructor?.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Duration: {courseData.estimatedDuration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{courseData.totalLessons || 0} Lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{courseData.totalEnrollments || 0} Learners</span>
                </div>
              </div>
            </div>

            {/* Floating Enrollment Card on Desktop */}
            <div className="lg:col-span-4">
              <Card className="shadow-2xl border-slate-700 bg-slate-800/95 text-slate-200">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={courseData.thumbnail}
                    alt={courseData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardBody className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Enrollment Status
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {courseData.isEnrolled ? 'Currently Enrolled' : 'Open Registration'}
                    </span>
                  </div>

                  {courseData.isEnrolled ? (
                    <Link to={`/student/courses/${courseData._id}/learn`}>
                      <Button variant="primary" size="lg" className="w-full" icon={PlayCircle}>
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={enrolling}
                      onClick={handleEnroll}
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      {isAuthenticated ? 'Enroll in Course' : 'Sign in to Enroll'}
                    </Button>
                  )}

                  <div className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Self-paced on-demand curriculum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Dynamic progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Automated quizzes & assignments</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Learning Outcomes, Description, Curriculum Accordion */}
          <div className="lg:col-span-8 space-y-10">
            {/* Learning Outcomes */}
            {courseData.learningOutcomes?.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  What You'll Learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courseData.learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum Outline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Curriculum Syllabus</h3>
                  <p className="text-xs text-slate-500">
                    {courseData.modules?.length || 0} Modules • {courseData.totalLessons || 0} Total Lessons
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {courseData.modules?.map((mod, modIdx) => (
                  <div
                    key={mod._id}
                    className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-card transition-all"
                  >
                    <button
                      onClick={() => toggleModule(mod._id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/80 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900">{mod.title}</div>
                        {mod.description && (
                          <div className="text-xs text-slate-500">{mod.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 font-semibold">
                          {mod.lessons?.length || 0} lessons
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform ${
                            expandedModules[mod._id] ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {expandedModules[mod._id] && (
                      <div className="divide-y divide-slate-100 p-2 sm:p-4 bg-white">
                        {mod.lessons?.map((lesson, lIdx) => (
                          <div
                            key={lesson._id}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-800 font-medium">{lesson.title}</span>
                              {lesson.isFreePreview && (
                                <Badge variant="emerald" size="sm">
                                  Preview Available
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                              {lesson.durationMinutes || 15} mins
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            {courseData.prerequisites?.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
                <h3 className="text-base font-bold text-slate-900">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  {courseData.prerequisites.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Instructor Biography */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardBody className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">About the Instructor</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      courseData.instructor?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                    }
                    alt={courseData.instructor?.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-subtle"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {courseData.instructor?.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {courseData.instructor?.headline || 'Lead Instructor'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {courseData.instructor?.bio ||
                    'Distinguished educator dedicated to student progress and real-world engineering proficiency.'}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

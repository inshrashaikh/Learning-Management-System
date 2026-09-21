import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  FileText,
  Clock
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CourseLearn = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState({ percentage: 0, completedLessons: [] });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Load course details, modules, and progress
  useEffect(() => {
    const loadCourseAndProgress = async () => {
      setLoading(true);
      try {
        const [courseRes, progressRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/progress/${courseId}`)
        ]);

        const cData = courseRes.data?.course;
        setCourse(cData);
        setProgress(progressRes.data?.progress || { percentage: 0, completedLessons: [] });

        // Flatten all lessons to identify active lesson
        const allLessons = [];
        (cData?.modules || []).forEach((m) => {
          (m.lessons || []).forEach((l) => allLessons.push(l));
        });

        if (allLessons.length > 0) {
          if (lessonId) {
            const found = allLessons.find((l) => l._id === lessonId);
            if (found) {
              // Fetch full lesson content
              const lessonRes = await api.get(`/lessons/${found._id}`);
              setCurrentLesson(lessonRes.data?.lesson);
            }
          } else {
            // Default to first incomplete lesson or first lesson
            const firstIncomplete = allLessons.find(
              (l) =>
                !(progressRes.data?.progress?.completedLessons || []).some(
                  (cl) => cl.lessonId?.toString() === l._id.toString()
                )
            );
            const targetLesson = firstIncomplete || allLessons[0];
            const lessonRes = await api.get(`/lessons/${targetLesson._id}`);
            setCurrentLesson(lessonRes.data?.lesson);
            navigate(`/student/courses/${courseId}/lesson/${targetLesson._id}`, { replace: true });
          }
        }
      } catch (err) {
        toast.error(err.message || 'Error loading course curriculum');
      } finally {
        setLoading(false);
      }
    };

    loadCourseAndProgress();
  }, [courseId, lessonId]);

  // Handle lesson selection
  const handleSelectLesson = async (targetId) => {
    try {
      const lessonRes = await api.get(`/lessons/${targetId}`);
      setCurrentLesson(lessonRes.data?.lesson);
      navigate(`/student/courses/${courseId}/lesson/${targetId}`);
    } catch (err) {
      toast.error(err.message || 'Error loading lesson');
    }
  };

  // Toggle completion
  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    setToggling(true);
    try {
      const res = await api.post(`/progress/${courseId}/lessons/${currentLesson._id}/toggle`);
      const { isCompleted, percentage, progress: updatedProgress } = res.data;
      setProgress(updatedProgress);
      toast.success(
        isCompleted
          ? `Lesson completed! Course progress is now ${percentage}%.`
          : 'Lesson marked as incomplete.'
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update lesson status');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Entering learning room..." />;
  }

  if (!course) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Course curriculum not found.</p>
        <Link to="/student/courses">
          <Button variant="primary">Return to My Courses</Button>
        </Link>
      </div>
    );
  }

  // Flatten lessons for previous / next navigation
  const flatLessons = [];
  (course.modules || []).forEach((m) => {
    (m.lessons || []).forEach((l) => flatLessons.push(l));
  });

  const currentIndex = flatLessons.findIndex((l) => l._id === currentLesson?._id);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  const isCurrentLessonComplete = (progress.completedLessons || []).some(
    (cl) => cl.lessonId?.toString() === currentLesson?._id?.toString()
  );

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row -m-4 sm:-m-8 bg-white overflow-hidden">
      {/* Sidebar: Curriculum Tree */}
      <aside className="w-full lg:w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 h-auto lg:h-full overflow-y-auto">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-200 bg-white space-y-3">
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Courses
          </Link>
          <h2 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
            {course.title}
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Overall Progress</span>
              <span className="text-slate-900 font-bold">{progress.percentage || 0}%</span>
            </div>
            <ProgressBar value={progress.percentage || 0} showLabel={false} size="sm" color="emerald" />
          </div>
        </div>

        {/* Modules & Lessons Accordion List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
          {(course.modules || []).map((mod, mIdx) => (
            <div key={mod._id} className="py-2">
              <div className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                {mod.title}
              </div>
              <div className="space-y-0.5 px-2">
                {(mod.lessons || []).map((les) => {
                  const isSelected = currentLesson?._id === les._id;
                  const isDone = (progress.completedLessons || []).some(
                    (cl) => cl.lessonId?.toString() === les._id.toString()
                  );

                  return (
                    <button
                      key={les._id}
                      onClick={() => handleSelectLesson(les._id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white font-bold shadow-sm'
                          : 'hover:bg-slate-200/70 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {isDone ? (
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? 'text-white' : 'text-emerald-500'
                            }`}
                          />
                        ) : (
                          <Circle
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? 'text-brand-200' : 'text-slate-300'
                            }`}
                          />
                        )}
                        <span className="truncate">{les.title}</span>
                      </div>
                      <span
                        className={`text-[10px] shrink-0 ml-2 ${
                          isSelected ? 'text-brand-100' : 'text-slate-400'
                        }`}
                      >
                        {les.durationMinutes || 15}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/50">
        {currentLesson ? (
          <div className="flex-1 flex flex-col justify-between">
            <div className="max-w-4xl w-full mx-auto p-6 sm:p-10 space-y-8">
              {/* Lesson Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                  <Badge variant="indigo" size="sm">
                    Lesson {currentIndex + 1} of {flatLessons.length}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentLesson.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {currentLesson.durationMinutes || 15} minutes
                    </span>
                  </div>
                </div>

                {/* Mark as complete button */}
                <Button
                  variant={isCurrentLessonComplete ? 'secondary' : 'primary'}
                  size="sm"
                  isLoading={toggling}
                  onClick={handleToggleComplete}
                  icon={CheckCircle2}
                >
                  {isCurrentLessonComplete ? 'Completed ✓' : 'Mark as Complete'}
                </Button>
              </div>

              {/* Video Embed Player if present */}
              {currentLesson.videoUrl && (
                <div className="rounded-2xl overflow-hidden shadow-card border border-slate-200 bg-black aspect-video">
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Lesson Body Content */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card">
                <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line font-sans">
                  {currentLesson.content}
                </div>
              </div>

              {/* Downloadable Resources */}
              {currentLesson.resources?.length > 0 && (
                <div className="bg-indigo-50/60 rounded-2xl p-6 border border-indigo-100 space-y-3">
                  <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    Attached Learning Resources
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLesson.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100 hover:border-brand-300 text-xs font-semibold text-slate-800 transition-colors"
                      >
                        <span className="truncate">{res.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-brand-600 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Navigation Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              {prevLesson ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectLesson(prevLesson._id)}
                  icon={ChevronLeft}
                >
                  Previous: {prevLesson.title}
                </Button>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSelectLesson(nextLesson._id)}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Next: {nextLesson.title}
                </Button>
              ) : (
                <Link to="/student/results">
                  <Button variant="primary" size="sm">
                    View Course Results
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">Select a lesson to begin learning.</div>
        )}
      </div>
    </div>
  );
};

export default CourseLearn;

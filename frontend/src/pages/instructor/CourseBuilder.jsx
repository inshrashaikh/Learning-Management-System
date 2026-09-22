import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Layers,
  FileCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  ArrowLeft,
  Globe,
  Lock,
  PlayCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CourseBuilder = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isEditing = !!courseId;
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Step 1: Course Metadata
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [difficulty, setDifficulty] = useState('beginner');
  const [thumbnail, setThumbnail] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
  );
  const [estimatedDuration, setEstimatedDuration] = useState('6 Weeks');
  const [learningOutcomes, setLearningOutcomes] = useState(['', '']);
  const [status, setStatus] = useState('draft');

  // Step 2: Curriculum (Modules & Lessons)
  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [activeModuleForLesson, setActiveModuleForLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    videoUrl: '',
    durationMinutes: 15,
    isFreePreview: false
  });

  // Step 3: Assignments & Quizzes
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100
  });

  const categories = [
    'Web Development',
    'Data Science',
    'Cybersecurity',
    'Cloud Computing',
    'Artificial Intelligence',
    'Mobile Development',
    'Software Architecture',
    'DevOps'
  ];

  // Load existing course data if in edit mode
  useEffect(() => {
    if (isEditing) {
      const loadCourse = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/courses/${courseId}`);
          const c = res.data?.course;
          if (c) {
            setTitle(c.title || '');
            setShortDescription(c.shortDescription || '');
            setDescription(c.description || '');
            setCategory(c.category || 'Web Development');
            setDifficulty(c.difficulty || 'beginner');
            setThumbnail(c.thumbnail || '');
            setEstimatedDuration(c.estimatedDuration || '6 Weeks');
            setLearningOutcomes(c.learningOutcomes?.length ? c.learningOutcomes : ['', '']);
            setStatus(c.status || 'draft');
            setModules(c.modules || []);
          }

          // Also load assignments
          const assignRes = await api.get(`/assignments/course/${courseId}`);
          setAssignments(assignRes.data || []);
        } catch (err) {
          toast.error(err.message || 'Error loading course data');
        } finally {
          setLoading(false);
        }
      };

      loadCourse();
    }
  }, [courseId, isEditing]);

  // Step 1 Submit: Save or Update Course Metadata
  const handleSaveMetadata = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !shortDescription.trim() || !description.trim()) {
      toast.error('Please fill in title, short summary, and full description.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        shortDescription,
        description,
        category,
        difficulty,
        thumbnail,
        estimatedDuration,
        learningOutcomes: learningOutcomes.filter((o) => o.trim() !== '')
      };

      if (isEditing) {
        await api.put(`/courses/${courseId}`, payload);
        toast.success('Course information updated!');
        setActiveStep(2);
      } else {
        const res = await api.post('/courses', payload);
        toast.success('Course created! Now assemble your curriculum.');
        navigate(`/instructor/courses/${res.data.course._id}/edit`, { replace: true });
        setActiveStep(2);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save course metadata');
    } finally {
      setSaving(false);
    }
  };

  // Step 2 Module Creation
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const res = await api.post(`/modules/course/${courseId}`, {
        title: newModuleTitle
      });
      toast.success('Module added!');
      setModules((prev) => [...prev, { ...res.data.module, lessons: [] }]);
      setNewModuleTitle('');
    } catch (err) {
      toast.error(err.message || 'Failed to add module');
    }
  };

  // Step 2 Lesson Creation
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !lessonForm.content.trim()) {
      toast.error('Lesson title and content are required.');
      return;
    }

    try {
      const res = await api.post(`/modules/${activeModuleForLesson._id}/lessons`, lessonForm);
      toast.success('Lesson added to module!');

      setModules((prev) =>
        prev.map((m) =>
          m._id === activeModuleForLesson._id
            ? { ...m, lessons: [...(m.lessons || []), res.data.lesson] }
            : m
        )
      );

      setActiveModuleForLesson(null);
      setLessonForm({
        title: '',
        content: '',
        videoUrl: '',
        durationMinutes: 15,
        isFreePreview: false
      });
    } catch (err) {
      toast.error(err.message || 'Failed to add lesson');
    }
  };

  // Step 3 Assignment Creation
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim() || !newAssignment.description.trim() || !newAssignment.dueDate) {
      toast.error('Assignment title, description, and due date are required.');
      return;
    }

    try {
      const res = await api.post('/assignments', {
        ...newAssignment,
        courseId
      });
      toast.success('Assignment created!');
      setAssignments((prev) => [...prev, res.data.assignment]);
      setNewAssignment({
        title: '',
        description: '',
        dueDate: '',
        maxMarks: 100
      });
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment');
    }
  };

  // Step 4 Publish Toggle
  const handleTogglePublish = async () => {
    try {
      const res = await api.patch(`/courses/${courseId}/publish`);
      setStatus(res.data.course.status);
      toast.success(`Course is now ${res.data.course.status}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to update publish state');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading course editor..." />;
  }

  const steps = [
    { num: 1, label: 'Course Info' },
    { num: 2, label: 'Curriculum & Lessons' },
    { num: 3, label: 'Assignments' },
    { num: 4, label: 'Preview & Publish' }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/instructor/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course List
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? `Edit: ${title || 'Untitled Course'}` : 'Author New Curriculum'}
          </h1>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <Badge variant={status === 'published' ? 'emerald' : 'slate'} size="md">
              {status}
            </Badge>
            <Link to={`/courses/${courseId}`} target="_blank">
              <Button variant="outline" size="sm">
                Preview
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 4-Step Stepper Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
        {steps.map((s, idx) => {
          const isActive = activeStep === s.num;
          const isDone = activeStep > s.num;

          return (
            <React.Fragment key={s.num}>
              <button
                type="button"
                disabled={!isEditing && s.num > 1}
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center gap-2.5 text-xs font-bold transition-colors ${
                  isActive
                    ? 'text-brand-600'
                    : isDone
                    ? 'text-emerald-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-3 bg-slate-100 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1: COURSE METADATA */}
      {activeStep === 1 && (
        <Card>
          <CardHeader>
            <h3 className="text-base font-bold text-slate-900">Step 1: Course Information</h3>
            <p className="text-xs text-slate-500">Provide the title, summary, and categories.</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveMetadata} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture & Microservices"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Short Description (Summary Card) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A concise summary shown on course cards (max 200 chars)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g. 8 Weeks"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Detailed Course Overview (Markdown supported) *
                </label>
                <textarea
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="### Course Overview&#10;Write comprehensive details regarding syllabus goals, target learners, and technology prerequisites..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" variant="primary" isLoading={saving} icon={ArrowRight} iconPosition="right">
                  {isEditing ? 'Save & Continue to Curriculum' : 'Create Course & Proceed'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* STEP 2: CURRICULUM & LESSONS */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 2: Modules & Lessons</h3>
                <p className="text-xs text-slate-500">
                  Organize your curriculum into ordered modules and lesson topics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="New Module Title..."
                  className="p-2 text-xs rounded-xl border border-slate-200 w-52 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button variant="primary" size="sm" onClick={handleAddModule} icon={Plus}>
                  Add Module
                </Button>
              </div>
            </CardHeader>

            <CardBody className="space-y-6">
              {modules.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No modules created yet. Add a module title above to begin structuring lessons.
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((mod, mIdx) => (
                    <div
                      key={mod._id}
                      className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-subtle"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Module {mIdx + 1}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{mod.title}</h4>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveModuleForLesson(mod)}
                          icon={Plus}
                        >
                          Add Lesson
                        </Button>
                      </div>

                      {/* Lessons list */}
                      <div className="space-y-2">
                        {(mod.lessons || []).length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            No lessons in this module yet.
                          </p>
                        ) : (
                          mod.lessons.map((les, lIdx) => (
                            <div
                              key={les._id}
                              className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <PlayCircle className="w-4 h-4 text-slate-400" />
                                <span className="font-semibold text-slate-800">{les.title}</span>
                              </div>
                              <span className="text-slate-400">{les.durationMinutes || 15}m</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(1)} icon={ArrowLeft}>
                  Previous: Course Info
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveStep(3)} icon={ArrowRight} iconPosition="right">
                  Next: Assignments
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Add Lesson Modal */}
          {activeModuleForLesson && (
            <Modal
              isOpen={!!activeModuleForLesson}
              onClose={() => setActiveModuleForLesson(null)}
              title={`Add Lesson to: ${activeModuleForLesson.title}`}
            >
              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="e.g. 1.1 Architecture Deep Dive"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      value={lessonForm.durationMinutes}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, durationMinutes: parseInt(e.target.value, 10) })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Video URL (Optional embed)
                    </label>
                    <input
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lesson Content / Notes *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder="Technical explanations, architecture breakdowns, code examples..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModuleForLesson(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Add Lesson
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}

      {/* STEP 3: ASSIGNMENTS */}
      {activeStep === 3 && (
        <Card>
          <CardHeader>
            <h3 className="text-base font-bold text-slate-900">Step 3: Course Assignments</h3>
            <p className="text-xs text-slate-500">
              Create homework deliverables and project assessments with deadlines.
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Create Assignment Form */}
            <form onSubmit={handleAddAssignment} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Create New Assignment</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, title: e.target.value })
                  }
                  placeholder="e.g. Implement Microservices Service Mesh"
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, dueDate: e.target.value })
                    }
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maximum Marks *
                  </label>
                  <input
                    type="number"
                    required
                    value={newAssignment.maxMarks}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        maxMarks: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions & Criteria *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, description: e.target.value })
                  }
                  placeholder="Explain requirements, deliverables, and rubric..."
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white font-sans"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" icon={Plus}>
                  Create Assignment
                </Button>
              </div>
            </form>

            {/* List of existing assignments */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Course Assignments ({assignments.length})
              </h4>
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No assignments added yet.</p>
              ) : (
                assignments.map((a) => (
                  <div
                    key={a._id}
                    className="p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900">{a.title}</h5>
                      <span className="text-slate-400">
                        Due: {new Date(a.dueDate).toLocaleDateString()} • {a.maxMarks} Marks
                      </span>
                    </div>
                    <Badge variant="emerald">Active</Badge>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveStep(2)} icon={ArrowLeft}>
                Previous: Curriculum
              </Button>
              <Button variant="primary" size="sm" onClick={() => setActiveStep(4)} icon={ArrowRight} iconPosition="right">
                Next: Final Review
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* STEP 4: PREVIEW & PUBLISH */}
      {activeStep === 4 && (
        <Card>
          <CardHeader>
            <h3 className="text-base font-bold text-slate-900">Step 4: Preview & Publish</h3>
            <p className="text-xs text-slate-500">
              Review your course structure and toggle its public catalog visibility.
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={status === 'published' ? 'emerald' : 'slate'} size="md">
                    Status: {status.toUpperCase()}
                  </Badge>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">{title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{shortDescription}</p>
                </div>
                <Button
                  variant={status === 'published' ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleTogglePublish}
                  icon={status === 'published' ? Lock : Globe}
                >
                  {status === 'published' ? 'Unpublish Course' : 'Publish to Catalog'}
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block">Modules:</span>
                  <span className="font-bold text-slate-800">{modules.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lessons:</span>
                  <span className="font-bold text-slate-800">
                    {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Assignments:</span>
                  <span className="font-bold text-slate-800">{assignments.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Difficulty:</span>
                  <span className="font-bold text-slate-800 capitalize">{difficulty}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveStep(3)} icon={ArrowLeft}>
                Previous: Assignments
              </Button>
              <Link to="/instructor/courses">
                <Button variant="primary" size="sm" icon={CheckCircle2}>
                  Finish & Return to Course List
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default CourseBuilder;

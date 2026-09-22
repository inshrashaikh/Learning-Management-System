import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Award,
  Filter
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const SubmissionsReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  // Evaluation modal
  const [activeSub, setActiveSub] = useState(null);
  const [marksAwarded, setMarksAwarded] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/submissions/instructor/all');
        setSubmissions(res.data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load submissions queue');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [toast]);

  const handleOpenEvaluate = (sub) => {
    setActiveSub(sub);
    setMarksAwarded(sub.marksAwarded !== undefined ? sub.marksAwarded : sub.assignmentId?.maxMarks || 100);
    setFeedback(sub.feedback || '');
  };

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    if (marksAwarded < 0) {
      toast.error('Marks cannot be negative.');
      return;
    }
    if (marksAwarded > (activeSub.assignmentId?.maxMarks || 100)) {
      toast.error(`Marks cannot exceed maximum points (${activeSub.assignmentId?.maxMarks}).`);
      return;
    }

    setEvaluating(true);
    try {
      const res = await api.patch(`/submissions/${activeSub._id}/evaluate`, {
        marksAwarded,
        feedback
      });

      toast.success('Submission evaluated and grade recorded!');
      setSubmissions((prev) =>
        prev.map((s) => (s._id === activeSub._id ? res.data?.submission : s))
      );
      setActiveSub(null);
    } catch (err) {
      toast.error(err.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const filtered = submissions.filter((s) => {
    if (filter === 'submitted') return s.status !== 'graded';
    if (filter === 'graded') return s.status === 'graded';
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading submissions queue..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="indigo">Grading Hub</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Submissions & Evaluation Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review student deliverables, award scores, and provide qualitative feedback.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          {['all', 'submitted', 'graded'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab === 'submitted' ? 'Needs Grading' : tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No submissions found"
          description="There are currently no student submissions in this category."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => {
            const isGraded = sub.status === 'graded';
            const maxMarks = sub.assignmentId?.maxMarks || 100;

            return (
              <Card key={sub._id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          sub.studentId?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                        }
                        alt={sub.studentId?.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {sub.studentId?.name}{' '}
                          <span className="text-xs text-slate-400 font-normal">
                            ({sub.studentId?.email})
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {sub.courseId?.title} • {sub.assignmentId?.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.isLate && <Badge variant="rose">Late Submission</Badge>}
                      <Badge variant={isGraded ? 'emerald' : 'amber'}>
                        {isGraded ? 'Graded' : 'Pending Evaluation'}
                      </Badge>
                    </div>
                  </div>

                  {/* Submission Content Text */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-slate-700">Student Response:</div>
                    <p className="whitespace-pre-line text-slate-800 leading-relaxed font-sans">
                      {sub.content}
                    </p>
                    {sub.attachmentUrl && (
                      <div className="pt-2">
                        <a
                          href={sub.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-brand-600 font-bold hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Attached Repository / File
                        </a>
                      </div>
                    )}
                  </div>

                  {/* If Graded, Show Existing Grade */}
                  {isGraded && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                      <div>
                        <span className="font-bold text-emerald-950">Current Evaluation: </span>
                        <span className="text-emerald-800 italic">"{sub.feedback}"</span>
                      </div>
                      <div className="font-extrabold text-emerald-700 text-sm">
                        {sub.marksAwarded} / {maxMarks}
                      </div>
                    </div>
                  )}

                  {/* Evaluate Action Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      variant={isGraded ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenEvaluate(sub)}
                      icon={Award}
                    >
                      {isGraded ? 'Update Grade & Feedback' : 'Grade Submission'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Evaluation Modal */}
      {activeSub && (
        <Modal
          isOpen={!!activeSub}
          onClose={() => setActiveSub(null)}
          title={`Grade: ${activeSub.studentId?.name}`}
        >
          <form onSubmit={handleEvaluateSubmit} className="space-y-4">
            <div className="text-xs text-slate-600 space-y-1 pb-2 border-b border-slate-100">
              <div>
                <span className="font-bold">Assignment:</span> {activeSub.assignmentId?.title}
              </div>
              <div>
                <span className="font-bold">Maximum Points:</span>{' '}
                {activeSub.assignmentId?.maxMarks || 100}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marks Awarded (0 to {activeSub.assignmentId?.maxMarks || 100}) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={activeSub.assignmentId?.maxMarks || 100}
                value={marksAwarded}
                onChange={(e) => setMarksAwarded(parseInt(e.target.value, 10))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qualitative Faculty Feedback
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide constructive commentary on architecture, code clarity, and optimizations..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveSub(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={evaluating}>
                Save Evaluation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SubmissionsReview;

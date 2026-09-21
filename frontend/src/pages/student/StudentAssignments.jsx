import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileCheck,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StudentAssignments = () => {
  const { assignmentId } = useParams();
  const toast = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Submission Modal state
  const [activeModalAssignment, setActiveModalAssignment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/assignments/student/my-assignments');
        setAssignments(res.data || []);

        // If URL has specific assignmentId, open its submission modal
        if (assignmentId && res.data) {
          const match = res.data.find((a) => a._id === assignmentId);
          if (match) {
            setActiveModalAssignment(match);
            if (match.submission) {
              setSubmissionContent(match.submission.content || '');
              setAttachmentUrl(match.submission.attachmentUrl || '');
            }
          }
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [assignmentId, toast]);

  const handleOpenSubmit = (assign) => {
    setActiveModalAssignment(assign);
    if (assign.submission) {
      setSubmissionContent(assign.submission.content || '');
      setAttachmentUrl(assign.submission.attachmentUrl || '');
    } else {
      setSubmissionContent('');
      setAttachmentUrl('');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!submissionContent.trim()) {
      toast.error('Please enter your submission text or response.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/assignments/${activeModalAssignment._id}/submit`, {
        content: submissionContent,
        attachmentUrl
      });

      toast.success(res.message || 'Assignment submitted successfully!');

      // Update local state
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === activeModalAssignment._id
            ? { ...a, submission: res.data?.submission, status: 'submitted' }
            : a
        )
      );

      setActiveModalAssignment(null);
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'pending') return !a.submission;
    if (filter === 'submitted') return !!a.submission && a.submission.status !== 'graded';
    if (filter === 'graded') return a.submission?.status === 'graded';
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading course assignments..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="indigo">Academic Deliverables</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Course Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit coursework, track due dates, and view instructor marks and qualitative feedback.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
          {['all', 'pending', 'submitted', 'graded'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="There are currently no assignments matching your filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssignments.map((assign) => {
            const sub = assign.submission;
            const isGraded = sub?.status === 'graded';
            const isPastDue = new Date() > new Date(assign.dueDate);

            return (
              <Card key={assign._id} className="flex flex-col justify-between">
                <CardBody className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {assign.courseId?.title}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {assign.title}
                      </h3>
                    </div>

                    <Badge
                      variant={
                        isGraded
                          ? 'emerald'
                          : sub
                          ? 'indigo'
                          : isPastDue
                          ? 'rose'
                          : 'amber'
                      }
                      size="sm"
                    >
                      {isGraded
                        ? 'Graded'
                        : sub
                        ? sub.isLate
                          ? 'Submitted (Late)'
                          : 'Submitted'
                        : isPastDue
                        ? 'Past Due'
                        : 'Pending'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {assign.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Due: {new Date(assign.dueDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-slate-700">
                      Max: {assign.maxMarks} Marks
                    </span>
                  </div>

                  {/* Feedback Box if Graded */}
                  {isGraded && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Evaluation Result
                        </span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          {sub.marksAwarded} / {assign.maxMarks}
                        </span>
                      </div>
                      {sub.feedback && (
                        <p className="text-emerald-900 leading-relaxed italic pt-1">
                          "{sub.feedback}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      variant={isGraded ? 'outline' : sub ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full"
                      onClick={() => handleOpenSubmit(assign)}
                      icon={FileCheck}
                    >
                      {isGraded
                        ? 'View Full Submission & Feedback'
                        : sub
                        ? 'Update / Resubmit Work'
                        : 'Submit Assignment'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {activeModalAssignment && (
        <Modal
          isOpen={!!activeModalAssignment}
          onClose={() => setActiveModalAssignment(null)}
          title={`Assignment: ${activeModalAssignment.title}`}
        >
          <form onSubmit={handleModalSubmit} className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="font-bold text-slate-900 mb-1">Instructions:</div>
              <p className="leading-relaxed whitespace-pre-line">
                {activeModalAssignment.description}
              </p>
              <div className="pt-2 flex items-center justify-between font-semibold text-slate-500">
                <span>Due: {new Date(activeModalAssignment.dueDate).toLocaleString()}</span>
                <span>Maximum Marks: {activeModalAssignment.maxMarks}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Submission Response / Written Solution *
              </label>
              <textarea
                required
                rows={6}
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Type your response, architectural analysis, or paste your repository link..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Attachment / Artifact URL (Optional)
              </label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://github.com/user/project or Google Drive link"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalAssignment(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={submitting}
                icon={Send}
              >
                Confirm Submission
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentAssignments;

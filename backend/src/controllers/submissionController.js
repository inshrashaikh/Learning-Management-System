const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { createNotification } = require('../services/notificationService');

exports.submitAssignment = async (req, res, next) => {
  try {
    const { id: assignmentId } = req.params;
    const { content, attachmentUrl } = req.body;
    const studentId = req.user.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return next(new AppError('Assignment not found', 404));
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: assignment.courseId,
      status: { $ne: 'dropped' }
    });

    if (!enrollment) {
      return next(new AppError('You must be actively enrolled in this course to submit assignments', 403));
    }

    // Check if late
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    // Upsert or update submission
    let submission = await Submission.findOne({ assignmentId, studentId });

    if (submission) {
      submission.content = content;
      if (attachmentUrl) submission.attachmentUrl = attachmentUrl;
      submission.submittedAt = now;
      submission.isLate = isLate;
      submission.status = 'resubmitted';
      await submission.save();
    } else {
      submission = await Submission.create({
        assignmentId,
        studentId,
        courseId: assignment.courseId,
        content,
        attachmentUrl: attachmentUrl || '',
        submittedAt: now,
        isLate,
        status: 'submitted'
      });
    }

    // Notify instructor
    await createNotification({
      userId: assignment.instructorId,
      title: 'New Assignment Submission',
      message: `${req.user.name} submitted assignment "${assignment.title}".`,
      type: 'assignment_new',
      link: `/instructor/submissions`
    });

    return successResponse(res, 201, isLate ? 'Assignment submitted (Late)' : 'Assignment submitted successfully', {
      submission
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const { id: assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return next(new AppError('Assignment not found', 404));
    }

    if (assignment.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to view submissions for this assignment', 403));
    }

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email avatar')
      .sort({ submittedAt: -1 })
      .lean();

    return successResponse(res, 200, 'Submissions retrieved', {
      assignment,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

exports.getInstructorPendingSubmissions = async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    // Find all courses by instructor
    const courses = await Course.find({ instructor: instructorId }).select('_id');
    const courseIds = courses.map((c) => c._id);

    const submissions = await Submission.find({ courseId: { $in: courseIds } })
      .populate('assignmentId', 'title maxMarks dueDate')
      .populate('studentId', 'name email avatar')
      .populate('courseId', 'title')
      .sort({ submittedAt: -1 })
      .lean();

    return successResponse(res, 200, 'Instructor submissions retrieved', submissions);
  } catch (error) {
    next(error);
  }
};

exports.evaluateSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { marksAwarded, feedback } = req.body;

    const submission = await Submission.findById(id).populate('assignmentId');
    if (!submission) {
      return next(new AppError('Submission not found', 404));
    }

    const assignment = submission.assignmentId;
    if (assignment.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to grade this submission', 403));
    }

    if (marksAwarded > assignment.maxMarks) {
      return next(
        new AppError(`Marks awarded (${marksAwarded}) cannot exceed maximum marks (${assignment.maxMarks})`, 400)
      );
    }

    submission.marksAwarded = marksAwarded;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;
    await submission.save();

    // Notify student
    await createNotification({
      userId: submission.studentId,
      title: 'Assignment Graded',
      message: `Your submission for "${assignment.title}" has been graded: ${marksAwarded}/${assignment.maxMarks}.`,
      type: 'assignment_graded',
      link: `/student/assignments/${assignment._id}`
    });

    return successResponse(res, 200, 'Submission evaluated successfully', { submission });
  } catch (error) {
    next(error);
  }
};

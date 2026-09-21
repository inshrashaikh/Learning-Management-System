const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { createNotification } = require('../services/notificationService');

exports.getAssignmentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({ courseId, status: 'published' })
      .sort({ dueDate: 1 })
      .lean();

    // If student, attach submission status
    let results = assignments;
    if (req.user && req.user.role === 'student') {
      results = await Promise.all(
        assignments.map(async (assign) => {
          const submission = await Submission.findOne({
            assignmentId: assign._id,
            studentId: req.user.id
          }).lean();
          return {
            ...assign,
            submission: submission || null,
            hasSubmitted: !!submission
          };
        })
      );
    }

    return successResponse(res, 200, 'Assignments retrieved', results);
  } catch (error) {
    next(error);
  }
};

exports.getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate('courseId', 'title instructor')
      .populate('moduleId', 'title')
      .lean();

    if (!assignment) {
      return next(new AppError('Assignment not found', 404));
    }

    let submission = null;
    if (req.user && req.user.role === 'student') {
      submission = await Submission.findOne({
        assignmentId: id,
        studentId: req.user.id
      }).lean();
    }

    return successResponse(res, 200, 'Assignment details retrieved', {
      assignment,
      submission
    });
  } catch (error) {
    next(error);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const { courseId, title, description, dueDate, maxMarks, moduleId, attachmentUrl } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to add assignments to this course', 403));
    }

    const assignment = await Assignment.create({
      courseId,
      moduleId,
      instructorId: req.user.id,
      title,
      description,
      dueDate,
      maxMarks,
      attachmentUrl: attachmentUrl || ''
    });

    // Notify all enrolled students
    const enrollments = await Enrollment.find({ courseId, status: { $ne: 'dropped' } }).select('studentId');
    for (const enr of enrollments) {
      await createNotification({
        userId: enr.studentId,
        title: 'New Assignment Published',
        message: `A new assignment "${title}" was posted in "${course.title}". Due date: ${new Date(dueDate).toLocaleDateString()}.`,
        type: 'assignment_new',
        link: `/student/assignments/${assignment._id}`
      });
    }

    return successResponse(res, 201, 'Assignment created successfully', { assignment });
  } catch (error) {
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return next(new AppError('Assignment not found', 404));
    }

    if (assignment.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to modify this assignment', 403));
    }

    const updated = await Assignment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return successResponse(res, 200, 'Assignment updated successfully', { assignment: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return next(new AppError('Assignment not found', 404));
    }

    if (assignment.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to delete this assignment', 403));
    }

    await Promise.all([
      Assignment.findByIdAndDelete(id),
      Submission.deleteMany({ assignmentId: id })
    ]);

    return successResponse(res, 200, 'Assignment and submissions deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.getStudentAssignments = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Get courses student is enrolled in
    const enrollments = await Enrollment.find({ studentId, status: { $ne: 'dropped' } }).select('courseId');
    const courseIds = enrollments.map((e) => e.courseId);

    const assignments = await Assignment.find({
      courseId: { $in: courseIds },
      status: 'published'
    })
      .populate('courseId', 'title')
      .sort({ dueDate: 1 })
      .lean();

    const submissions = await Submission.find({
      studentId,
      courseId: { $in: courseIds }
    }).lean();

    const enriched = assignments.map((assign) => {
      const sub = submissions.find(
        (s) => s.assignmentId.toString() === assign._id.toString()
      );
      return {
        ...assign,
        submission: sub || null,
        status: sub ? sub.status : (new Date() > new Date(assign.dueDate) ? 'missed' : 'pending')
      };
    });

    return successResponse(res, 200, 'Student assignments retrieved', enriched);
  } catch (error) {
    next(error);
  }
};

const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { createNotification } = require('../services/notificationService');

exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.status !== 'published') {
      return next(new AppError('Cannot enroll in an unpublished course', 400));
    }

    // Check duplicate enrollment
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      return next(new AppError('You are already enrolled in this course', 409));
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: 'active'
    });

    // Create initial Progress tracking document
    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) {
      progress = await Progress.create({
        studentId,
        courseId,
        completedLessons: [],
        percentage: 0
      });
    }

    // Dispatch notification
    await createNotification({
      userId: studentId,
      title: 'Enrollment Confirmed',
      message: `You have successfully enrolled in "${course.title}". Start your learning journey!`,
      type: 'enrollment',
      link: `/student/courses/${courseId}/learn`
    });

    return successResponse(res, 201, 'Successfully enrolled in course', {
      enrollment,
      progress
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyEnrollments = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ studentId, status: { $ne: 'dropped' } })
      .populate({
        path: 'courseId',
        select: 'title shortDescription thumbnail category difficulty estimatedDuration instructor',
        populate: {
          path: 'instructor',
          select: 'name email avatar headline'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Attach progress to each enrolled course
    const results = await Promise.all(
      enrollments.map(async (enr) => {
        if (!enr.courseId) return null;
        const prog = await Progress.findOne({
          studentId,
          courseId: enr.courseId._id
        }).lean();

        return {
          ...enr,
          progress: prog || { percentage: 0, completedLessons: [] }
        };
      })
    );

    const filtered = results.filter(Boolean);
    return successResponse(res, 200, 'Enrollments retrieved', filtered);
  } catch (error) {
    next(error);
  }
};

exports.getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to view enrollments for this course', 403));
    }

    const enrollments = await Enrollment.find({ courseId })
      .populate('studentId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Attach each student's progress
    const enriched = await Promise.all(
      enrollments.map(async (enr) => {
        const prog = await Progress.findOne({
          studentId: enr.studentId._id,
          courseId
        }).lean();

        return {
          ...enr,
          progress: prog ? prog.percentage : 0
        };
      })
    );

    return successResponse(res, 200, 'Course enrollments retrieved', enriched);
  } catch (error) {
    next(error);
  }
};

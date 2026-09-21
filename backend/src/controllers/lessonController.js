const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');

exports.getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    const course = await Course.findById(lesson.courseId);

    // If free preview, anyone can access
    if (lesson.isFreePreview) {
      return successResponse(res, 200, 'Lesson retrieved', { lesson });
    }

    // Otherwise check authentication and authorization
    if (!req.user) {
      return next(new AppError('Authentication required to access this lesson', 401));
    }

    // Check if user is instructor of this course or admin
    const isAuthorizedStaff =
      req.user.role === 'admin' ||
      (course && course.instructor.toString() === req.user.id);

    if (!isAuthorizedStaff) {
      // Must have active enrollment
      const enrollment = await Enrollment.findOne({
        studentId: req.user.id,
        courseId: lesson.courseId,
        status: { $ne: 'dropped' }
      });

      if (!enrollment) {
        return next(new AppError('You must be enrolled in this course to view this lesson', 403));
      }
    }

    return successResponse(res, 200, 'Lesson retrieved successfully', { lesson });
  } catch (error) {
    next(error);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const mod = await Module.findById(moduleId);

    if (!mod) {
      return next(new AppError('Module not found', 404));
    }

    const course = await Course.findById(mod.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to add lessons to this course', 403));
    }

    const existingCount = await Lesson.countDocuments({ moduleId });
    const order = req.body.order !== undefined ? req.body.order : existingCount + 1;

    const lesson = await Lesson.create({
      ...req.body,
      moduleId,
      courseId: mod.courseId,
      order
    });

    return successResponse(res, 201, 'Lesson created successfully', { lesson });
  } catch (error) {
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    const course = await Course.findById(lesson.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to update this lesson', 403));
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return successResponse(res, 200, 'Lesson updated successfully', { lesson: updatedLesson });
  } catch (error) {
    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    const course = await Course.findById(lesson.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to delete this lesson', 403));
    }

    await Lesson.findByIdAndDelete(id);
    return successResponse(res, 200, 'Lesson deleted successfully');
  } catch (error) {
    next(error);
  }
};

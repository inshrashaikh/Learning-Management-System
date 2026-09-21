const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');

exports.getModulesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const modules = await Module.find({ courseId }).sort({ order: 1 }).lean();
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id }).sort({ order: 1 }).lean();
        return { ...mod, lessons };
      })
    );

    return successResponse(res, 200, 'Modules retrieved', modulesWithLessons);
  } catch (error) {
    next(error);
  }
};

exports.createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to add modules to this course', 403));
    }

    // Determine default order
    const existingCount = await Module.countDocuments({ courseId });
    const order = req.body.order !== undefined ? req.body.order : existingCount + 1;

    const newModule = await Module.create({
      ...req.body,
      courseId,
      order
    });

    return successResponse(res, 201, 'Module created successfully', { module: newModule });
  } catch (error) {
    next(error);
  }
};

exports.updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mod = await Module.findById(id);

    if (!mod) {
      return next(new AppError('Module not found', 404));
    }

    const course = await Course.findById(mod.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to update this module', 403));
    }

    const updatedModule = await Module.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return successResponse(res, 200, 'Module updated successfully', { module: updatedModule });
  } catch (error) {
    next(error);
  }
};

exports.deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mod = await Module.findById(id);

    if (!mod) {
      return next(new AppError('Module not found', 404));
    }

    const course = await Course.findById(mod.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to delete this module', 403));
    }

    await Promise.all([
      Module.findByIdAndDelete(id),
      Lesson.deleteMany({ moduleId: id })
    ]);

    return successResponse(res, 200, 'Module and child lessons deleted successfully');
  } catch (error) {
    next(error);
  }
};

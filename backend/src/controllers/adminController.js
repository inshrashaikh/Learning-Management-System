const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const QuizAttempt = require('../models/QuizAttempt');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');

exports.getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalSubmissions,
      totalQuizAttempts,
      recentUsers,
      recentEnrollments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Enrollment.countDocuments(),
      Submission.countDocuments(),
      QuizAttempt.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt isActive'),
      Enrollment.find()
        .populate('studentId', 'name email avatar')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    return successResponse(res, 200, 'Platform analytics retrieved', {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalSubmissions,
      totalQuizAttempts,
      recentUsers,
      recentEnrollments
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
      User.countDocuments(query)
    ]);

    return successResponse(res, 200, 'Users retrieved', users, {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parsedLimit),
      limit: parsedLimit
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return next(new AppError('You cannot deactivate your own admin account', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(
      res,
      200,
      `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      { user }
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllCourses = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Course.countDocuments(query)
    ]);

    const enriched = await Promise.all(
      courses.map(async (c) => {
        const studentCount = await Enrollment.countDocuments({ courseId: c._id });
        return { ...c, studentCount };
      })
    );

    return successResponse(res, 200, 'Courses retrieved', enriched, {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parsedLimit),
      limit: parsedLimit
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleFeaturedCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    course.isFeatured = !course.isFeatured;
    await course.save();

    return successResponse(
      res,
      200,
      `Course ${course.isFeatured ? 'marked as featured' : 'unmarked from featured'}`,
      { course }
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [enrollments, total] = await Promise.all([
      Enrollment.find()
        .populate('studentId', 'name email avatar')
        .populate('courseId', 'title category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Enrollment.countDocuments()
    ]);

    return successResponse(res, 200, 'Enrollments retrieved', enrollments, {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parsedLimit),
      limit: parsedLimit
    });
  } catch (error) {
    next(error);
  }
};

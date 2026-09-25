const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');

exports.getCourses = async (req, res, next) => {
  try {
    const { search, category, difficulty, sort, page = 1, limit = 12 } = req.query;

    const query = { status: 'published' };

    // Search by title or description
    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty.toLowerCase();
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') sortOptions = { enrollmentsCount: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'title') sortOptions = { title: 1 };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email avatar headline')
        .sort(sortOptions)
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Course.countDocuments(query)
    ]);

    // Enhance courses with module and lesson counts
    const enhancedCourses = await Promise.all(
      courses.map(async (course) => {
        const [moduleCount, lessonCount, enrollmentCount] = await Promise.all([
          Module.countDocuments({ courseId: course._id }),
          Lesson.countDocuments({ courseId: course._id }),
          Enrollment.countDocuments({ courseId: course._id, status: 'active' })
        ]);
        return {
          ...course,
          moduleCount,
          lessonCount,
          enrollmentCount
        };
      })
    );

    return successResponse(res, 200, 'Courses retrieved successfully', enhancedCourses, {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parsedLimit),
      limit: parsedLimit
    });
  } catch (error) {
    next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructor', 'name email avatar headline bio')
      .lean();

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Get curriculum: modules with their lessons
    const modules = await Module.find({ courseId: id }).sort({ order: 1 }).lean();
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id })
          .select('title durationMinutes order isFreePreview')
          .sort({ order: 1 })
          .lean();
        return { ...mod, lessons };
      })
    );

    // Total counts
    const totalLessons = modulesWithLessons.reduce((acc, m) => acc + m.lessons.length, 0);
    const totalEnrollments = await Enrollment.countDocuments({ courseId: id, status: 'active' });

    // Check if current user is enrolled
    let isEnrolled = false;
    let studentProgress = null;
    if (req.user) {
      const enrollment = await Enrollment.findOne({ studentId: req.user.id, courseId: id });
      isEnrolled = !!enrollment;
    }

    return successResponse(res, 200, 'Course details retrieved', {
      course: {
        ...course,
        modules: modulesWithLessons,
        totalLessons,
        totalEnrollments,
        isEnrolled
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user.id
    };

    const course = await Course.create(courseData);
    return successResponse(res, 201, 'Course created successfully', { course });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    let course = await Course.findById(id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Verify ownership or admin role
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to update this course', 403));
    }

    course = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return successResponse(res, 200, 'Course updated successfully', { course });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to delete this course', 403));
    }

    // Cascade delete associated modules and lessons
    await Promise.all([
      Course.findByIdAndDelete(id),
      Module.deleteMany({ courseId: id }),
      Lesson.deleteMany({ courseId: id }),
      Enrollment.deleteMany({ courseId: id })
    ]);

    return successResponse(res, 200, 'Course and associated curriculum deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.publishCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to modify course status', 403));
    }

    course.status = course.status === 'published' ? 'draft' : 'published';
    await course.save();

    return successResponse(res, 200, `Course status changed to ${course.status}`, { course });
  } catch (error) {
    next(error);
  }
};

exports.getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).sort({ createdAt: -1 }).lean();

    const enhanced = await Promise.all(
      courses.map(async (c) => {
        const [moduleCount, lessonCount, studentCount, assignmentCount, quizCount, enrollments] =
          await Promise.all([
            Module.countDocuments({ courseId: c._id }),
            Lesson.countDocuments({ courseId: c._id }),
            Enrollment.countDocuments({ courseId: c._id, status: { $ne: 'dropped' } }),
            Assignment.countDocuments({ courseId: c._id }),
            Quiz.countDocuments({ courseId: c._id }),
            Enrollment.find({ courseId: c._id, status: { $ne: 'dropped' } })
              .populate('studentId', 'name email avatar headline createdAt')
              .sort({ createdAt: -1 })
              .lean()
          ]);

        const validEnrollments = enrollments.filter((enr) => enr.studentId);
        const enrolledStudents = await Promise.all(
          validEnrollments.map(async (enr) => {
            const prog = await Progress.findOne({
              studentId: enr.studentId._id,
              courseId: c._id
            }).lean();

            return {
              _id: enr.studentId._id,
              enrollmentId: enr._id,
              name: enr.studentId.name,
              email: enr.studentId.email,
              avatar: enr.studentId.avatar,
              headline: enr.studentId.headline,
              enrolledAt: enr.enrolledAt || enr.createdAt,
              status: enr.status,
              progress: prog ? prog.percentage : 0,
              rollNumber: `STU-${String(enr.studentId._id).slice(-4).toUpperCase()}`
            };
          })
        );

        return {
          ...c,
          courseCode: `CRS-${String(c._id).slice(-4).toUpperCase()}`,
          moduleCount,
          lessonCount,
          studentCount,
          assignmentCount,
          quizCount,
          enrolledStudents
        };
      })
    );

    return successResponse(res, 200, 'Instructor courses retrieved', enhanced);
  } catch (error) {
    next(error);
  }
};

const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const QuizAttempt = require('../models/QuizAttempt');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { recalculateCourseProgress } = require('../services/progressService');

exports.getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) {
      // Create if enrolled
      const enrollment = await Enrollment.findOne({ studentId, courseId });
      if (enrollment) {
        progress = await Progress.create({
          studentId,
          courseId,
          completedLessons: [],
          percentage: 0
        });
      }
    }

    const totalLessons = await Lesson.countDocuments({ courseId });

    return successResponse(res, 200, 'Progress retrieved', {
      progress: progress || { percentage: 0, completedLessons: [] },
      totalLessons
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleLessonProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({ studentId, courseId, status: { $ne: 'dropped' } });
    if (!enrollment) {
      return next(new AppError('You must be enrolled in this course to track progress', 403));
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.courseId.toString() !== courseId) {
      return next(new AppError('Lesson does not belong to this course', 400));
    }

    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) {
      progress = await Progress.create({
        studentId,
        courseId,
        completedLessons: [],
        percentage: 0
      });
    }

    const existingIndex = progress.completedLessons.findIndex(
      (item) => item.lessonId.toString() === lessonId
    );

    let isMarkedCompleted = false;
    if (existingIndex > -1) {
      // Toggle off (unmark)
      progress.completedLessons.splice(existingIndex, 1);
      isMarkedCompleted = false;
    } else {
      // Mark as completed
      progress.completedLessons.push({ lessonId, completedAt: new Date() });
      progress.lastAccessedLesson = lessonId;
      isMarkedCompleted = true;
    }

    await progress.save();

    // Recalculate dynamic progress percentage
    const stats = await recalculateCourseProgress(studentId, courseId);

    return successResponse(res, 200, isMarkedCompleted ? 'Lesson marked as completed' : 'Lesson marked as incomplete', {
      progress: stats.progress,
      isCompleted: isMarkedCompleted,
      percentage: stats.percentage,
      totalLessons: stats.totalLessons,
      completedCount: stats.completedCount
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentOverallAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Active and completed enrollments
    const enrollments = await Enrollment.find({ studentId, status: { $ne: 'dropped' } })
      .populate('courseId', 'title thumbnail category difficulty')
      .lean();

    const courseIds = enrollments.map((e) => e.courseId?._id).filter(Boolean);

    // Progress across courses
    const progressList = await Progress.find({ studentId, courseId: { $in: courseIds } }).lean();

    let totalLessonsCompleted = 0;
    let sumPercentage = 0;

    progressList.forEach((p) => {
      totalLessonsCompleted += (p.completedLessons || []).length;
      sumPercentage += p.percentage || 0;
    });

    const averageProgress =
      progressList.length > 0 ? Math.round(sumPercentage / progressList.length) : 0;

    // Assignment submissions
    const submissions = await Submission.find({ studentId })
      .populate('assignmentId', 'title maxMarks dueDate')
      .sort({ createdAt: -1 })
      .lean();

    const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
    const totalAssignmentsDone = submissions.length;

    // Quiz attempts
    const quizAttempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title passingScore')
      .sort({ submittedAt: -1 })
      .lean();

    const passedQuizzes = quizAttempts.filter((q) => q.passed).length;

    return successResponse(res, 200, 'Student overall analytics retrieved', {
      enrolledCoursesCount: enrollments.length,
      averageProgress,
      totalLessonsCompleted,
      totalAssignmentsDone,
      gradedAssignmentsCount: gradedSubmissions.length,
      totalQuizAttempts: quizAttempts.length,
      passedQuizzesCount: passedQuizzes,
      courseProgressDetails: enrollments.map((e) => {
        const prog = progressList.find((p) => p.courseId.toString() === e.courseId?._id.toString());
        return {
          course: e.courseId,
          percentage: prog ? prog.percentage : 0,
          completedLessonsCount: prog ? prog.completedLessons.length : 0,
          isCompleted: prog ? prog.isCompleted : false
        };
      })
    });
  } catch (error) {
    next(error);
  }
};

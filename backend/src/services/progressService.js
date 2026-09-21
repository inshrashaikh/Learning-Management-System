const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');

/**
 * Dynamically calculate and update a student's course progress
 */
const recalculateCourseProgress = async (studentId, courseId) => {
  // 1) Total lessons in the course
  const totalLessons = await Lesson.countDocuments({ courseId });

  // 2) Find or create Progress document
  let progress = await Progress.findOne({ studentId, courseId });
  if (!progress) {
    progress = await Progress.create({
      studentId,
      courseId,
      completedLessons: [],
      percentage: 0
    });
  }

  // 3) Calculate percentage dynamically
  const completedCount = progress.completedLessons.length;
  const percentage = totalLessons === 0 ? 0 : Math.min(100, Math.round((completedCount / totalLessons) * 100));

  progress.percentage = percentage;
  const isCompleted = totalLessons > 0 && completedCount >= totalLessons;
  progress.isCompleted = isCompleted;

  if (isCompleted && !progress.completedAt) {
    progress.completedAt = new Date();
    // Also update enrollment status if completed
    await Enrollment.findOneAndUpdate(
      { studentId, courseId },
      { status: 'completed', completedAt: new Date() }
    );
  }

  await progress.save();
  return { progress, totalLessons, completedCount, percentage };
};

module.exports = {
  recalculateCourseProgress
};

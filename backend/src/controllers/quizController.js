const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { createNotification } = require('../services/notificationService');

exports.getQuizzesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.find({ courseId, status: 'published' })
      .sort({ createdAt: 1 })
      .lean();

    let results = quizzes;
    if (req.user && req.user.role === 'student') {
      results = await Promise.all(
        quizzes.map(async (quiz) => {
          const attempt = await QuizAttempt.findOne({
            quizId: quiz._id,
            studentId: req.user.id
          })
            .sort({ submittedAt: -1 })
            .lean();

          const questionCount = await Question.countDocuments({ quizId: quiz._id });

          return {
            ...quiz,
            questionCount,
            latestAttempt: attempt || null,
            hasAttempted: !!attempt
          };
        })
      );
    }

    return successResponse(res, 200, 'Quizzes retrieved', results);
  } catch (error) {
    next(error);
  }
};

exports.getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id).populate('courseId', 'title instructor');
    if (!quiz) {
      return next(new AppError('Quiz not found', 404));
    }

    const isStaff =
      req.user &&
      (req.user.role === 'admin' ||
        (quiz.courseId && quiz.courseId.instructor.toString() === req.user.id));

    let questions;
    if (isStaff) {
      // Instructors see complete questions with answers and explanations
      questions = await Question.find({ quizId: id }).sort({ order: 1 }).lean();
    } else {
      // Students never see correct answers or explanations before submitting
      questions = await Question.find({ quizId: id })
        .select('-correctAnswerIndex -explanation')
        .sort({ order: 1 })
        .lean();
    }

    let previousAttempt = null;
    if (req.user && req.user.role === 'student') {
      previousAttempt = await QuizAttempt.findOne({
        quizId: id,
        studentId: req.user.id
      })
        .sort({ submittedAt: -1 })
        .lean();
    }

    return successResponse(res, 200, 'Quiz retrieved', {
      quiz,
      questions,
      previousAttempt
    });
  } catch (error) {
    next(error);
  }
};

exports.createQuiz = async (req, res, next) => {
  try {
    const { courseId, title, description, durationMinutes, passingScore, moduleId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to create quizzes in this course', 403));
    }

    const quiz = await Quiz.create({
      courseId,
      moduleId,
      instructorId: req.user.id,
      title,
      description,
      durationMinutes: durationMinutes || 15,
      passingScore: passingScore || 60,
      totalMarks: 0
    });

    return successResponse(res, 201, 'Quiz created successfully', { quiz });
  } catch (error) {
    next(error);
  }
};

exports.updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return next(new AppError('Quiz not found', 404));
    }

    if (quiz.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to update this quiz', 403));
    }

    const updated = await Quiz.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return successResponse(res, 200, 'Quiz updated successfully', { quiz: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return next(new AppError('Quiz not found', 404));
    }

    if (quiz.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to delete this quiz', 403));
    }

    await Promise.all([
      Quiz.findByIdAndDelete(id),
      Question.deleteMany({ quizId: id }),
      QuizAttempt.deleteMany({ quizId: id })
    ]);

    return successResponse(res, 200, 'Quiz and associated questions deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.addQuestion = async (req, res, next) => {
  try {
    const { id: quizId } = req.params;
    const { questionText, options, correctAnswerIndex, explanation, marks, order } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return next(new AppError('Quiz not found', 404));
    }

    if (quiz.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to add questions to this quiz', 403));
    }

    const existingCount = await Question.countDocuments({ quizId });
    const questionOrder = order !== undefined ? order : existingCount + 1;
    const questionMarks = marks || 1;

    const question = await Question.create({
      quizId,
      questionText,
      options,
      correctAnswerIndex,
      explanation: explanation || '',
      marks: questionMarks,
      order: questionOrder
    });

    // Update total marks on quiz
    quiz.totalMarks = (quiz.totalMarks || 0) + questionMarks;
    await quiz.save();

    return successResponse(res, 201, 'Question added successfully', { question });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    const quiz = await Quiz.findById(question.quizId);
    if (quiz && quiz.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized to delete this question', 403));
    }

    if (quiz) {
      quiz.totalMarks = Math.max(0, (quiz.totalMarks || 0) - question.marks);
      await quiz.save();
    }

    await Question.findByIdAndDelete(questionId);
    return successResponse(res, 200, 'Question deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.attemptQuiz = async (req, res, next) => {
  try {
    const { id: quizId } = req.params;
    const { answers } = req.body; // array of { questionId, selectedOptionIndex }
    const studentId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return next(new AppError('Quiz not found', 404));
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: quiz.courseId,
      status: { $ne: 'dropped' }
    });

    if (!enrollment) {
      return next(new AppError('You must be enrolled in this course to take this quiz', 403));
    }

    // Fetch all questions for this quiz including correct answers
    const questions = await Question.find({ quizId }).sort({ order: 1 });
    if (questions.length === 0) {
      return next(new AppError('This quiz does not have any questions yet', 400));
    }

    let calculatedScore = 0;
    let totalPossibleMarks = 0;
    const evaluatedAnswers = [];

    const answerMap = new Map();
    (answers || []).forEach((a) => {
      answerMap.set(a.questionId.toString(), a.selectedOptionIndex);
    });

    questions.forEach((q) => {
      const qIdStr = q._id.toString();
      const selectedIndex = answerMap.has(qIdStr) ? answerMap.get(qIdStr) : null;
      const isCorrect = selectedIndex !== null && selectedIndex === q.correctAnswerIndex;
      const marksAwarded = isCorrect ? q.marks : 0;

      calculatedScore += marksAwarded;
      totalPossibleMarks += q.marks;

      evaluatedAnswers.push({
        questionId: q._id,
        selectedOptionIndex: selectedIndex,
        isCorrect,
        marksAwarded
      });
    });

    const percentage = totalPossibleMarks > 0
      ? Math.round((calculatedScore / totalPossibleMarks) * 100)
      : 0;

    const passed = percentage >= (quiz.passingScore || 60);

    const attempt = await QuizAttempt.create({
      quizId,
      studentId,
      courseId: quiz.courseId,
      answers: evaluatedAnswers,
      score: calculatedScore,
      totalMarks: totalPossibleMarks,
      percentage,
      passed,
      submittedAt: new Date()
    });

    return successResponse(res, 201, 'Quiz evaluated successfully', {
      attemptId: attempt._id,
      score: calculatedScore,
      totalMarks: totalPossibleMarks,
      percentage,
      passed,
      passingScore: quiz.passingScore
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuizAttemptResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attempt = await QuizAttempt.findById(id)
      .populate('quizId', 'title description passingScore')
      .populate('courseId', 'title')
      .lean();

    if (!attempt) {
      return next(new AppError('Quiz attempt not found', 404));
    }

    // Only owner of attempt, course instructor, or admin can view
    const isOwner = attempt.studentId.toString() === req.user.id;
    const isStaff = req.user.role === 'admin' || req.user.role === 'instructor';

    if (!isOwner && !isStaff) {
      return next(new AppError('Unauthorized to view this attempt result', 403));
    }

    // Load questions with full details for review
    const questions = await Question.find({ quizId: attempt.quizId._id })
      .sort({ order: 1 })
      .lean();

    const questionsWithResults = questions.map((q) => {
      const studentAns = (attempt.answers || []).find(
        (a) => a.questionId.toString() === q._id.toString()
      );

      return {
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        marks: q.marks,
        selectedOptionIndex: studentAns ? studentAns.selectedOptionIndex : null,
        isCorrect: studentAns ? studentAns.isCorrect : false,
        marksAwarded: studentAns ? studentAns.marksAwarded : 0
      };
    });

    return successResponse(res, 200, 'Quiz attempt result retrieved', {
      attempt: {
        ...attempt,
        questions: questionsWithResults
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentResults = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Submissions
    const submissions = await Submission.find({ studentId })
      .populate({
        path: 'assignmentId',
        select: 'title maxMarks dueDate courseId',
        populate: {
          path: 'courseId',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Quiz attempts
    const quizAttempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title passingScore')
      .populate('courseId', 'title')
      .sort({ submittedAt: -1 })
      .lean();

    return successResponse(res, 200, 'Student results retrieved', {
      assignments: submissions,
      quizzes: quizAttempts
    });
  } catch (error) {
    next(error);
  }
};

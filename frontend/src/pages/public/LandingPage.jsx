import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  CheckCircle2,
  BarChart3,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  FileCheck,
  HelpCircle,
  ChevronDown,
  Layers,
  ShieldCheck,
  Clock,
  PlayCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';

const LandingPage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/courses?limit=3');
        if (response.data) {
          setFeaturedCourses(response.data);
        }
      } catch (e) {
        // Fallback or empty state handled gracefully
      }
    };
    fetchFeatured();
  }, []);

  const stats = [
    { label: 'Active Curriculums', value: '45+', icon: BookOpen },
    { label: 'Enrolled Learners', value: '1,200+', icon: Users },
    { label: 'Submissions Graded', value: '98.6%', icon: FileCheck },
    { label: 'Learner Satisfaction', value: '4.9 / 5', icon: Award }
  ];

  const features = [
    {
      title: 'Interactive Modular Curriculum',
      description:
        'Structured modules with rich markdown lessons, video lectures, and attached downloadable resources.',
      icon: Layers,
      color: 'bg-indigo-50 text-brand-600'
    },
    {
      title: 'Dynamic Progress Engine',
      description:
        'Real-time percentage recalculation as you complete lessons, visually mapped across your learning dashboards.',
      icon: BarChart3,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Automated MCQ Quizzes',
      description:
        'Server-evaluated multiple choice assessments with time limits, instantaneous feedback, and gradebook integration.',
      icon: CheckCircle2,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: 'Assignment Grading Workflows',
      description:
        'Submit projects with due-date tracking, late submission detection, and in-depth qualitative instructor evaluations.',
      icon: Award,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Three-Tier Role Authorization',
      description:
        'Dedicated secure portals for Students, Instructors, and System Administrators with strict backend enforcement.',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Actionable Analytics & Reports',
      description:
        'Holistic grade reports, course completion metrics, and activity logs powered by real database records.',
      icon: Sparkles,
      color: 'bg-rose-50 text-rose-600'
    }
  ];

  const faqs = [
    {
      q: 'How does LearnSphere dynamically calculate student progress?',
      a: 'Unlike basic systems that store hardcoded percentages, LearnSphere queries total lessons within a course and computes dynamic completion percentages (completed lessons ÷ total lessons × 100) whenever you toggle a lesson milestone.'
    },
    {
      q: 'What roles does LearnSphere support out of the box?',
      a: 'LearnSphere has 3 distinct roles: Student (browsing, enrolling, learning, submitting, quiz attempts), Instructor (curriculum design, lesson authoring, submissions grading), and Admin (platform oversight, user status governance, course curation).'
    },
    {
      q: 'Are quiz answers exposed in the browser?',
      a: 'No. The backend API strips correct answers and explanations when students fetch an active quiz. Scoring and evaluation are computed strictly server-side upon attempt submission.'
    },
    {
      q: 'Can students submit assignments after the due date?',
      a: 'Yes, LearnSphere permits submissions after the scheduled deadline but automatically flags the entry as "Late Submission" so instructors can grade accordingly.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        {/* Subtle decorative background blur shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200 shadow-subtle text-xs font-semibold text-brand-700">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Next-Generation Academic LMS Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Learn Smarter. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600">
                  Track Your Progress.
                </span>{' '}
                <br />
                Achieve More.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                LearnSphere centralizes comprehensive courses, interactive lesson modules, assignment
                grading, automated MCQ quizzes, and actionable academic progress in a sleek educational SaaS environment.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full" icon={BookOpen}>
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full" icon={ArrowRight} iconPosition="right">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Demo Credentials Quick Pill */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Quick Demo Accounts:</span>
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">student@learnsphere.com</span>
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">instructor@learnsphere.com</span>
              </div>
            </div>

            {/* Right Rich Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Glassmorphic Dashboard Showcase */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl p-6 relative z-10 space-y-6">
                  {/* Top Dashboard Header Mock */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                        JT
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Jordan Taylor</div>
                        <div className="text-xs text-slate-400">Student • Computer Science</div>
                      </div>
                    </div>
                    <Badge variant="emerald">Enrolled & Active</Badge>
                  </div>

                  {/* Active Course Card Mock */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-800 text-white shadow-lg space-y-3">
                    <div className="flex items-center justify-between text-xs text-brand-200 font-medium">
                      <span>Course in Progress</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 8 Weeks
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      Full-Stack Web Engineering with React & Node.js
                    </h4>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-brand-200 mb-1">
                        <span>Curriculum Progress</span>
                        <span>40%</span>
                      </div>
                      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full w-[40%]" />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Metrics Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs font-medium text-slate-500">Upcoming Due Date</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">Assignment 1</div>
                      <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Due in 5 days</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs font-medium text-slate-500">Latest Quiz Score</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">100% (3/3)</div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Passed • Graded</div>
                    </div>
                  </div>

                  {/* Lesson Preview Mock item */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-800">2.1 Custom React Hooks</div>
                        <div className="text-slate-400">Next Lesson • 25 Mins</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand-600">Resume</span>
                  </div>
                </div>

                {/* Ambient glow under card */}
                <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle text-center space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="indigo">Architecture & Capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Comprehensive Academic Learning
          </h2>
          <p className="text-slate-600 text-base">
            Every layer of LearnSphere is structured with software engineering best practices: modular MVC services,
            strict role isolation, and real-time data persistence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} hover className="h-full">
                <CardBody className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center shadow-subtle`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. HOW LEARMSPHERE WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="emerald">Structured Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How LearnSphere Works
          </h2>
          <p className="text-slate-600 text-base">
            Three simple milestones take learners from curriculum discovery to rigorous academic achievement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Discover & Enroll</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore specialized curriculums, review syllabi, check prerequisite skills, and enroll with a single click.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Study & Track Lessons</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Engage with rich technical lessons, download supplementary resources, and mark milestones to advance dynamic progress meters.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Submit & Certify</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Attempt automated MCQ quizzes, submit assignments for instructor grading, and review qualitative feedback in your gradebook.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FEATURED COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <Badge variant="indigo" className="mb-2">Curriculum Spotlight</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Courses</h2>
          </div>
          <Link to="/courses">
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              View All Courses
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <Card key={course._id} hover className="flex flex-col h-full">
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="indigo">{course.category}</Badge>
                  </div>
                </div>
                <CardBody className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="capitalize">{course.difficulty}</span>
                      <span>•</span>
                      <span>{course.estimatedDuration}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {course.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {course.moduleCount || 0} Modules • {course.lessonCount || 0} Lessons
                    </div>
                    <Link to={`/courses/${course._id}`}>
                      <Button variant="primary" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-slate-500 text-sm">
              Loading featured curriculums...
            </div>
          )}
        </div>
      </section>

      {/* 6. LEARNING PROGRESS & ANALYTICS SHOWCASE */}
      <section className="bg-slate-900 text-white rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 py-16 overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="emerald">Live Academic Analytics</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real-Time Academic Performance Visualized
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Say goodbye to black-box grading. Students monitor exact assignment feedback, late penalty status,
              and module completion ratios. Instructors access batch grading queues and enrolled cohort statistics.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-200">Continuous progress updates without page refreshes</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-200">Server-validated quiz attempt score breakdowns</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-200">Structured instructor qualitative evaluations</span>
              </div>
            </div>
            <div className="pt-4">
              <Link to="/courses">
                <Button variant="primary" size="md">
                  Explore Curriculums Now
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span className="text-sm font-semibold text-slate-300">Gradebook Snapshot</span>
              <Badge variant="indigo">Verified Results</Badge>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-900/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Assignment 1: REST API Design</div>
                  <div className="text-xs text-slate-400">Feedback: Outstanding index choices.</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-400">94 / 100</div>
                  <div className="text-[10px] text-slate-400">Grade: A</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Quiz 1: Web Architecture</div>
                  <div className="text-xs text-slate-400">Automated MCQ Scoring</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-400">100%</div>
                  <div className="text-[10px] text-emerald-500 font-semibold">Passed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY LEARMSPHERE */}
      <section id="why-learnsphere" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="indigo">Institutional Standards</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose LearnSphere?
          </h2>
          <p className="text-slate-600 text-base">
            Built as a Software Engineering Capstone, prioritizing clean architecture over superficial shortcuts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Security-First Auth</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              HttpOnly cookies prevent XSS credential theft. Role-based middleware intercepts unauthorized attempts
              on every private endpoint.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Scalable Schema Design</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mongoose models with compound unique indexes guarantee integrity across enrollments, submissions,
              and question orders.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Automated Verification</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comprehensive Jest & Supertest integration suites validate authorization, dynamic progress percentages,
              and server-side quiz calculation.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="slate">Questions & Answers</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 hover:text-brand-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    openFaq === idx ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-12 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 text-white text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience Modern Online Education?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-base">
            Join LearnSphere today to study comprehensive modules, take automated quizzes, and level up your skills.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button variant="white" size="lg">
                Create Free Account
              </Button>
            </Link>
            <Link to="/courses">
              <Button
                variant="outline-white"
                size="lg"
              >
                Browse Curriculums
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

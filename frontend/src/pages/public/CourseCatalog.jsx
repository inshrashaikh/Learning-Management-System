import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Search, Filter, BookOpen, Clock, Users, ChevronRight, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CourseCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialDifficulty = searchParams.get('difficulty') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [sort, setSort] = useState(initialSort);

  const categories = [
    'All',
    'Web Development',
    'Software Architecture',
    'Cybersecurity',
    'Cloud Computing',
    'Artificial Intelligence'
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (category !== 'All') queryParams.append('category', category);
        if (difficulty !== 'All') queryParams.append('difficulty', difficulty.toLowerCase());
        if (sort) queryParams.append('sort', sort);

        const response = await api.get(`/courses?${queryParams.toString()}`);
        setCourses(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, category, difficulty, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setDifficulty('All');
    setSort('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="indigo">Course Catalog</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Curriculums & Specializations
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Browse comprehensive courses taught by industry leaders and distinguished faculty. Filter by domain,
          experience level, and popularity.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course title or keyword..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <div className="md:col-span-3">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white font-medium text-slate-800"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  Level: {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white font-medium text-slate-800"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="popular">Sort: Most Enrolled</option>
              <option value="title">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-brand-600 text-white shadow-sm border border-brand-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
          {(searchTerm || category !== 'All' || difficulty !== 'All') && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 font-bold hover:text-rose-700 hover:underline ml-auto flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Loading course catalog..." />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-center">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="We couldn't find any courses matching your search and filter criteria. Try adjusting your search query."
          actionLabel="Reset Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course._id} hover className="flex flex-col h-full">
              {/* Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="indigo">{course.category}</Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900/80 text-white backdrop-blur-sm capitalize">
                    {course.difficulty}
                  </span>
                </div>
              </div>

              {/* Body */}
              <CardBody className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {course.shortDescription}
                  </p>
                </div>

                {/* Instructor & Meta */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        course.instructor?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                      }
                      alt={course.instructor?.name || 'Instructor'}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800">{course.instructor?.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {course.instructor?.headline || 'Instructor'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {course.moduleCount || 0} Modules • {course.lessonCount || 0} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.estimatedDuration}
                    </span>
                  </div>

                  <Link to={`/courses/${course._id}`} className="block pt-1">
                    <Button variant="primary" size="sm" className="w-full" icon={ChevronRight} iconPosition="right">
                      View Curriculum Details
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;

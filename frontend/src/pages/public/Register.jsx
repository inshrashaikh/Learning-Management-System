import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, Mail, Lock, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register({ name, email, password, role });
      toast.success(`Welcome to LearnSphere, ${newUser.name}!`);

      if (newUser.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Learn<span className="text-brand-600">Sphere</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Your LearnSphere Account
        </h2>
        <p className="text-xs text-slate-500">
          Join thousands of learners and instructors advancing engineering excellence.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/90 sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-semibold text-rose-800 animate-shake">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registering As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === 'student'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Learner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === 'instructor'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Instructor / Faculty</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Taylor"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

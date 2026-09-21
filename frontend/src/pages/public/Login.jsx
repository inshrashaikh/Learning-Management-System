import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      toast.success(`Welcome back, ${loggedInUser.name}!`);

      if (redirect) {
        navigate(redirect);
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
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
          Sign In to Your Portal
        </h2>
        <p className="text-xs text-slate-500">
          Enter your credentials to access your courses, submissions, and dashboards.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Demo Quick-Fill Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Academic Evaluator One-Click Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('student@learnsphere.com', 'Password123!')}
              className="py-1.5 px-2 bg-white rounded-lg border border-indigo-200 text-xs font-semibold text-slate-700 hover:bg-brand-600 hover:text-white transition-colors"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('instructor@learnsphere.com', 'Password123!')}
              className="py-1.5 px-2 bg-white rounded-lg border border-indigo-200 text-xs font-semibold text-slate-700 hover:bg-brand-600 hover:text-white transition-colors"
            >
              👨‍🏫 Instructor
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('admin@learnsphere.com', 'Password123!')}
              className="py-1.5 px-2 bg-white rounded-lg border border-indigo-200 text-xs font-semibold text-slate-700 hover:bg-brand-600 hover:text-white transition-colors"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80 sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 animate-shake">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
              Sign In
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StudyBoxPhysicsBackground } from '../components/StudyBoxPhysicsBackground';
import { ArithmeticBackground } from '../components/ArithmeticBackground';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) return setError('Email is required.');
    if (!password) return setError('Password is required.');

    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fbfbf0] p-4 font-sans text-neutral-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Subtle White Arithmetic Background Layer */}
      <ArithmeticBackground />

      {/* Interactive Physics Background */}
      <StudyBoxPhysicsBackground />

      {/* Main Login Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center pointer-events-auto">
        
        {/* Title */}
        <h1 
          className="mb-6 text-center text-6xl font-bold text-[#010057] dark:text-blue-100 md:text-7xl"
          style={{ fontFamily: "'Momo Signature', cursive" }}
        >
          StudySync
        </h1>

        {/* Login Card Layer */}
        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl transition-colors dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">Welcome back</h2>
            <p className="text-neutral-600 text-sm">Log in to your account to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="student@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-neutral-700">Password</label>
              <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-neutral-800 transition-colors duration-200 disabled:bg-neutral-400 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-600 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-neutral-900 font-semibold hover:text-indigo-600 transition-colors">
            Create account
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

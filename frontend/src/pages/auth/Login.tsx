import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/');
    } catch {
      // error sudah ditangani di context, tidak perlu toast lagi dan tidak perlu redirect
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-black rounded-lg shadow-lg">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center mb-4 text-white hover:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="text-center">
          <div className="flex justify-center">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-white">Library Management System</h2>
          <p className="mt-2 text-sm text-gray-300">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email address
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full py-3 pl-10 border-gray-600 rounded-md bg-white text-black focus:ring-black focus:border-black sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full py-3 pl-10 pr-10 border-gray-600 rounded-md bg-white text-black focus:ring-black focus:border-black sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-black bg-white border border-gray-600 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-center text-gray-400">
          By signing up or logging in, you consent to <span className="font-semibold">"Kelompok Sembilan Esbedeh"</span> <a href="/terms-of-use.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-200">Terms of Use</a> and <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-200">Privacy Policy</a>.
        </div>

        <div className="mt-4 text-sm text-center">
          <p className="text-gray-200">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-black bg-white border border-gray-600 rounded px-2 py-1 hover:bg-gray-100 transition-colors"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
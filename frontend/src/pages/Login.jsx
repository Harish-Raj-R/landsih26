import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, User, Lock, ArrowRight, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Login = ({ initialMode = 'citizen' }) => {
  const { loginCitizen, loginStaff, user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state: 'citizen' or 'staff'
  const [mode, setMode] = useState(() => {
    if (location.pathname.includes('staff')) return 'staff';
    return initialMode;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode with pathname if navigated
  useEffect(() => {
    if (location.pathname.includes('staff')) {
      setMode('staff');
    } else if (location.pathname === '/login') {
      setMode('citizen');
    }
  }, [location.pathname]);

  // If already authenticated, redirect to respective dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (user.role === 'DEPARTMENT_SUPERVISOR') navigate('/supervisor', { replace: true });
      else if (user.role === 'FIELD_OFFICER') navigate('/field', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSwitchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError('');
    setEmail('');
    setPassword('');
    if (newMode === 'staff') {
      window.history.replaceState(null, '', '/staff/login');
    } else {
      window.history.replaceState(null, '', '/login');
    }
  };

  const handleQuickFill = (fillEmail, fillPass = 'Demo@123') => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(
        mode === 'citizen'
          ? 'Please enter both email and password.'
          : 'Please enter your official email and security credentials.'
      );
      return;
    }

    setLoading(true);
    try {
      let authUser;
      if (mode === 'citizen') {
        authUser = await loginCitizen(email.trim(), password);
      } else {
        authUser = await loginStaff(email.trim(), password);
      }

      const from = location.state?.from?.pathname;
      if (from && from !== '/' && !from.includes('/login')) {
        navigate(from, { replace: true });
      } else {
        if (authUser.role === 'ADMIN') navigate('/admin', { replace: true });
        else if (authUser.role === 'DEPARTMENT_SUPERVISOR') navigate('/supervisor', { replace: true });
        else if (authUser.role === 'FIELD_OFFICER') navigate('/field', { replace: true });
        else navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (mode === 'citizen'
            ? 'Authentication failed. Please verify your credentials.'
            : 'Official authentication failed. Access restricted to authorized personnel.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4.25rem)] max-h-[calc(100vh-4.25rem)] overflow-hidden flex flex-col justify-center items-center px-4 py-2 bg-slate-50 select-none">

      {/* Brand Header */}
      <div className="text-center mb-3 max-w-lg shrink-0">
        <div className="mx-auto w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-700/20 mb-1.5">
          <Layers className="w-5 h-5 text-blue-100" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">
          Land<span className="text-blue-700">Stack</span>
        </h1>
        <p className="text-xs font-semibold text-slate-600 mt-1">
          {t('brand_tagline') || 'Integrated GIS-Based Smart Land Governance Platform'}
        </p>
        <p className="text-[10px] text-slate-400 font-mono">
          One Parcel. One Identifier. One Unified View.
        </p>
      </div>

      {/* Unified Login Card with Two-Slider Toggle (Fits in 1 viewport without scroll) */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden shrink-0">

        {/* Dual Slider Switcher */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="relative bg-slate-200/80 p-1 rounded-2xl flex items-center border border-slate-200 shadow-inner">
            
            {/* Smooth Animated Sliding Indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-sm transition-all duration-300 ease-out border border-slate-200/80 ${
                mode === 'citizen' ? 'left-1' : 'left-[calc(50%+3px)]'
              }`}
            />

            {/* Citizen Option */}
            <button
              type="button"
              onClick={() => handleSwitchMode('citizen')}
              className={`relative z-10 w-1/2 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer ${
                mode === 'citizen' ? 'text-blue-700 font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>

            {/* Staff Option */}
            <button
              type="button"
              onClick={() => handleSwitchMode('staff')}
              className={`relative z-10 w-1/2 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer ${
                mode === 'staff' ? 'text-indigo-700 font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Government Staff</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3.5">

          {/* Form Context Header */}
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'citizen' ? 'Sign In to Your Account' : 'Sign In to Government Desk'}
            </h2>
            <p className="text-[11px] text-slate-500 leading-snug">
              {mode === 'citizen'
                ? 'Access your cadastral records, verified digital Patta, and track services.'
                : 'For Department Supervisors, Cadastral Field Officers, and Administrators.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-start gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                {mode === 'citizen' ? 'Citizen Email Address' : 'Official Department Email'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400"
                placeholder={mode === 'citizen' ? 'citizen@landstack.demo' : 'official@landstack.demo'}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                {mode === 'citizen' ? 'Password' : 'Security Password'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {mode === 'citizen' ? (
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Remember device</span>
                </label>
                <Link to="/register" className="font-semibold text-blue-700 hover:underline">
                  New registration
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-slate-600">
                  <Shield className="w-3 h-3 text-indigo-600" />
                  RBAC Enforced
                </span>
                <span className="font-mono text-slate-400 text-[10px]">Gov DPI Standards</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer ${
                mode === 'citizen'
                  ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-700/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>
                    {mode === 'citizen' ? 'Sign In to Citizen Portal' : 'Authenticate Official Session'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Autofill (Password: Demo@123)
            </p>
            {mode === 'citizen' ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => handleQuickFill('citizen@landstack.demo')}
                  className="px-2.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] rounded-lg font-mono border border-slate-200 transition"
                >
                  citizen@landstack.demo
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('supervisor@landstack.demo')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-[10px] rounded-md font-mono border border-slate-200 transition"
                >
                  Supervisor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('officer@landstack.demo')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-[10px] rounded-md font-mono border border-slate-200 transition"
                >
                  Field Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@landstack.demo')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-[10px] rounded-md font-mono border border-slate-200 transition"
                >
                  Admin
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;

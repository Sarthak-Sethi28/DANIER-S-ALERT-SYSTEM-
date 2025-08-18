import React, { useState } from 'react';
import { Package, Lock, User, LogIn, Crown, Shield } from 'lucide-react';
import { login as apiLogin, requestPasswordReset, confirmPasswordReset } from '../services/api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: request code, 2: confirm new password
  const [resetForm, setResetForm] = useState({ username: '', code: '', newPassword: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const session = await apiLogin(credentials.username, credentials.password);
      const sessionInfo = {
        username: session.username,
        loginTime: session.loginTime,
        sessionId: session.sessionId,
      };
      localStorage.setItem('danier_auth', JSON.stringify(sessionInfo));
      onLogin(sessionInfo);
    } catch (err) {
      setError(err?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (info) setInfo('');
  };

  const handleResetInputChange = (field, value) => {
    setResetForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (info) setInfo('');
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      if (!resetForm.username) {
        setError('Please enter your username');
        return;
      }
      await requestPasswordReset(resetForm.username);
      setInfo('If the user exists, a 6-digit code was sent to the active recipients and the registered email.');
      setResetStep(2);
    } catch (err) {
      setError(err?.message || 'Failed to request reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      if (!resetForm.username || !resetForm.code || !resetForm.newPassword || !resetForm.confirmPassword) {
        setError('Please complete all fields');
        return;
      }
      const res = await confirmPasswordReset(
        resetForm.username,
        resetForm.code,
        resetForm.newPassword,
        resetForm.confirmPassword
      );
      setInfo('Password updated. You can now sign in with your new password.');
      setResetMode(false);
      setResetStep(1);
      setCredentials({ username: resetForm.username, password: '' });
      setResetForm({ username: '', code: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-brand dark:bg-gradient-brand-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Elegant Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-accent rounded-xl shadow-luxury flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-danier-dark dark:text-white font-elegant">
            DANIER
          </h2>
          <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
            Inventory Intelligence System
          </p>
        </div>

        {!resetMode ? (
          <form className="space-y-6 animate-slide-up" onSubmit={handleSubmit}>
            <div className="card-elegant dark:card-elegant-dark p-6">
              <div className="space-y-4">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="pl-10 w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors duration-200"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="pl-10 w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors duration-200"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>
                </div>

                {/* Error/Info */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
                  </div>
                )}
                {info && !error && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                    <p className="text-emerald-800 dark:text-emerald-200 text-sm font-medium">{info}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-elegant flex items-center space-x-2 py-3 px-4 bg-brand-accent text-white rounded-lg font-semibold shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-elegant"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-brand-accent hover:underline"
                    onClick={() => { setResetMode(true); setResetStep(1); setError(''); setInfo(''); setResetForm({ username: credentials.username, code: '', newPassword: '', confirmPassword: '' }); }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <form className="space-y-6 animate-slide-up" onSubmit={resetStep === 1 ? handleRequestReset : handleConfirmReset}>
            <div className="card-elegant dark:card-elegant-dark p-6">
              <div className="space-y-4">
                {/* Username for reset */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors duration-200"
                    placeholder="Enter your username"
                    value={resetForm.username}
                    onChange={(e) => handleResetInputChange('username', e.target.value)}
                  />
                </div>

                {resetStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">6-digit code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors duration-200"
                        placeholder="Enter the code sent to your email"
                        value={resetForm.code}
                        onChange={(e) => handleResetInputChange('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">New password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors duration-200"
                        placeholder="Enter new password (min 8 chars)"
                        value={resetForm.newPassword}
                        onChange={(e) => handleResetInputChange('newPassword', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Confirm password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors duration-200"
                        placeholder="Re-enter new password"
                        value={resetForm.confirmPassword}
                        onChange={(e) => handleResetInputChange('confirmPassword', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Error/Info */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
                  </div>
                )}
                {info && !error && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                    <p className="text-emerald-800 dark:text-emerald-200 text-sm font-medium">{info}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-elegant flex items-center space-x-2 py-3 px-4 bg-brand-accent text-white rounded-lg font-semibold shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-elegant"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{resetStep === 1 ? 'Sending code...' : 'Resetting...'}</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>{resetStep === 1 ? 'Send Code' : 'Confirm Reset'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:underline"
                    onClick={() => { setResetMode(false); setResetStep(1); setError(''); setInfo(''); }}
                  >
                    Back to sign in
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}


      </div>
    </div>
  );
};

export default Login; 
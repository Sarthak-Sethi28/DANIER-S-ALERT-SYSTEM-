import React, { useState } from 'react';
import { Package, Lock, User, LogIn, Crown, Shield } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const VALID_CREDENTIALS = {
    username: 'danier_admin',
    password: 'danier2024'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.username === VALID_CREDENTIALS.username && 
        credentials.password === VALID_CREDENTIALS.password) {
      
      const sessionInfo = {
        username: credentials.username,
        loginTime: new Date().toISOString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      localStorage.setItem('danier_auth', JSON.stringify(sessionInfo));
      onLogin(sessionInfo);
    } else {
      setError('Invalid username or password');
    }

    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-elegant dark:bg-gradient-dark-elegant flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Elegant Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-luxury rounded-xl shadow-luxury flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-danier-dark dark:text-white font-elegant">
            DANIER
          </h2>
          <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
            Inventory Intelligence System
          </p>
          
          {/* Features */}
          <div className="mt-6 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-elegant">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Shield className="w-4 h-4 text-danier-gold" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Enterprise Features</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-danier-gold rounded-full"></div>
                <span>Multi-user access</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-danier-gold rounded-full"></div>
                <span>Real-time synchronization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-danier-gold rounded-full"></div>
                <span>Advanced analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
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
                    className="pl-10 w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-danier-gold/50 focus:border-danier-gold transition-colors duration-200"
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
                    className="pl-10 w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-danier-gold/50 focus:border-danier-gold transition-colors duration-200"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-elegant w-full flex justify-center items-center space-x-2 py-3 px-4 bg-gradient-luxury text-white rounded-lg font-semibold shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-elegant"
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
            </div>
          </div>
        </form>

        {/* Credentials Info */}
        <div className="card-elegant dark:card-elegant-dark p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-danier-gold" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Demo Access</span>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3 text-sm">
            <div className="space-y-1">
              <p className="text-neutral-700 dark:text-neutral-300">
                <strong>Username:</strong> <code className="bg-danier-gold/20 px-1.5 py-0.5 rounded text-danier-dark">danier_admin</code>
              </p>
              <p className="text-neutral-700 dark:text-neutral-300">
                <strong>Password:</strong> <code className="bg-danier-gold/20 px-1.5 py-0.5 rounded text-danier-dark">danier2024</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
import React, { useState } from 'react';
import { Package, Lock, User, LogIn, Crown, Sparkles, Shield, Zap } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Single user credentials - you can change these
  const VALID_CREDENTIALS = {
    username: 'danier_admin',
    password: 'danier2024'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.username === VALID_CREDENTIALS.username && 
        credentials.password === VALID_CREDENTIALS.password) {
      
      // Create session info with timestamp
      const sessionInfo = {
        username: credentials.username,
        loginTime: new Date().toISOString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Store in localStorage for persistence across tabs
      localStorage.setItem('danier_auth', JSON.stringify(sessionInfo));
      
      onLogin(sessionInfo);
    } else {
      setError('Invalid username or password');
    }

    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-luxury-pearl to-luxury-champagne dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danier-gold/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-champagne/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
        {/* Premium Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-gold rounded-3xl shadow-gold flex items-center justify-center animate-float">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gradient-gold mb-3">
            Danier Alert System
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Professional Inventory Intelligence
          </p>
          
          {/* Feature Highlights */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-premium">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-danier-gold" />
              <span className="font-semibold text-danier-dark dark:text-white">Enterprise Features</span>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Multi-user concurrent access</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Real-time inventory synchronization</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Advanced analytics dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Login Form */}
        <form className="space-y-6 animate-slide-up" onSubmit={handleSubmit} style={{ animationDelay: '0.2s' }}>
          <div className="card-premium dark:card-premium-dark p-8">
            <div className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-danier-dark dark:text-white mb-3">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-danier-gold" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="pl-12 w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-danier-dark dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-danier-gold/50 focus:border-danier-gold transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-danier-dark dark:text-white mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-danier-gold" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-12 w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-danier-dark dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-danier-gold/50 focus:border-danier-gold transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 animate-slide-down">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-premium w-full flex justify-center items-center space-x-3 py-4 px-6 bg-gradient-gold text-white rounded-2xl font-semibold text-lg shadow-gold hover:shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    <span>Sign In</span>
                    <Zap className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Credentials Info */}
        <div className="card-premium dark:card-premium-dark p-6 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-danier-gold" />
            <span className="font-semibold text-danier-dark dark:text-white">Demo Credentials</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="bg-gradient-to-r from-luxury-cream to-luxury-champagne dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 border border-danier-gold/20">
              <p className="text-danier-dark dark:text-white">
                <strong>Username:</strong> <code className="bg-danier-gold/20 px-2 py-1 rounded">danier_admin</code>
              </p>
              <p className="text-danier-dark dark:text-white">
                <strong>Password:</strong> <code className="bg-danier-gold/20 px-2 py-1 rounded">danier2024</code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-danier-gold" />
            <span>Powered by premium technology</span>
            <Sparkles className="w-4 h-4 text-danier-gold" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 
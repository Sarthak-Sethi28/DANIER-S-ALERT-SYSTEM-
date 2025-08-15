import React, { useState } from 'react';
import { Package, Lock, User, LogIn } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-400 p-3 rounded-full">
              <Package className="w-8 h-8 text-danier-dark" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-yellow-100">
            Danier Alert System
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Professional Inventory Intelligence
          </p>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-zinc-800 p-3 rounded-lg">
            <p><strong>Multi-User Access Enabled</strong></p>
            <p>✅ Multiple users can sign in simultaneously</p>
            <p>✅ Shared dashboard state across all sessions</p>
            <p>✅ Real-time inventory data synchronization</p>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-yellow-100 bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter username"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-yellow-100 bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="text-center">
          <div className="bg-yellow-50 dark:bg-zinc-800 border border-yellow-200 dark:border-zinc-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>Demo Credentials:</strong>
            </p>
            <div className="text-xs font-mono bg-white dark:bg-zinc-900 p-2 rounded border">
              <div>Username: <span className="text-blue-600 dark:text-blue-400">danier_admin</span></div>
              <div>Password: <span className="text-blue-600 dark:text-blue-400">danier2024</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
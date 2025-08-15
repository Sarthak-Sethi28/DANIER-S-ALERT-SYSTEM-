import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Upload, BarChart3, Users, Settings, Package, Search, AlertTriangle, LogOut } from 'lucide-react';
import UploadPage from './components/UploadPage';
import Dashboard from './components/Dashboard';
import Recipients from './components/Recipients';
import SettingsPage from './components/Settings';
import KeyItemsDashboard from './components/KeyItemsDashboard';
import SearchBar from './components/SearchBar';
import ThresholdManager from './components/ThresholdManager';
import Login from './components/Login';
import { startHeartbeat } from './services/api';

function App() {
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // Default to light if no preference saved
    return false;
  });

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);

  // Check for existing authentication on app load
  React.useEffect(() => {
    const savedAuth = localStorage.getItem('danier_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setUser(authData);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Invalid auth data, clearing...');
        localStorage.removeItem('danier_auth');
      }
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Start lightweight heartbeat to keep backend warm
  React.useEffect(() => {
    const stop = startHeartbeat(60000);
    return () => { try { stop && stop(); } catch (_) {} };
  }, []);

  const handleLogin = (sessionInfo) => {
    setUser(sessionInfo);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('danier_auth');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
        {/* Header */}
        <header className="bg-white dark:bg-zinc-950 shadow-sm border-b border-gray-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-extrabold tracking-tight text-danier-dark dark:text-danier-gold">
                  Danier Automated Alert System
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Welcome, {user?.username} • Session: {user?.sessionId?.slice(-8)}
                </div>
                <button
                  onClick={() => setDark(v => !v)}
                  className="px-3 py-1 rounded-md border border-yellow-400 text-sm text-danier-dark dark:text-yellow-200 bg-yellow-200 hover:bg-yellow-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  title="Toggle theme"
                >
                  {dark ? 'Light' : 'Dark'}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1 rounded-md border border-red-400 text-sm text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<SearchBar />} />
            <Route path="/thresholds" element={<ThresholdManager />} />
            <Route path="/recipients" element={<Recipients />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/key-items" element={<KeyItemsDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Navigation Component
function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { to: "/dashboard", icon: <BarChart3 className="w-5 h-5" />, label: "Dashboard", priority: true },
    { to: "/upload", icon: <Upload className="w-5 h-5" />, label: "Upload Report" },
    { to: "/thresholds", icon: <AlertTriangle className="w-5 h-5" />, label: "Thresholds" },
    { to: "/key-items", icon: <Package className="w-5 h-5" />, label: "Key Items" },
    { to: "/recipients", icon: <Users className="w-5 h-5" />, label: "Recipients" },
    { to: "/settings", icon: <Settings className="w-5 h-5" />, label: "Settings" }
  ];

  return (
    <nav className="bg-danier-gold dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                (location.pathname === item.to || (location.pathname === '/' && item.to === '/dashboard'))
                  ? 'text-danier-dark bg-yellow-300 dark:bg-zinc-800 dark:text-yellow-200'
                  : 'text-white hover:text-danier-dark hover:bg-yellow-200 dark:text-yellow-200 dark:hover:bg-zinc-800'
              } ${item.priority ? 'border-2 border-yellow-400 rounded-md' : ''}`}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
              {item.priority && <span className="ml-2 text-xs bg-blue-500 text-white px-1 rounded">HOME</span>}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default App; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Upload, BarChart3, Users, HelpCircle, Package, Search, AlertTriangle, LogOut, Moon, Sun, Crown } from 'lucide-react';
import UploadPage from './components/UploadPage';
import Dashboard from './components/Dashboard';
import Recipients from './components/Recipients';
import HelpPage from './components/HelpPage';
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
    return false;
  });

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);

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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-elegant dark:bg-gradient-dark-elegant">
        {/* Elegant Header */}
        <header className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 shadow-sophisticated">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Brand Section */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-luxury rounded-lg shadow-luxury flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-danier-dark dark:text-white font-elegant tracking-tight">
                    DANIER
                  </h1>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium tracking-wide uppercase">
                    Inventory Intelligence
                  </p>
                </div>
              </div>

              {/* User Controls */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end">
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {user?.username}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-500">
                    Session: {user?.sessionId?.slice(-8)}
                  </div>
                </div>

                <button
                  onClick={() => setDark(v => !v)}
                  className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                  title="Toggle theme"
                >
                  {dark ? (
                    <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-neutral-600" />
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Elegant Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<SearchBar />} />
              <Route path="/thresholds" element={<ThresholdManager />} />
              <Route path="/recipients" element={<Recipients />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/key-items" element={<KeyItemsDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// Elegant Navigation Component
function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { 
      to: "/upload", 
      icon: <Upload className="w-5 h-5" />, 
      label: "Upload", 
      priority: true,
    },
    { 
      to: "/dashboard", 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: "Dashboard",
    },
    { 
      to: "/thresholds", 
      icon: <AlertTriangle className="w-5 h-5" />, 
      label: "Thresholds",
    },
    { 
      to: "/key-items", 
      icon: <Package className="w-5 h-5" />, 
      label: "Key Items",
    },
    { 
      to: "/recipients", 
      icon: <Users className="w-5 h-5" />, 
      label: "Recipients",
    },
    { 
      to: "/help", 
      icon: <HelpCircle className="w-5 h-5" />, 
      label: "Help",
    }
  ];

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (location.pathname === '/' && item.to === '/upload');
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-danier-gold text-white shadow-luxury'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                } ${item.priority ? 'ring-2 ring-danier-gold/30 ring-offset-1' : ''}`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
                {item.priority && (
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                    START
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default App; 
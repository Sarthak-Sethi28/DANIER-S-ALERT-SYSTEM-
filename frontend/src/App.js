import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Upload, BarChart3, Users, Settings, Package, Search, AlertTriangle, LogOut, Moon, Sun, Sparkles, Crown } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-luxury-pearl to-luxury-champagne dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Premium Header */}
        <header className="relative">
          {/* Background with glass effect */}
          <div className="absolute inset-0 bg-gradient-luxury dark:bg-gradient-dark opacity-95 backdrop-blur-md"></div>
          <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Brand Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-gold rounded-xl shadow-gold flex items-center justify-center animate-float">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-3xl font-bold text-gradient-gold font-display tracking-tight">
                    Danier
                  </h1>
                  <p className="text-sm font-medium text-danier-dark/70 dark:text-danier-gold/70 -mt-1">
                    Automated Alert System
                  </p>
                </div>
              </div>

              {/* User Info & Controls */}
              <div className="flex items-center space-x-4">
                {/* User Welcome */}
                <div className="hidden md:flex flex-col items-end">
                  <div className="text-sm font-semibold text-danier-dark dark:text-white">
                    Welcome back, {user?.username}
                  </div>
                  <div className="text-xs text-danier-dark/60 dark:text-white/60">
                    Session: {user?.sessionId?.slice(-8)}
                  </div>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={() => setDark(v => !v)}
                  className="btn-premium relative p-3 rounded-xl bg-white/20 dark:bg-black/20 border border-danier-gold/30 hover:border-danier-gold text-danier-dark dark:text-danier-gold transition-all duration-300"
                  title="Toggle theme"
                >
                  <div className="relative z-10">
                    {dark ? (
                      <Sun className="w-5 h-5 animate-bounce-subtle" />
                    ) : (
                      <Moon className="w-5 h-5 animate-bounce-subtle" />
                    )}
                  </div>
                </button>

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  className="btn-premium flex items-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-300/50 hover:border-red-400 text-red-600 dark:text-red-400 transition-all duration-300"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<SearchBar />} />
              <Route path="/thresholds" element={<ThresholdManager />} />
              <Route path="/recipients" element={<Recipients />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/key-items" element={<KeyItemsDashboard />} />
            </Routes>
          </div>
        </main>

        {/* Background Decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danier-gold/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-champagne/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </Router>
  );
}

// Premium Navigation Component
function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { 
      to: "/upload", 
      icon: <Upload className="w-5 h-5" />, 
      label: "Upload Report", 
      priority: true,
      description: "Upload new inventory data"
    },
    { 
      to: "/dashboard", 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: "Dashboard",
      description: "View analytics & insights"
    },
    { 
      to: "/thresholds", 
      icon: <AlertTriangle className="w-5 h-5" />, 
      label: "Thresholds",
      description: "Manage alert thresholds"
    },
    { 
      to: "/key-items", 
      icon: <Package className="w-5 h-5" />, 
      label: "Key Items",
      description: "Monitor important products"
    },
    { 
      to: "/recipients", 
      icon: <Users className="w-5 h-5" />, 
      label: "Recipients",
      description: "Manage notification lists"
    },
    { 
      to: "/settings", 
      icon: <Settings className="w-5 h-5" />, 
      label: "Settings",
      description: "System configuration"
    }
  ];

  return (
    <nav className="relative z-20 border-b border-white/20 dark:border-slate-700/50">
      {/* Background */}
      <div className="absolute inset-0 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-4 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (location.pathname === '/' && item.to === '/upload');
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center space-x-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-gold text-white shadow-gold scale-105'
                    : 'text-danier-dark dark:text-white hover:bg-white/20 dark:hover:bg-slate-700/30 hover:scale-105'
                } ${item.priority ? 'ring-2 ring-danier-gold/50 ring-offset-2 ring-offset-transparent' : ''}`}
                title={item.description}
              >
                <div className={`transition-all duration-300 ${isActive ? 'animate-bounce-subtle' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-xs opacity-75 hidden md:block">{item.description}</span>
                </div>
                {item.priority && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 sm:px-2 py-1 rounded-full font-bold animate-pulse">
                    <span className="hidden sm:inline">START</span>
                    <span className="sm:hidden">!</span>
                  </div>
                )}
                
                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default App; 
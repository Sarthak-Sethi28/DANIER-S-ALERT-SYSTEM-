import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Upload, BarChart3, Users, HelpCircle, Package, Search, AlertTriangle, LogOut, Moon, Sun, Sparkles, Crown } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-luxury-pearl to-luxury-champagne dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Ultra-Premium Header with 3D Effects */}
        <header className="relative z-30">
          {/* Luxury Background Layers */}
          <div className="absolute inset-0 bg-gradient-fashion opacity-95 backdrop-blur-4xl"></div>
          <div className="absolute inset-0 bg-gradient-silk dark:bg-gradient-3d-dark opacity-80"></div>
          <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-xl"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-24">
              {/* Ultra-Premium Brand Section */}
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-16 h-16 bg-gradient-fashion rounded-3xl shadow-fashion-3d flex items-center justify-center animate-tilt-3d hover:animate-glow-pulse transition-all duration-700 group-hover:scale-110">
                    <Crown className="w-9 h-9 text-white animate-diamond-sparkle" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-fashion-ruby rounded-full animate-pulse flex items-center justify-center shadow-diamond">
                    <Sparkles className="w-4 h-4 text-white animate-diamond-sparkle" />
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold bg-gradient-fashion bg-clip-text text-transparent font-fashion tracking-tight animate-fashion-entrance">
                    DANIER
                  </h1>
                  <p className="text-sm font-luxury font-semibold text-luxury-velvet/80 dark:text-luxury-rose-gold/80 tracking-widest uppercase">
                    Luxury Inventory Intelligence
                  </p>
                </div>
              </div>

              {/* Premium User Controls */}
              <div className="flex items-center space-x-6">
                {/* Elegant User Welcome */}
                <div className="hidden md:flex flex-col items-end space-y-1">
                  <div className="text-sm font-semibold text-danier-dark dark:text-white font-luxury">
                    Welcome, {user?.username}
                  </div>
                  <div className="text-xs text-danier-dark/60 dark:text-white/60 font-mono tracking-wider">
                    Session: {user?.sessionId?.slice(-8)}
                  </div>
                </div>

                {/* 3D Theme Toggle */}
                <button
                  onClick={() => setDark(v => !v)}
                  className="btn-premium relative p-4 rounded-2xl bg-white/20 dark:bg-black/20 border border-danier-gold/30 hover:border-danier-gold text-danier-dark dark:text-danier-gold transition-all duration-500 hover:animate-luxury-hover shadow-fashion-3d"
                  title="Toggle theme"
                >
                  <div className="relative z-10">
                    {dark ? (
                      <Sun className="w-6 h-6 animate-premium-spin" />
                    ) : (
                      <Moon className="w-6 h-6 animate-tilt-3d" />
                    )}
                  </div>
                </button>

                {/* Luxury Sign Out */}
                <button
                  onClick={handleLogout}
                  className="btn-premium flex items-center space-x-3 px-6 py-4 rounded-2xl bg-fashion-ruby/10 hover:bg-fashion-ruby/20 border border-fashion-ruby/30 hover:border-fashion-ruby text-fashion-ruby dark:text-red-400 transition-all duration-500 hover:animate-luxury-hover shadow-velvet"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline font-luxury font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Ultra-Premium Navigation */}
        <Navigation />

        {/* Main Content with 3D Perspective */}
        <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8" style={{ perspective: '2000px' }}>
          <div className="animate-fashion-entrance">
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

        {/* Premium Background Decoration with 3D Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danier-gold/5 rounded-full blur-3xl animate-rotate-3d"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-champagne/10 rounded-full blur-3xl animate-rotate-3d" style={{ animationDelay: '10s', animationDirection: 'reverse' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-fashion-ruby/5 rounded-full blur-2xl animate-tilt-3d" style={{ animationDelay: '5s' }}></div>
        </div>
      </div>
    </Router>
  );
}

// Ultra-Premium Navigation Component
function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { 
      to: "/upload", 
      icon: <Upload className="w-5 h-5" />, 
      label: "Upload Report", 
      priority: true,
      description: "Upload luxury inventory data",
      color: "from-fashion-sapphire to-fashion-emerald"
    },
    { 
      to: "/dashboard", 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: "Dashboard",
      description: "Premium analytics & insights",
      color: "from-fashion-emerald to-danier-gold"
    },
    { 
      to: "/thresholds", 
      icon: <AlertTriangle className="w-5 h-5" />, 
      label: "Thresholds",
      description: "Luxury stock alert management",
      color: "from-fashion-ruby to-fashion-burgundy"
    },
    { 
      to: "/key-items", 
      icon: <Package className="w-5 h-5" />, 
      label: "Key Items",
      description: "Monitor premium collections",
      color: "from-luxury-velvet to-fashion-midnight"
    },
    { 
      to: "/recipients", 
      icon: <Users className="w-5 h-5" />, 
      label: "Recipients",
      description: "Executive notification lists",
      color: "from-fashion-sapphire to-luxury-velvet"
    },
    { 
      to: "/help", 
      icon: <HelpCircle className="w-5 h-5" />, 
      label: "Help",
      description: "Premium support & assistance",
      color: "from-luxury-rose-gold to-luxury-champagne"
    }
  ];

  return (
    <nav className="relative z-20 border-b border-white/20 dark:border-slate-700/50">
      {/* Luxury Background */}
      <div className="absolute inset-0 bg-gradient-silk dark:bg-slate-800/30 backdrop-blur-2xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 overflow-x-auto py-6 scrollbar-hide">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.to || (location.pathname === '/' && item.to === '/upload');
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center space-x-4 px-4 sm:px-6 py-3 sm:py-4 rounded-3xl font-luxury font-semibold transition-all duration-500 whitespace-nowrap hover:animate-luxury-hover ${
                  isActive
                    ? 'bg-gradient-fashion text-white shadow-fashion-3d scale-105 animate-glow-pulse'
                    : 'text-danier-dark dark:text-white hover:bg-white/20 dark:hover:bg-slate-700/30 hover:scale-105 hover:shadow-luxury'
                } ${item.priority ? 'ring-2 ring-danier-gold/50 ring-offset-2 ring-offset-transparent animate-pulse-gold' : ''}`}
                title={item.description}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`transition-all duration-500 ${isActive ? 'animate-diamond-sparkle' : 'group-hover:scale-125 group-hover:animate-bounce-subtle'}`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-wide">{item.label}</span>
                  <span className="text-xs opacity-75 hidden md:block font-light">{item.description}</span>
                </div>
                {item.priority && (
                  <div className="absolute -top-2 -right-2 bg-fashion-ruby text-white text-xs px-1 sm:px-2 py-1 rounded-full font-bold animate-diamond-sparkle shadow-diamond">
                    <span className="hidden sm:inline">START</span>
                    <span className="sm:hidden">!</span>
                  </div>
                )}
                
                {/* 3D Hover Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Premium Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-3xl bg-gradient-fashion opacity-20 blur-xl animate-glow-pulse"></div>
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
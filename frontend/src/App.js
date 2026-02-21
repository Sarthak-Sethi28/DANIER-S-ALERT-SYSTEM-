import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Upload, BarChart3, Users, Package, AlertTriangle, LogOut, Home, Headphones } from 'lucide-react';
import UploadPage from './components/UploadPage';
import Dashboard from './components/Dashboard';
import Recipients from './components/Recipients';
import HelpPage from './components/HelpPage';
import KeyItemsDashboard from './components/KeyItemsDashboard';
import SearchBar from './components/SearchBar';
import ThresholdManager from './components/ThresholdManager';
import HomePage from './components/HomePage';
import Login from './components/Login';
import { startHeartbeat } from './services/api';
import { DataProvider } from './DataContext';

function App() {
  const dark = true;

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
      <DataProvider>
      <div className="min-h-screen bg-gradient-brand dark:bg-gradient-brand-dark">
        <header style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center" style={{ textDecoration: 'none' }}>
                <div>
                  <h1 className="text-2xl font-bold font-elegant tracking-tight" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    DANIER
                  </h1>
                  <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(201,168,76,0.55)' }}>
                    Inventory Intelligence
                  </p>
                </div>
              </Link>

              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col items-end">
                  <div className="text-sm font-medium" style={{ color: '#e0e0f0' }}>
                    {user?.username}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(201,168,76,0.5)' }}>
                    Session: {user?.sessionId?.slice(-8)}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ background: 'rgba(255,61,61,0.1)', border: '1px solid rgba(255,61,61,0.2)', color: '#ff6b6b' }}
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <Navigation />

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<HomePage />} />
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
      </DataProvider>
    </Router>
  );
}

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { to: "/upload", icon: <Upload className="w-5 h-5" />, label: "Upload" },
    { to: "/dashboard", icon: <BarChart3 className="w-5 h-5" />, label: "Dashboard" },
    { to: "/thresholds", icon: <AlertTriangle className="w-5 h-5" />, label: "Thresholds" },
    { to: "/key-items", icon: <Package className="w-5 h-5" />, label: "Key Items" },
    { to: "/recipients", icon: <Users className="w-5 h-5" />, label: "Recipients" },
    { to: "/help", icon: <Headphones className="w-5 h-5" />, label: "Support" },
  ];

  return (
    <nav style={{ background: 'rgba(5,5,8,0.97)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                  color: '#000',
                  boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
                  fontWeight: '700',
                } : {
                  color: 'rgba(200,200,220,0.65)',
                  background: 'transparent',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#c9a84c'; e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(200,200,220,0.65)'; e.currentTarget.style.background = 'transparent'; }}}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default App; 
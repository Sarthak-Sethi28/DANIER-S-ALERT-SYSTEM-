import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Upload, BarChart3, Users, Settings, Package, Database, Search, AlertTriangle } from 'lucide-react';
import UploadPage from './components/UploadPage';
import Dashboard from './components/Dashboard';
import Recipients from './components/Recipients';
import SettingsPage from './components/Settings';
import KeyItemsDashboard from './components/KeyItemsDashboard';
import InventoryFilesDashboard from './components/InventoryFilesDashboard';
import SearchBar from './components/SearchBar';
import ThresholdManager from './components/ThresholdManager';

function App() {
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // Default to light if no preference saved
    return false;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

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
                <div className="text-sm text-gray-500 dark:text-gray-300">Professional Inventory Intelligence</div>
                <button
                  onClick={() => setDark(v => !v)}
                  className="px-3 py-1 rounded-md border border-yellow-400 text-sm text-danier-dark dark:text-yellow-200 bg-yellow-200 hover:bg-yellow-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  title="Toggle theme"
                >
                  {dark ? 'Light' : 'Dark'}
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
            <Route path="/" element={<UploadPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<SearchBar />} />
            <Route path="/thresholds" element={<ThresholdManager />} />
            <Route path="/recipients" element={<Recipients />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/key-items" element={<KeyItemsDashboard />} />
            <Route path="/inventory-files" element={<InventoryFilesDashboard />} />
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
    { to: "/upload", icon: <Upload className="w-5 h-5" />, label: "Upload Report", priority: true },
    { to: "/dashboard", icon: <BarChart3 className="w-5 h-5" />, label: "Dashboard" },
    { to: "/thresholds", icon: <AlertTriangle className="w-5 h-5" />, label: "Thresholds" },
    { to: "/key-items", icon: <Package className="w-5 h-5" />, label: "Key Items" },
    { to: "/inventory-files", icon: <Database className="w-5 h-5" />, label: "Multi-File" },
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
                (location.pathname === item.to || (location.pathname === '/' && item.to === '/upload'))
                  ? 'text-danier-dark bg-yellow-300 dark:bg-zinc-800 dark:text-yellow-200'
                  : 'text-white hover:text-danier-dark hover:bg-yellow-200 dark:text-yellow-200 dark:hover:bg-zinc-800'
              } ${item.priority ? 'border-2 border-yellow-400 rounded-md' : ''}`}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
              {item.priority && <span className="ml-2 text-xs bg-red-500 text-white px-1 rounded">START</span>}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default App; 
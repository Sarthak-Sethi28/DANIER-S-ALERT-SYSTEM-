import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getSpecificKeyItemAlerts, getAllKeyItemsWithAlerts, sendEmailAlert } from '../services/api';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Package, 
  Mail, 
  RefreshCw, 
  Search as SearchIcon,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Zap,
  Crown,
  Sparkles,
  BarChart3,
  X
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// Add new API call for key items alerts
const getKeyItemsSummary = async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`${API_BASE_URL}/key-items/summary`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error('Failed to fetch key items summary');
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
};

const Dashboard = () => {
  const [keyItems, setKeyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [alerts, setAlerts] = useState({});
  const [loadingAlerts, setLoadingAlerts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const itemRefs = useRef({});
  const [error, setError] = useState(null);
  const [emailStatusByItem, setEmailStatusByItem] = useState({});
  const [allAlertsByItem, setAllAlertsByItem] = useState({});
  const [showOrderPlacedModal, setShowOrderPlacedModal] = useState(false);
  const [showHealthyStockModal, setShowHealthyStockModal] = useState(false);
  // Added: track expanded rows inside Order Placed modal per item name and alert index
  const [expandedOrderItems, setExpandedOrderItems] = useState({});
  // Derived data for modals (computed, not stored as state)
  const orderPlacedItems = useMemo(() => {
    const itemsWithOrders = new Set();
    Object.entries(allAlertsByItem).forEach(([itemName, alerts]) => {
      if ((alerts || []).some(alert => (alert.new_order ?? 0) > 0)) {
        itemsWithOrders.add(itemName);
      }
    });
    return Array.from(itemsWithOrders).map(itemName => ({
      name: itemName,
      alerts: (allAlertsByItem[itemName] || []).filter(alert => (alert.new_order ?? 0) > 0)
    }));
  }, [allAlertsByItem]);

  const healthyStockItems = useMemo(() => {
    return keyItems
      .filter(item => (item.low_stock_count || 0) === 0)
      .map(item => ({ name: item.name, total_stock: item.total_stock }));
  }, [keyItems]);

  // Derive modal item lists from current alerts and keyItems without mutating during render
  useEffect(() => {
    try {
      const itemsWithOrders = new Set();
      Object.entries(allAlertsByItem).forEach(([itemName, alerts]) => {
        const hasOrder = (alerts || []).some(alert => (alert.new_order ?? 0) > 0);
        if (hasOrder) itemsWithOrders.add(itemName);
      });
      const orderPlacedItemsList = Array.from(itemsWithOrders).map(itemName => ({
        name: itemName,
        alerts: (allAlertsByItem[itemName] || []).filter(alert => (alert.new_order ?? 0) > 0)
      }));
      setOrderPlacedItems(orderPlacedItemsList);

      const healthyStockItemsList = (keyItems || [])
        .filter(item => (item.low_stock_count || 0) === 0)
        .map(item => ({ name: item.name, total_stock: item.total_stock }));
      setHealthyStockItems(healthyStockItemsList);
    } catch (_) {
      // no-op safeguard
    }
  }, [allAlertsByItem, keyItems]);

  const scrollToItem = (name) => {
    const el = itemRefs.current[name];
    if (el && typeof el.scrollIntoView === 'function') {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  // Load key items on component mount
  useEffect(() => {
    loadKeyItems();
  }, []);

  // Auto-refresh when component becomes visible (e.g., returning from upload)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // REMOVED: No auto-refresh on visibility change to prevent disruptions
      console.log('🔄 Dashboard visible - staying on current data to prevent disruptions');
    };

    const handleFocus = () => {
      // REMOVED: No auto-refresh on focus to prevent disruptions  
      console.log('🔄 Dashboard focused - staying on current data to prevent disruptions');
    };

    const handleThresholdsUpdated = () => {
      // Only refresh if user explicitly requests it
      console.log('🔄 Thresholds updated - manual refresh required');
    };

    // Keep listeners but don't auto-refresh
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('thresholdsUpdated', handleThresholdsUpdated);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('thresholdsUpdated', handleThresholdsUpdated);
    };
  }, []);

  const loadKeyItems = async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading key items with ultra-fast batch processing...');

      // Use single ultra-fast batch call
      const batch = await getAllKeyItemsWithAlerts();
      console.log('📊 Batch response:', batch);
      
      const arr = (batch.key_items || []).map(k => ({
        name: k.name,
        total_stock: k.total_stock,
        variants_count: (k.alerts || []).length,
        low_stock_count: k.alert_count,
      }));
      // Cache all alerts per item so stats stay stable regardless of UI expansion
      const alertsMap = {};
      (batch.key_items || []).forEach(k => {
        alertsMap[k.name] = (k.alerts || []).map(a => ({ ...a, current_stock: a.stock_level }));
      });
      setAllAlertsByItem(alertsMap);

      if (arr && arr.length > 0) {
        const sorted = [...arr].sort((a,b)=> (a.name||'').localeCompare(b.name||''));
        setKeyItems(sorted);
        console.log(`✅ Loaded ${sorted.length} items with ${sorted.reduce((sum, item) => sum + (item.low_stock_count || 0), 0)} total alerts`);
      } else {
        console.log('⚠️ No items loaded');
        setKeyItems([]);
        
        // Check if this is a "no files" situation and show helpful message
        if (batch.message && batch.message.includes('No inventory files found')) {
          setError({
            type: 'no-files',
            message: batch.message,
            help: batch.help
          });
        }
      }
    } catch (error) {
      console.error('❌ Error loading key items:', error);
      setKeyItems([]);
      setError({
        type: 'error',
        message: 'Failed to load inventory data. Please try refreshing the page.'
      });
    } finally {
      setLoading(false);
      // Clear any error after 5 seconds to prevent permanent UI issues
      setTimeout(() => {
        if (error && error.type === 'error') {
          setError(null);
        }
      }, 5000);
    }
  };

  const handleQuickSearch = async () => {
    const raw = searchTerm.trim();
    if (!raw) return;
    const term = raw.toUpperCase();
    try {
      setSearching(true);
      // Prefer cached batch
      const batch = await getAllKeyItemsWithAlerts();
      const list = batch.key_items || [];
      let item = list.find(x => (x.name || '').toUpperCase() === term);
      if (!item) item = list.find(x => (x.name || '').toUpperCase().includes(term));

      let alertsList = [];
      if (item) {
        alertsList = (item.alerts || []).map(a => ({ ...a, current_stock: a.stock_level }));
        setExpandedItems({ [item.name]: true });
        setAlerts(prev => ({ ...prev, [item.name]: alertsList }));
        scrollToItem(item.name);
        return;
      }

      // Fallback to backend search endpoint
      const res = await fetch(`${API_BASE_URL}/search/article/${encodeURIComponent(raw)}`);
      const data = await res.json();
      const results = data.results || [];
      if (results.length > 0) {
        const chosen = (results[0].item_name || '').toUpperCase();
        alertsList = results
          .filter(r => (r.item_name || '').toUpperCase() === chosen)
          .map(r => ({
            item_name: r.item_name,
            color: r.color,
            size: r.size,
            current_stock: r.current_stock,
            required_threshold: r.required_threshold,
            shortage: r.shortage,
          }));
        const displayName = results[0].item_name;
        setExpandedItems({ [displayName]: true });
        setAlerts(prev => ({ ...prev, [displayName]: alertsList }));
        // Ensure the item appears in the list so user sees it
        if (!keyItems.find(k => k.name === displayName)) {
          setKeyItems(prev => [{ name: displayName, total_stock: undefined, variants_count: alertsList.length, low_stock_count: alertsList.length }, ...prev]);
        }
        scrollToItem(displayName);
      } else {
        alert('No results found for that article.');
      }
    } catch (e) {
      console.error('Search failed', e);
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const loadAlertsForItem = async (itemName) => {
    if (alerts[itemName]) return; // Already loaded
    
    try {
      setLoadingAlerts(prev => ({ ...prev, [itemName]: true }));
      // Use cached batch alerts so we get required_threshold and shortage
      const batch = await getAllKeyItemsWithAlerts();
      const item = (batch.key_items || []).find(x => x.name === itemName);
      const list = item ? (item.alerts || []).map(a => ({
        ...a,
        current_stock: a.stock_level,
      })) : [];
      setAlerts(prev => ({ ...prev, [itemName]: list }));
    } catch (error) {
      console.error(`Error loading alerts for ${itemName}:`, error);
    } finally {
      setLoadingAlerts(prev => ({ ...prev, [itemName]: false }));
    }
  };

  const toggleExpanded = async (itemName) => {
    const isExpanding = !expandedItems[itemName];
    
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: isExpanding
    }));

    // Load alerts when expanding for the first time
    if (isExpanding && !alerts[itemName]) {
      await loadAlertsForItem(itemName);
    }
    if (isExpanding) scrollToItem(itemName);
  };

  const getTotalAlerts = () => {
    if (!Array.isArray(keyItems)) return 0;
    return keyItems.reduce((total, item) => total + (item.low_stock_count || 0), 0);
  };

  const getUrgencyLevel = (shortage) => {
    if (shortage >= 10) return { 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', 
      label: 'CRITICAL',
      icon: <AlertTriangle className="w-3 h-3" />
    };
    if (shortage >= 5) return { 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', 
      label: 'HIGH',
      icon: <TrendingDown className="w-3 h-3" />
    };
    return { 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', 
      label: 'MEDIUM',
      icon: <Activity className="w-3 h-3" />
    };
  };

  const handleDownloadAllAlerts = async () => {
    try {
      // Show immediate feedback
      alert('📊 Generating Excel report and sending email notification... This may take a moment.');
      
      // Call backend to generate Excel and send email
      const response = await fetch(`${API_BASE_URL}/alerts/download-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      // Download the Excel file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `danier_alerts_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('✅ Excel report downloaded and email with Excel attachment sent to recipients!');
      
      // Force re-render to ensure button stays visible
      setLoading(false);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Failed to generate report. Please try again.');
      
      // Ensure UI stays stable even on error
      setLoading(false);
      setError(null);
    }
  };

  const handleSendItemEmail = async (itemName) => {
    try {
      setEmailStatusByItem(prev => ({ ...prev, [itemName]: 'sending' }));
      await sendEmailAlert(itemName);
      setEmailStatusByItem(prev => ({ ...prev, [itemName]: 'sent' }));
      setTimeout(() => {
        setEmailStatusByItem(prev => ({ ...prev, [itemName]: undefined }));
      }, 3000);
    } catch (e) {
      setEmailStatusByItem(prev => ({ ...prev, [itemName]: 'error' }));
      setTimeout(() => {
        setEmailStatusByItem(prev => ({ ...prev, [itemName]: undefined }));
      }, 4000);
    }
  };

  const getStatsCards = () => {
    const totalItems = keyItems.length;
    const totalAlerts = getTotalAlerts();
    // Compute from full batch, not lazily loaded UI alerts, to keep stable
    const criticalAlerts = Object.values(allAlertsByItem).reduce((sum, list) => {
      const num = (list || []).filter(alert => (alert.priority === 'ORDER_PLACED') ? false : (alert.shortage >= 10)).length;
      return sum + num;
    }, 0);
    // Count unique items with orders placed
    const orderPlaced = orderPlacedItems.length;
    const healthyItems = totalItems - keyItems.filter(item => (item.low_stock_count || 0) > 0).length;

    return [
      {
        title: 'Total Items',
        value: totalItems,
        icon: <Package className="w-6 h-6" />,
        color: 'bg-gradient-to-br from-blue-500 to-blue-600',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        onClick: null
      },
      {
        title: 'Active Alerts',
        value: totalAlerts,
        icon: <AlertTriangle className="w-6 h-6" />,
        color: 'bg-gradient-to-br from-red-500 to-red-600',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        onClick: null
      },
      {
        title: 'Critical Items',
        value: criticalAlerts,
        icon: <TrendingDown className="w-6 h-6" />,
        color: 'bg-gradient-to-br from-orange-500 to-orange-600',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        onClick: null
      },
      {
        title: 'Order Placed',
        value: orderPlaced,
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        onClick: () => setShowOrderPlacedModal(true)
      },
      {
        title: 'Healthy Stock',
        value: healthyItems,
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        onClick: () => setShowHealthyStockModal(true)
      }
    ];
  };

  // Added: toggle for Order Placed modal rows
  const toggleOrderItem = (itemName, alertIndex) => {
    const key = `${itemName}__${alertIndex}`;
    setExpandedOrderItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Premium Header */}
      <div className="card-premium dark:card-premium-dark p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-gold rounded-2xl shadow-gold flex items-center justify-center animate-float">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-gold mb-1 sm:mb-2">
                Key Items Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                Monitor low stock alerts for critical inventory items
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Premium Search */}
            <div className="relative">
              <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-danier-gold/30 rounded-2xl px-4 py-3 w-full sm:min-w-[250px] lg:min-w-[300px]">
                <SearchIcon className="w-5 h-5 text-danier-gold flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                  placeholder="Quick search article..."
                  className="bg-transparent outline-none flex-1 text-danier-dark dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-w-0"
                />
                <button
                  onClick={handleQuickSearch}
                  disabled={searching || !searchTerm.trim()}
                  className="btn-premium px-3 py-1 bg-gradient-gold text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Go'}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              {/* Download Button */}
              <button
                onClick={handleDownloadAllAlerts}
                className="btn-premium flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-luxury hover:shadow-gold transition-all duration-300 flex-1 sm:flex-none"
                title="Download all alerts as Excel file and email with attachment to recipients"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Download All</span>
                <span className="sm:hidden">Download</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadKeyItems}
                disabled={loading}
                className="btn-premium flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-gold text-white rounded-2xl font-semibold shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
                <span className="sm:hidden">{loading ? '...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStatsCards().map((stat, index) => (
            <div 
              key={stat.title} 
              className={`relative overflow-hidden rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 p-6 hover:scale-105 transition-all duration-300 animate-slide-up ${stat.onClick ? 'cursor-pointer' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={stat.onClick}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl shadow-luxury flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gradient-gold">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-danier-gold to-transparent opacity-50"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info:</h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Loading: {loading.toString()}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Error: {error ? error.type : 'none'}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Key Items: {keyItems.length}</p>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="card-premium dark:card-premium-dark p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-danier-gold/30 border-t-danier-gold rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-danier-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-xl font-semibold text-danier-dark dark:text-white">Loading inventory alerts...</div>
            <div className="text-gray-600 dark:text-gray-400">Please wait while we fetch the latest data</div>
          </div>
        </div>
      ) : error && error.type === 'no-files' ? (
        <div className="card-premium dark:card-premium-dark p-12 text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-danier-gold rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gradient-gold mb-4">No Inventory Data Found</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{error.message}</p>
          </div>
          
          {error.help && (
            <div className="bg-gradient-to-r from-luxury-cream to-luxury-champagne dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 mb-8 border border-danier-gold/20">
              <h3 className="text-xl font-bold text-danier-dark dark:text-white mb-6 flex items-center justify-center">
                <Zap className="w-6 h-6 mr-2 text-danier-gold" />
                {error.help.title}
              </h3>
              <div className="space-y-4">
                {error.help.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-gold text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-gold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-center justify-center space-x-3 text-amber-800 dark:text-amber-200">
              <Sparkles className="w-5 h-5" />
              <p className="font-medium">
                <strong>Tip:</strong> Make sure your inventory file is in Excel format (.xlsx) and contains the required columns.
              </p>
            </div>
          </div>
        </div>
      ) : error && error.type === 'error' ? (
        <div className="card-premium dark:card-premium-dark p-12 text-center">
          <div className="mb-8">
            <AlertTriangle className="w-24 h-24 text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{error.message}</p>
          </div>
          
          <button 
            onClick={() => {
              setError(null);
              loadKeyItems();
            }}
            className="btn-premium px-8 py-4 bg-gradient-gold text-white rounded-2xl font-semibold shadow-luxury hover:shadow-gold hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      ) : (
        /* Key Items Grid */
        <div className="space-y-6">
          {keyItems.map((item, index) => (
            <div 
              key={item.name} 
              ref={(el) => { itemRefs.current[item.name] = el; }} 
              className="card-premium dark:card-premium-dark overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Item Header */}
              <div 
                className={`p-6 cursor-pointer transition-all duration-300 hover:bg-white/50 dark:hover:bg-slate-800/50 ${
                  item.low_stock_count > 0 
                    ? 'border-l-4 border-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-900/10' 
                    : 'border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/10'
                }`}
                onClick={() => toggleExpanded(item.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl shadow-luxury flex items-center justify-center ${
                      item.low_stock_count > 0 
                        ? 'bg-gradient-to-br from-red-500 to-red-600' 
                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    }`}>
                      {item.low_stock_count > 0 ? (
                        <AlertTriangle className="w-6 h-6 text-white" />
                      ) : (
                        <Package className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-danier-dark dark:text-white mb-1">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>
                          {item.low_stock_count > 0 
                            ? `${item.low_stock_count} variants need attention`
                            : 'All variants have adequate stock'
                          }
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {item.low_stock_count > 0 && (
                      <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded-xl font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{item.low_stock_count} alerts</span>
                      </div>
                    )}
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      expandedItems[item.name] ? 'bg-danier-gold text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {expandedItems[item.name] ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedItems[item.name] && (
                <div className="border-t border-white/50 dark:border-slate-700/50 bg-gradient-to-r from-luxury-cream/30 to-luxury-champagne/30 dark:from-slate-800/30 dark:to-slate-700/30">
                  {loadingAlerts[item.name] ? (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-danier-gold/30 border-t-danier-gold rounded-full animate-spin"></div>
                          <Package className="w-5 h-5 text-danier-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-lg font-medium text-danier-dark dark:text-white">Loading alerts for {item.name}...</p>
                      </div>
                    </div>
                  ) : alerts[item.name] && alerts[item.name].length > 0 ? (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-gradient-gold flex items-center space-x-2">
                          <AlertTriangle className="w-6 h-6" />
                          <span>Low Stock Details - {item.name}</span>
                        </h4>
                        <button
                          onClick={() => handleSendItemEmail(item.name)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-colors ${
                            emailStatusByItem[item.name] === 'sending'
                              ? 'bg-blue-200 dark:bg-blue-900/40 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                              : emailStatusByItem[item.name] === 'sent'
                              ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                              : emailStatusByItem[item.name] === 'error'
                              ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                              : 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                          }`}
                          title="Send email to recipients for this item"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {emailStatusByItem[item.name] === 'sending' && 'Sending...'}
                            {emailStatusByItem[item.name] === 'sent' && 'Email Sent'}
                            {emailStatusByItem[item.name] === 'error' && 'Failed, try again'}
                            {!emailStatusByItem[item.name] && 'Email Alerts Active'}
                          </span>
                        </button>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-white/50 dark:border-slate-700/50">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-luxury-cream to-luxury-champagne dark:from-slate-800 dark:to-slate-700">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">Color</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">Size</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">Item Number</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">Current Stock</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">Required</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">Shortage</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">New Order</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">Order Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-danier-dark dark:text-white">Priority</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm divide-y divide-white/50 dark:divide-slate-700/50">
                              {alerts[item.name].map((alert, alertIndex) => {
                                const urgency = getUrgencyLevel(alert.shortage);
                                const isOrderPlaced = ((alert.new_order ?? 0) > 0) || alert.priority === 'ORDER_PLACED';
                                return (
                                  <tr key={alertIndex} className="hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors duration-200">
                                    <td className="px-6 py-4 text-sm font-semibold text-danier-dark dark:text-white">{alert.color}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{alert.size}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{alert.item_number || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">{alert.current_stock}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">{alert.required_threshold}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600 dark:text-red-400">-{alert.shortage}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{(alert.new_order ?? '') === '' ? '-' : alert.new_order}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{alert.order_date || '-'}</td>
                                    <td className="px-6 py-4">
                                      {isOrderPlaced ? (
                                        <div className={`inline-flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300`}>
                                          <TrendingUp className="w-3 h-3" />
                                          <span>ORDER PLACED</span>
                                        </div>
                                      ) : (
                                        <div className={`inline-flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl border ${urgency.bg} ${urgency.color}`}>
                                          {urgency.icon}
                                          <span>{urgency.label}</span>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-luxury flex items-center justify-center">
                          <Package className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-2">All Good! 🎉</h4>
                          <p className="text-gray-600 dark:text-gray-400">All variants for {item.name} have adequate stock levels</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {keyItems.length === 0 && !loading && !error && (
            <div className="card-premium dark:card-premium-dark p-16 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <Package className="w-24 h-24 text-gray-400 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-danier-gold rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gradient-gold mb-3">No Inventory Data</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Upload an inventory report to see key items stock levels and alerts
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Placed Modal */}
      {showOrderPlacedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-danier-dark dark:text-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-emerald-600" />
                Items with Orders Placed
              </h2>
              <button 
                onClick={() => setShowOrderPlacedModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {orderPlacedItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No items with orders placed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderPlacedItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-danier-dark dark:text-white mb-3">
                        {item.name}
                      </h3>
                      <div className="space-y-2">
                        {item.alerts.map((alert, alertIndex) => {
                          const rowKey = `${item.name}__${alertIndex}`;
                          const isOpen = !!expandedOrderItems[rowKey];
                          return (
                            <div key={alertIndex} className="bg-white dark:bg-slate-600 rounded-lg">
                              <button
                                type="button"
                                onClick={() => toggleOrderItem(item.name, alertIndex)}
                                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-500 rounded-lg"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {alert.color} - {alert.size}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-6">
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                      Order: {alert.new_order} units
                                    </div>
                                    {alert.order_date && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {alert.order_date}
                                      </div>
                                    )}
                                  </div>
                                  <div className={`p-2 rounded-xl ${isOpen ? 'bg-danier-gold text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                  </div>
                                </div>
                              </button>

                              {isOpen && (
                                <div className="border-t border-gray-200 dark:border-slate-700 p-4 text-sm grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div>
                                    <div className="text-gray-500 dark:text-gray-400">Item Number</div>
                                    <div className="text-gray-800 dark:text-gray-200 font-medium">{alert.item_number || '-'}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500 dark:text-gray-400">Current Stock</div>
                                    <div className="text-gray-800 dark:text-gray-200 font-medium">{alert.current_stock}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500 dark:text-gray-400">Required</div>
                                    <div className="text-gray-800 dark:text-gray-200 font-medium">{alert.required_threshold}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500 dark:text-gray-400">Shortage</div>
                                    <div className="text-red-600 dark:text-red-400 font-bold">-{alert.shortage}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Healthy Stock Modal */}
      {showHealthyStockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-danier-dark dark:text-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-emerald-600" />
                Items with Healthy Stock Levels
              </h2>
              <button 
                onClick={() => setShowHealthyStockModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {healthyStockItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No items with healthy stock levels</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {healthyStockItems.map((item, index) => (
                    <div key={index} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                          {item.name}
                        </h3>
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      </div>
                      <div className="text-sm text-emerald-700 dark:text-emerald-300">
                        Total Stock: {item.total_stock} units
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
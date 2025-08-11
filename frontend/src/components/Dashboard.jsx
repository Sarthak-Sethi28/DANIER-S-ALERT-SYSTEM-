import React, { useState, useEffect, useRef } from 'react';
import { getSpecificKeyItemAlerts, getAllKeyItemsWithAlerts, sendItemSpecificAlert } from '../services/api';
import { ChevronDown, ChevronUp, AlertTriangle, Package, Mail, RefreshCw, Send, Search as SearchIcon } from 'lucide-react';
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
      if (!document.hidden) {
        console.log('🔄 Dashboard visible - refreshing data...');
        loadKeyItems();
      }
    };

    const handleFocus = () => {
      console.log('🔄 Dashboard focused - refreshing data...');
      loadKeyItems();
    };

    const handleThresholdsUpdated = () => {
      console.log('🔄 Thresholds updated - refreshing dashboard...');
      loadKeyItems();
    };

    // Listen for page visibility changes and window focus
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
      const arr = (batch.key_items || []).map(k => ({
        name: k.name,
        total_stock: k.total_stock,
        variants_count: (k.alerts || []).length,
        low_stock_count: k.alert_count,
      }));

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
    if (shortage >= 10) return { color: 'text-red-600', bg: 'bg-red-50', label: 'CRITICAL' };
    if (shortage >= 5) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'HIGH' };
    return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'MEDIUM' };
  };

  const handleSendEmail = async (itemName, e) => {
    e.stopPropagation(); // Prevent expanding the item
    
    // Immediate fast popup
    alert(`Creating email for ${itemName}... It will be sent within ~10 seconds.`);
    // Fire and continue without blocking UI
    try {
      sendItemSpecificAlert(itemName).catch(() => {/* no-op background */});
    } catch (error) {
      console.error('Error sending email:', error);
      // Swallow, background already launched
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading inventory alerts...</span>
        </div>
      </div>
    );
  }

  // Show helpful error message when no files are found
  if (error && error.type === 'no-files') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Inventory Data Found</h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
          </div>
          
          {error.help && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">{error.help.title}</h3>
              <div className="space-y-3">
                {error.help.steps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-blue-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Tip:</strong> Make sure your inventory file is in Excel format (.xlsx) and contains the required columns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show general error message
  if (error && error.type === 'error') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
          </div>
          
          <button 
            onClick={() => {
              setError(null);
              loadKeyItems();
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-200">Key Items Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Monitor low stock alerts for critical inventory items</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Compact Quick Search */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-lg">
              <SearchIcon className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                placeholder="Quick search article..."
                className="bg-transparent outline-none text-sm w-48 dark:text-yellow-100"
              />
              <button
                onClick={handleQuickSearch}
                disabled={searching || !searchTerm.trim()}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >Go</button>
            </div>
            <button
              onClick={loadKeyItems}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{getTotalAlerts()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Low Stock Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Items Grid */}
      <div className="space-y-4">
        {keyItems.map((item) => (
          <div key={item.name} ref={(el)=> { itemRefs.current[item.name] = el; }} className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
            {/* Item Header */}
            <div 
              className={`p-6 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${
                item.low_stock_count > 0 ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
              }`}
              onClick={() => toggleExpanded(item.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4">
                    {item.low_stock_count > 0 ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <Package className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-yellow-100">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.low_stock_count > 0 
                        ? `${item.low_stock_count} variants need attention`
                        : 'All variants have adequate stock'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {item.low_stock_count > 0 && (
                    <>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                        {item.low_stock_count} alerts
                      </span>
                      <button
                        onClick={(e) => handleSendEmail(item.name, e)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
                        title="Send email alert for this item"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {expandedItems[item.name] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedItems[item.name] && (
              <div className="border-t border-gray-200 dark:border-zinc-700">
                {loadingAlerts[item.name] ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2 dark:text-gray-300">Loading alerts for {item.name}...</p>
                  </div>
                ) : alerts[item.name] && alerts[item.name].length > 0 ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-yellow-200">
                        Low Stock Details - {item.name}
                      </h4>
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-zinc-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Color</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Size</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Current Stock</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Required</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Shortage</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Priority</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
                          {alerts[item.name].map((alert, index) => {
                            const urgency = getUrgencyLevel(alert.shortage);
                            return (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-yellow-100">{alert.color}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{alert.size}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{alert.current_stock}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{alert.required_threshold}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-red-600">-{alert.shortage}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgency.bg} ${urgency.color}`}>
                                    {urgency.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-600 dark:text-gray-300">
                    <Package className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p>All variants for {item.name} have adequate stock levels</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {keyItems.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-yellow-100 mb-2">No Inventory Data</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Upload an inventory report to see key items stock levels and alerts
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
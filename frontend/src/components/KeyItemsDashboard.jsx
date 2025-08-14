import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Package } from 'lucide-react';
import { getAllKeyItemsWithAlerts } from '../services/api';
import { API_BASE_URL } from '../config';

const KeyItemsDashboard = () => {
  const [keyItems, setKeyItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllKeyItemsWithAlerts();
  }, []);

  // Auto-refresh when component becomes visible (e.g., returning from upload)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && keyItems.length === 0) {
        console.log('🔄 Component visible with no data - refreshing...');
        loadAllKeyItemsWithAlerts();
      }
    };

    const handleFocus = () => {
      if (keyItems.length === 0) {
        console.log('🔄 Window focused with no data - refreshing...');
        loadAllKeyItemsWithAlerts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [keyItems.length]);

  const loadAllKeyItemsWithAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Loading key items with ultra-fast batch processing...');
      
      // Use single ultra-fast batch call
      const response = await getAllKeyItemsWithAlerts();
      const items = response.key_items || [];
      
      if (items.length > 0) {
        setKeyItems(items);
        console.log(`✅ Loaded ${items.length} items with ${items.reduce((sum, item) => sum + (item.alert_count || 0), 0)} total alerts`);
      } else {
        console.log('⚠️ No items loaded');
        setKeyItems([]);
        
        // Check if this is a "no files" situation and show helpful message
        if (response.message && response.message.includes('No inventory files found')) {
          setError({
            type: 'no-files',
            message: response.message,
            help: response.help
          });
        } else {
          setError('No key items found in the current inventory file.');
        }
      }

      console.log('✅ Data loading complete');
    } catch (err) {
      console.error('❌ Error loading key items:', err);
      setError('Failed to load key items. Please try refreshing the page.');
      setKeyItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemName) => {
    setExpandedItems(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading key items with alerts...</p>
            <p className="text-sm text-gray-500">Ultra-fast batch processing</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{typeof error === 'string' ? error : error.message}</p>
            {typeof error === 'object' && error.help && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold">{error.help.title}</p>
                <ul className="mt-2 space-y-1">
                  {error.help.steps.map((step, index) => (
                    <li key={index} className="text-left">{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Key Items Dashboard
          </h2>
          <p className="text-gray-600">
            Click on any key item to view detailed stock alerts
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <p className="text-sm text-green-600">
              ⚡ Ultra-fast batch processing • {keyItems.length} items loaded
            </p>
            <button
              onClick={loadAllKeyItemsWithAlerts}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {keyItems.map((item) => {
            const itemName = item.name || item?.name;
            const alertCount = item.alert_count || item?.alert_count || 0;
            const alerts = item.alerts || [];
            const totalStock = item.total_stock ?? item?.total_stock ?? 0;
            const colorTotals = item.color_totals || [];
            
            return (
              <div key={itemName} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(itemName)}
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-800">{itemName}</span>
                    <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Total stock: {totalStock}
                    </span>
                    {alertCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        {alertCount} alerts
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {expandedItems[itemName] ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>
                
                {expandedItems[itemName] && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    {colorTotals.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Total by Colour</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {colorTotals.map((c, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                              <div className="text-gray-800 font-medium">{c.color || 'N/A'}</div>
                              <div className="text-gray-900 font-bold">{c.total_stock} units</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No data available for colour totals.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KeyItemsDashboard; 
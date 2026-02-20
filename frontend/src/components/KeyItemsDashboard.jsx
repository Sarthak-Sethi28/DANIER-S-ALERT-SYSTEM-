import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import { useData } from '../DataContext';

const SkeletonRow = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
    <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="w-5 h-5 bg-gray-200 rounded" />
    </div>
  </div>
);

const KeyItemsDashboard = () => {
  const { batchAlerts, batchLoading, fetchBatch } = useData();
  const [expandedItems, setExpandedItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const keyItems = batchAlerts?.key_items || [];
  const loading = batchLoading && !keyItems.length;
  const error = !batchLoading && !keyItems.length && batchAlerts?.message?.includes('No inventory files found')
    ? { type: 'no-files', message: batchAlerts.message, help: batchAlerts.help }
    : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBatch(true);
    setRefreshing(false);
  };

  const toggleItem = (itemName) => {
    setExpandedItems(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-1">Key Items Dashboard</h2>
            <p className="text-gray-500 text-sm">Loading inventory data...</p>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error && !keyItems.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{error.message}</p>
            {error.help && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold">{error.help.title}</p>
                <ul className="mt-2 space-y-1">
                  {error.help.steps.map((step, index) => (
                    <li key={index} className="text-left">{step}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => fetchBatch(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Key Items Dashboard</h2>
          <p className="text-gray-600">Click on any key item to view detailed stock alerts</p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <p className="text-sm text-green-600">{keyItems.length} items loaded</p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {keyItems.map((item) => {
            const itemName = item.name;
            const alertCount = item.alert_count || 0;
            const totalStock = item.total_stock ?? 0;
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

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, AlertTriangle, Info } from 'lucide-react';
import { getThreshold } from '../services/api';

const Settings = () => {
  const [threshold, setThreshold] = useState(120);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getThreshold();
      setThreshold(data.threshold);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-danier-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <SettingsIcon className="w-8 h-8 text-danier-gold mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-danier-dark">System Settings</h2>
            <p className="text-gray-600">
              Configure system parameters and view current settings
            </p>
          </div>
        </div>

        {/* Stock Threshold Setting */}
        <div className="mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-medium text-danier-dark">Stock Threshold</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Threshold
                </label>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-danier-gold mr-2">
                    {threshold}
                  </span>
                  <span className="text-gray-500">units</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Items with stock below this level will trigger alerts
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">How it works</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Items with stock &lt; {threshold} trigger alerts</li>
                  <li>• System groups by Item Description</li>
                  <li>• Sums Grand Total column for each group</li>
                  <li>• Email alerts sent automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Info className="w-6 h-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-danier-dark">System Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">File Requirements</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Excel (.xlsx) format only</li>
                  <li>• Must contain "Item Description" column</li>
                  <li>• Must contain "Grand Total" column</li>
                  <li>• Data grouped by Item Description</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Email Configuration</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• SMTP server: smtp.gmail.com</li>
                  <li>• Port: 587 (TLS)</li>
                  <li>• From: alerts@danier.ca</li>
                  <li>• HTML formatted alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Levels */}
        <div className="mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-danier-dark mb-4">Alert Levels</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-red-800">Critical</span>
                </div>
                <p className="text-sm text-red-700">
                  Stock &lt; 50 units
                </p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-orange-800">Low</span>
                </div>
                <p className="text-sm text-orange-700">
                  Stock 50-79 units
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-yellow-800">Warning</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Stock 80-{threshold-1} units
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Information */}
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-danier-dark mb-4">Database & Storage</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Data Storage</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• SQLite database (local)</li>
                  <li>• Upload logs and history</li>
                  <li>• Low stock item records</li>
                  <li>• Email recipient management</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">System Features</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Automatic email alerts</li>
                  <li>• Upload history tracking</li>
                  <li>• Recipient management</li>
                  <li>• Real-time dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Note</h4>
          <p className="text-sm text-yellow-700">
            The stock threshold is currently set to {threshold} units. This setting is configured 
            in the backend environment variables and requires a system restart to change. 
            Contact your system administrator for threshold modifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
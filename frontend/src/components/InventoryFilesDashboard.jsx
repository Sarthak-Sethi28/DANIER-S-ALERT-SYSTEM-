import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, AlertTriangle, Star, XCircle, CheckCircle, Zap, Target, BarChart3 } from 'lucide-react';
import { getEnhancedInventoryFiles, getSmartPerformanceAnalysis } from '../services/api';

const InventoryFilesDashboard = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile1, setSelectedFile1] = useState('');
  const [selectedFile2, setSelectedFile2] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  useEffect(() => {
    fetchInventoryFiles();
  }, []);

  const fetchInventoryFiles = async () => {
    try {
      setLoading(true);
      // Add timestamp to force fresh data and avoid browser cache
      const response = await getEnhancedInventoryFiles();
      console.log('📊 Fetched files with data:', response.files?.slice(0, 3).map(f => ({
        filename: f.filename,
        ki00_items: f.ki00_items_count,
        low_stock: f.low_stock_count
      })));
      setFiles(response.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };



  const runSmartAnalysis = async () => {
    if (!selectedFile1 || !selectedFile2) {
      alert('Please select two files to compare');
      return;
    }

    try {
      setAnalyzing(true);
      const result = await getSmartPerformanceAnalysis(selectedFile1, selectedFile2);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error running analysis:', error);
      alert('Error running analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (typeof timestamp === 'string') return timestamp;
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getInsightBadge = (category) => {
    const badges = {
      'EXCELLENT': { color: 'bg-green-100 text-green-800', icon: '⭐' },
      'POOR': { color: 'bg-red-100 text-red-800', icon: '📉' },
      'URGENT': { color: 'bg-orange-100 text-orange-800', icon: '🚨' },
      'NEW': { color: 'bg-blue-100 text-blue-800', icon: '🆕' },
      'DISCONTINUED': { color: 'bg-gray-100 text-gray-800', icon: '❌' },
      'TOP_SALES': { color: 'bg-purple-100 text-purple-800', icon: '🏆' },
      'WORST': { color: 'bg-red-100 text-red-800', icon: '📉' }
    };
    
    const badge = badges[category] || { color: 'bg-gray-100 text-gray-800', icon: '📊' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon} {category}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <BarChart3 className="inline-block w-8 h-8 mr-3 text-blue-600" />
            Smart Performance Analysis
          </h1>
          <p className="text-gray-600">
            Intelligent business insights and actionable recommendations for your inventory performance
          </p>
        </div>



        {/* File Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Select Files for Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First File (Older)
              </label>
              <select
                value={selectedFile1}
                onChange={(e) => setSelectedFile1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a file...</option>
                {files.map((file) => (
                  <option key={file.filename} value={file.filename}>
                    {file.filename} ({formatDateTime(file.upload_date)})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Second File (Newer)
              </label>
              <select
                value={selectedFile2}
                onChange={(e) => setSelectedFile2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a file...</option>
                {files.map((file) => (
                  <option key={file.filename} value={file.filename}>
                    {file.filename} ({formatDateTime(file.upload_date)})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={runSmartAnalysis}
            disabled={!selectedFile1 || !selectedFile2 || analyzing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Smart Analysis
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Excellent Performers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResult.business_insights?.summary?.excellent_performers || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Poor Performers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResult.business_insights?.summary?.poor_performers || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgent Restock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResult.business_insights?.summary?.urgent_restock_needed || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResult.business_insights?.summary?.total_items_analyzed || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {analysisResult.business_insights?.recommendations && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Actionable Recommendations
                </h3>
                <div className="space-y-3">
                  {analysisResult.business_insights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg mr-3">💡</div>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Analysis Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'excellent', label: 'Excellent Performers', icon: Star, color: 'text-green-600' },
                    { id: 'urgent', label: 'Urgent Restock', icon: AlertTriangle, color: 'text-orange-600' },
                    { id: 'poor', label: 'Poor Performers', icon: XCircle, color: 'text-red-600' },
                    { id: 'new', label: 'New Products', icon: TrendingUp, color: 'text-blue-600' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {(() => {
                  const data = analysisResult.business_insights?.[`${activeTab}_performers`] || 
                              analysisResult.business_insights?.[activeTab === 'new' ? 'new_products' : 'discontinued_products'] || [];
                  
                  if (data.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        No items in this category
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Color/Size
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock Change
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Business Insight
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.color} / {item.size}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-900">
                                    {item.old_stock} → {item.new_stock}
                                  </span>
                                  <span className={`text-sm font-medium ${
                                    item.change < 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ({item.change > 0 ? '+' : ''}{item.change})
                                  </span>
                                  {getInsightBadge(item.category)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-md">
                                  {item.business_insight}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Available Inventory Files ({files.length})
            </h2>
            <button 
              onClick={fetchInventoryFiles}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KI00 Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low Stock
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDateTime(file.upload_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{file.ki00_items_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{file.low_stock_count || 0}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilesDashboard; 
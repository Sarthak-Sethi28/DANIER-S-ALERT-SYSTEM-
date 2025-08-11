import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReport, checkHealth } from '../services/api';
import { API_BASE_URL } from '../config';
import { Upload, AlertCircle, CheckCircle, ArrowRight, Wifi, WifiOff, Clock } from 'lucide-react';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  // Check backend connection on component mount
  useEffect(() => {
    let isMounted = true;

    const doHealthCheck = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        await checkHealth(controller.signal);
        if (isMounted) setConnectionStatus('connected');
        clearTimeout(timer);
      } catch (err) {
        if (isMounted) setConnectionStatus('error');
        // Auto-retry in background every 3s until recovered
        if (isMounted) {
          setTimeout(doHealthCheck, 3000);
        }
      }
    };

    doHealthCheck();

    return () => { isMounted = false; };
  }, []);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setError('');
        setSuccess(false);
      } else {
        setError('Please select a valid Excel file (.xlsx format)');
        setFile(null);
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (connectionStatus === 'error') {
      setError('Backend server is not running. Please contact your administrator.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Simulate progress for better UX (faster)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 150);

      const result = await uploadReport(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('Upload result:', result);
      
      // Ensure we mark connected after a successful backend action
      setConnectionStatus('connected');
      
      // Show brief success message
      setSuccess(true);
      
      // Auto-redirect to Dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Upload error:', err);
      setUploadProgress(0);
      
      // Enhanced error handling
      if (err.code === 'ECONNREFUSED' || /Network Error/i.test(err.message || '')) {
        setError('❌ Network Error: Cannot connect to server.\n\n🔧 Troubleshooting:\n1. Check if backend server is running\n2. Verify backend is reachable\n3. Contact your system administrator');
        setConnectionStatus('error');
      } else if (err.response?.status === 400) {
        setError(`📋 File Format Error: ${err.response.data.detail}\n\nPlease check your Excel file format.`);
      } else if (err.response?.status === 500) {
        setError('🔧 Server Error: Internal processing error. Please try again or contact support.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const ConnectionStatus = () => {
    switch (connectionStatus) {
      case 'checking':
        return (
          <div className="flex items-center text-yellow-600 text-sm mb-4">
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Checking server connection to {API_BASE_URL}...
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center text-green-600 text-sm mb-4">
            <Wifi className="w-4 h-4 mr-2" />
            Server connected ✅ {API_BASE_URL}
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600 text-sm mb-4">
            <WifiOff className="w-4 h-4 mr-2" />
            Server not available ❌ {API_BASE_URL}
          </div>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Upload Successful! 🎉</h2>
          <p className="text-green-700 mb-4">Inventory file processed successfully</p>
          <div className="flex items-center justify-center text-green-600">
            <span className="mr-2">Redirecting to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Upload className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Upload Inventory Report</h1>
            <p className="text-sm text-gray-500">Fast & Efficient Processing</p>
          </div>
        </div>

        <ConnectionStatus />

        <div className="mb-6">
          <p className="text-gray-600 mb-2 font-medium">Upload your daily inventory Excel file</p>
          <p className="text-sm text-gray-500 mb-4">
            📋 Expected format: Detailed inventory report with Item Description, Variant Color, Variant Code, Grand Total, Season Code
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 inline mr-2" />
            <div className="inline-block">
              <span className="text-red-800 font-medium">Upload Failed</span>
              <div className="text-red-700 mt-2 whitespace-pre-line text-sm">{error}</div>
              {!/Network Error/i.test(error) && (
                <div className="mt-3 p-3 bg-red-100 rounded border text-sm text-red-800">
                  <strong>💡 File Format Requirements:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Must be a detailed inventory report (.xlsx format)</li>
                    <li>Should contain columns: Item Description, Variant Color, Variant Code, Grand Total, Season Code</li>
                    <li>Should list individual product variants with stock quantities</li>
                    <li>Should NOT be a summary/pivot table with unnamed columns</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={uploading || connectionStatus === 'error'}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer flex flex-col items-center justify-center ${
              uploading || connectionStatus === 'error' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            } p-4 rounded-lg transition-colors`}
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <span className="text-lg font-medium text-gray-700 mb-2">
              Choose Excel File (.xlsx)
            </span>
            <span className="text-sm text-gray-500">
              Click here to select your inventory report
            </span>
          </label>

          {file && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />
              <span className="text-green-800 font-medium">✅ Selected: {file.name}</span>
              <p className="text-sm text-gray-600 mt-1">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-600">
                Processing... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading || connectionStatus === 'error'}
          className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
            !file || uploading || connectionStatus === 'error'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Upload...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload & Process Report
            </div>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          ⚡ Optimized for speed and reliability • Supports files up to 50MB
        </p>
      </div>
    </div>
  );
};

export default UploadPage; 
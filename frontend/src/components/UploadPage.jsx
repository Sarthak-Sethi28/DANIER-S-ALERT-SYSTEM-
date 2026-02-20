import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReport, checkHealth } from '../services/api';
import { API_BASE_URL } from '../config';
import { 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  Wifi, 
  WifiOff, 
  Clock, 
  FileText, 
  Sparkles, 
  Zap,
  Cloud,
  FileCheck,
  Loader2
} from 'lucide-react';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
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

  const handleFileChange = useCallback((selectedFile) => {
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

  const handleInputChange = useCallback((e) => {
    handleFileChange(e.target.files[0]);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  }, [handleFileChange]);

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
          <div className="flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-6">
            <Clock className="w-5 h-5 mr-3 text-amber-600 animate-spin" />
            <span className="text-amber-800 dark:text-amber-200 font-medium">
              Checking server connection...
            </span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl mb-6">
            <Wifi className="w-5 h-5 mr-3 text-emerald-600" />
            <span className="text-emerald-800 dark:text-emerald-200 font-medium">
              Server connected ✅
            </span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6">
            <WifiOff className="w-5 h-5 mr-3 text-red-600" />
            <span className="text-red-800 dark:text-red-200 font-medium">
              Server not available ❌
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-premium dark:card-premium-dark p-8 text-center animate-scale-in">
          <div className="relative mb-6">
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto animate-bounce-subtle" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gradient-gold mb-3">Upload Successful! 🎉</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Inventory file processed successfully
          </p>
          <div className="flex items-center justify-center text-danier-gold font-medium">
            <span className="mr-2">Redirecting to Dashboard</span>
            <ArrowRight className="w-5 h-5 animate-bounce-subtle" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-gold rounded-2xl shadow-gold flex items-center justify-center animate-float">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gradient-gold mb-3">
          Upload Inventory Report
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Fast & Efficient Processing
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center justify-center">
          <Zap className="w-4 h-4 mr-1 text-danier-gold" />
          Optimized for speed and reliability • Supports files up to 50MB
        </p>
      </div>

      <div className="card-premium dark:card-premium-dark p-8 animate-slide-up">
        <ConnectionStatus />

        {/* File Requirements */}
        <div className="mb-8 p-6 bg-gradient-to-r from-luxury-cream to-luxury-champagne dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-danier-gold/20">
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-danier-gold mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-danier-dark dark:text-white mb-2">
                Expected File Format
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Upload your detailed inventory Excel file with the following columns:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-danier-gold rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Item Description</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-danier-gold rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Variant Color</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-danier-gold rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Variant Code</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-danier-gold rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Grand Total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-danier-gold rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Season Code</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-slide-down">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Upload Failed</h4>
                <div className="text-red-700 dark:text-red-300 text-sm whitespace-pre-line mb-4">{error}</div>
                {!/Network Error/i.test(error) && (
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800">
                    <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">💡 File Format Requirements:</h5>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Must be a detailed inventory report (.xlsx format)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Should contain required columns listed above</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Should list individual product variants with stock quantities</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Should NOT be a summary/pivot table with unnamed columns</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-danier-gold bg-danier-gold/5 scale-105'
              : file
              ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-danier-gold hover:bg-danier-gold/5'
          } ${uploading || connectionStatus === 'error' ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading || connectionStatus === 'error'}
          />

          {file ? (
            <div className="animate-scale-in">
              <FileCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce-subtle" />
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                File Selected ✅
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">{file.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <Upload className={`w-16 h-16 mx-auto mb-4 transition-all duration-300 ${
                isDragOver ? 'text-danier-gold scale-110' : 'text-gray-400'
              }`} />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {isDragOver ? 'Drop your file here' : 'Choose Excel File (.xlsx)'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Drag and drop your inventory report here, or click to browse
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-danier-gold/10 border border-danier-gold/30 rounded-xl text-danier-dark dark:text-danier-gold text-sm font-medium">
                <Upload className="w-4 h-4" />
                <span>Browse Files</span>
              </div>
            </div>
          )}

          {uploading && (
            <div className="mt-6 animate-fade-in">
              <div className="bg-gradient-to-r from-danier-gold/20 to-danier-gold/10 rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className="bg-gradient-gold h-full rounded-full transition-all duration-300 shadow-inner"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-danier-gold">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Processing... {uploadProgress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading || connectionStatus === 'error'}
          className={`btn-premium w-full mt-8 py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
            !file || uploading || connectionStatus === 'error'
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-gold text-white shadow-gold hover:shadow-luxury hover:scale-105'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Processing Upload...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <Upload className="w-6 h-6" />
              <span>Upload & Process Report</span>
              <Sparkles className="w-5 h-5" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadPage; 
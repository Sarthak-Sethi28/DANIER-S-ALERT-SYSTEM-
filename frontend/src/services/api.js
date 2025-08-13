import { API_BASE_URL } from '../config';

// Enhanced API service with retry logic and better error handling
class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add timeout to all requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const requestOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.log(`API attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          clearTimeout(timeoutId);
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async checkHealth(signal) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check
      
      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }
      
      const response = await fetch(`${this.baseUrl}/health`, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  async uploadReport(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for uploads
    
    try {
      const response = await fetch(`${this.baseUrl}/upload-report`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Key Items and Alerts
  async getAllKeyItemsWithAlerts() {
    return this.makeRequest('/key-items/batch-alerts');
  }

  async getKeyItemsSummary() {
    return this.makeRequest('/key-items/summary');
  }

  async getKeyItemsList() {
    return this.makeRequest('/key-items/list');
  }

  async getSpecificKeyItemAlerts(itemName) {
    return this.makeRequest(`/key-items/${encodeURIComponent(itemName)}/alerts`);
  }

  // File Management
  async getInventoryFiles() {
    return this.makeRequest('/inventory-files');
  }

  async getEnhancedInventoryFiles() {
    return this.makeRequest('/files/enhanced-list');
  }

  async getSmartPerformanceAnalysis(file1, file2) {
    return this.makeRequest(`/files/smart-analysis/${file1}/${file2}`);
  }

  async getPerformanceAnalysis() {
    return this.makeRequest('/files/performance-analysis');
  }

  async getFileArchive() {
    return this.makeRequest('/files/archive');
  }

  async downloadArchiveFile(filename) {
    const response = await fetch(`${this.baseUrl}/files/archive/${encodeURIComponent(filename)}/download`);
    return response.blob();
  }

  async getFileAlerts(filename) {
    return this.makeRequest(`/inventory-files/${encodeURIComponent(filename)}/alerts`);
  }

  // Search
  async searchArticle(searchTerm) {
    return this.makeRequest(`/search/article/${encodeURIComponent(searchTerm)}`);
  }

  // Email Management
  async sendEmailAlert(itemName = null) {
    const formData = new FormData();
    if (itemName) formData.append('item_name', itemName);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${this.baseUrl}/email/send-alert`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Email alert failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Email alert error:', error);
      throw error;
    }
  }

  async sendItemSpecificAlert(itemName) {
    return this.makeRequest(`/email/send-item-alert/${encodeURIComponent(itemName)}`, {
      method: 'POST',
    });
  }

  async getEmailStatus() {
    return this.makeRequest('/email/status');
  }

  // Recipients Management
  async getRecipients() {
    return this.makeRequest('/recipients');
  }

  async addRecipient(email, name, department) {
    const formData = new FormData();
    formData.append('email', email);
    if (name) formData.append('name', name);
    if (department) formData.append('department', department);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${this.baseUrl}/recipients`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Add recipient failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Add recipient error:', error);
      throw error;
    }
  }

  async updateRecipient(email, name, department) {
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (department) formData.append('department', department);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${this.baseUrl}/recipients/${encodeURIComponent(email)}`, {
        method: 'PUT',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Update recipient failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Update recipient error:', error);
      throw error;
    }
  }

  async deleteRecipient(email) {
    return this.makeRequest(`/recipients/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  }

  // Threshold Management
  async getThresholdAnalysis() {
    return this.makeRequest('/threshold-analysis');
  }

  async getThresholdAnalysisForFile(filename) {
    return this.makeRequest(`/threshold-analysis/${encodeURIComponent(filename)}`);
  }

  async setCustomThreshold(itemName, size, color, threshold) {
    const formData = new FormData();
    formData.append('item_name', itemName);
    formData.append('size', size);
    formData.append('color', color);
    formData.append('threshold', threshold.toString());
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${this.baseUrl}/thresholds/set`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to set threshold: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Set threshold error:', error);
      throw error;
    }
  }

  async getCustomThreshold(itemName, size, color) {
    return this.makeRequest(`/thresholds/get/${encodeURIComponent(itemName)}/${encodeURIComponent(size)}/${encodeURIComponent(color)}`);
  }

  async getAllCustomThresholds() {
    return this.makeRequest('/thresholds/all');
  }

  async resetCustomThreshold(itemName, size, color) {
    return this.makeRequest(`/thresholds/reset/${encodeURIComponent(itemName)}/${encodeURIComponent(size)}/${encodeURIComponent(color)}`, {
      method: 'DELETE',
    });
  }

  // Settings and History
  async getThreshold() {
    return this.makeRequest('/settings/threshold');
  }

  async getUploadHistory() {
    return this.makeRequest('/upload-history');
  }

  async getTodayAlerts() {
    return this.makeRequest('/alerts/today');
  }

  // Cache Management
  async clearCache() {
    return this.makeRequest('/clear-cache', {
      method: 'POST',
    });
  }

  // Fast file list endpoint
  async getFilesListFast() {
    return this.makeRequest('/files/list-fast');
  }

  // Fast upload history endpoint
  async getUploadHistoryFast() {
    return this.makeRequest('/upload-history');
  }

  // Fast recipients endpoint
  async getRecipientsFast() {
    return this.makeRequest('/recipients');
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export individual functions for backward compatibility
export const checkHealth = (signal) => apiService.checkHealth(signal);
export const uploadReport = (file) => apiService.uploadReport(file);
export const getAllKeyItemsWithAlerts = () => apiService.getAllKeyItemsWithAlerts();
export const getKeyItemsSummary = () => apiService.getKeyItemsSummary();
export const getKeyItemsList = () => apiService.getKeyItemsList();
export const getSpecificKeyItemAlerts = (itemName) => apiService.getSpecificKeyItemAlerts(itemName);
export const getInventoryFiles = () => apiService.getInventoryFiles();
export const getEnhancedInventoryFiles = () => apiService.getEnhancedInventoryFiles();
export const getSmartPerformanceAnalysis = (file1, file2) => apiService.getSmartPerformanceAnalysis(file1, file2);
export const getPerformanceAnalysis = () => apiService.getPerformanceAnalysis();
export const getFileArchive = () => apiService.getFileArchive();
export const downloadArchiveFile = (filename) => apiService.downloadArchiveFile(filename);
export const getFileAlerts = (filename) => apiService.getFileAlerts(filename);
export const searchArticle = (searchTerm) => apiService.searchArticle(searchTerm);
export const sendEmailAlert = (itemName) => apiService.sendEmailAlert(itemName);
export const sendItemSpecificAlert = (itemName) => apiService.sendItemSpecificAlert(itemName);
export const getEmailStatus = () => apiService.getEmailStatus();
export const getRecipients = () => apiService.getRecipients();
export const addRecipient = (email, name, department) => apiService.addRecipient(email, name, department);
export const updateRecipient = (email, name, department) => apiService.updateRecipient(email, name, department);
export const deleteRecipient = (email) => apiService.deleteRecipient(email);
export const getThresholdAnalysis = () => apiService.getThresholdAnalysis();
export const getThresholdAnalysisForFile = (filename) => apiService.getThresholdAnalysisForFile(filename);
export const setCustomThreshold = (itemName, size, color, threshold) => apiService.setCustomThreshold(itemName, size, color, threshold);
export const getCustomThreshold = (itemName, size, color) => apiService.getCustomThreshold(itemName, size, color);
export const getAllCustomThresholds = () => apiService.getAllCustomThresholds();
export const resetCustomThreshold = (itemName, size, color) => apiService.resetCustomThreshold(itemName, size, color);
export const getThreshold = () => apiService.getThreshold();
export const getUploadHistory = () => apiService.getUploadHistory();
export const getTodayAlerts = () => apiService.getTodayAlerts();
export const clearCache = () => apiService.clearCache();
export const getFilesListFast = () => apiService.getFilesListFast();
export const getUploadHistoryFast = () => apiService.getUploadHistoryFast();
export const getRecipientsFast = () => apiService.getRecipientsFast();

// Export the service instance for advanced usage
export default apiService; 
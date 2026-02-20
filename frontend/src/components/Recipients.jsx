import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Edit, Users, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { getRecipientsFast, addRecipient, deleteRecipient, updateRecipient, getEmailStatus } from '../services/api';

const Recipients = () => {
  const [recipients, setRecipients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState({});
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    department: ''
  });
  
  // Status states
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchRecipients();
    fetchEmailStatus();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await getRecipientsFast();
      setRecipients(response.recipients || []);
      setStats(response.stats || {});
    } catch (error) {
      console.error('Error fetching recipients:', error);
      showMessage('Error loading recipients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStatus = async () => {
    try {
      const status = await getEmailStatus();
      setEmailStatus(status);
    } catch (error) {
      console.error('Error fetching email status:', error);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingEmail) {
        // Update existing recipient
        result = await updateRecipient(editingEmail, formData.name, formData.department);
        if (result && result.success) {
          showMessage(result.message || 'Recipient updated successfully');
        } else {
          showMessage(result?.message || 'Failed to update recipient', 'error');
          return;
        }
      } else {
        // Add new recipient
        result = await addRecipient(formData.email, formData.name, formData.department);
        if (result && result.success) {
          showMessage(result.message || 'Recipient added successfully');
        } else {
          showMessage(result?.message || 'Failed to add recipient', 'error');
          return;
        }
      }
      
      // Reset form
      setFormData({ email: '', name: '', department: '' });
      setShowAddForm(false);
      setEditingEmail(null);
      
      // Refresh list
      await fetchRecipients();
      
    } catch (error) {
      console.error('Error saving recipient:', error);
      showMessage(error.message || error.response?.data?.detail || 'Error saving recipient', 'error');
    }
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) {
      return;
    }
    
    try {
      await deleteRecipient(email);
      showMessage('Recipient removed successfully');
      fetchRecipients();
    } catch (error) {
      console.error('Error deleting recipient:', error);
      showMessage('Error removing recipient', 'error');
    }
  };

  const handleEdit = (recipient) => {
    setEditingEmail(recipient.email);
    setFormData({
      email: recipient.email,
      name: recipient.name || '',
      department: recipient.department || ''
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingEmail(null);
    setFormData({ email: '', name: '', department: '' });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Mail className="w-8 h-8 mr-3 text-blue-600" />
            Email Recipients Management
          </h1>
          <p className="text-gray-600">Manage who receives stock alert emails</p>
        </div>

        {/* Email Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${emailStatus.smtp_configured ? 'bg-green-100' : 'bg-red-100'}`}>
                {emailStatus.smtp_configured ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Email Service Status</h3>
                <p className="text-gray-600">
                  {emailStatus.smtp_configured ? 'Email service is configured and ready' : 'Email service not configured'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">SMTP Host</p>
              <p className="font-medium">{emailStatus.smtp_host || 'Not configured'}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_recipients || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_recipients || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Most Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.most_active?.[0]?.email_count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEmail ? 'Edit Recipient' : 'Add New Recipient'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!!editingEmail}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingEmail ? 'Update' : 'Add'} Recipient
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recipients List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Active Recipients</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Recipient
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emails Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{recipient.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{recipient.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{recipient.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{recipient.email_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {recipient.last_sent ? new Date(recipient.last_sent).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(recipient)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(recipient.email)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {recipients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recipients added yet</p>
                <p className="text-sm">Add recipients to start sending email alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipients; 
import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Edit, Users, Send, AlertCircle, CheckCircle, X, RefreshCw, UserPlus } from 'lucide-react';
import { getRecipientsFast, addRecipient, deleteRecipient, updateRecipient, getEmailStatus } from '../services/api';

const Recipients = () => {
  const [recipients, setRecipients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [formData, setFormData] = useState({ email: '', name: '', department: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchRecipients();
    fetchEmailStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        result = await updateRecipient(editingEmail, formData.name, formData.department);
        if (result && result.success) showMessage(result.message || 'Recipient updated successfully');
        else { showMessage(result?.message || 'Failed to update recipient', 'error'); return; }
      } else {
        result = await addRecipient(formData.email, formData.name, formData.department);
        if (result && result.success) showMessage(result.message || 'Recipient added successfully');
        else { showMessage(result?.message || 'Failed to add recipient', 'error'); return; }
      }
      setFormData({ email: '', name: '', department: '' });
      setShowAddForm(false);
      setEditingEmail(null);
      await fetchRecipients();
    } catch (error) {
      console.error('Error saving recipient:', error);
      showMessage(error.message || error.response?.data?.detail || 'Error saving recipient', 'error');
    }
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;
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
    setFormData({ email: recipient.email, name: recipient.name || '', department: recipient.department || '' });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingEmail(null);
    setFormData({ email: '', name: '', department: '' });
    setShowAddForm(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#ffffff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#e8c96a',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 60px' }} className="animate-fade-in">
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c', margin: '0 auto 16px' }} className="animate-spin" />
          <p style={{ color: '#b0b0c8', fontSize: '1rem' }}>Loading recipients...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 60px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(201,168,76,0.28)' }}>
              <Mail style={{ width: 24, height: 24, color: '#000' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Email Recipients</h1>
              <p style={{ color: '#b0b0c8', fontSize: '0.95rem', margin: '4px 0 0' }}>Manage who receives stock alert emails</p>
            </div>
          </div>
          <button
            onClick={fetchRecipients}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Email Service Status */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: `1px solid ${emailStatus.smtp_configured ? 'rgba(16,185,129,0.2)' : 'rgba(255,61,61,0.2)'}`, borderRadius: 16, padding: '20px 24px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: emailStatus.smtp_configured ? 'rgba(16,185,129,0.12)' : 'rgba(255,61,61,0.12)' }}>
            {emailStatus.smtp_configured
              ? <CheckCircle style={{ width: 20, height: 20, color: '#10b981' }} />
              : <AlertCircle style={{ width: 20, height: 20, color: '#ff6b6b' }} />
            }
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>Email Service Status</div>
            <div style={{ color: emailStatus.smtp_configured ? '#34d399' : '#ff8080', fontSize: '0.875rem' }}>
              {emailStatus.smtp_configured ? 'Gmail SMTP connected and ready' : 'Email service not configured — set SMTP_USER & SMTP_PASS on Render'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#8888a8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>SMTP Host</div>
          <div style={{ color: '#e8c96a', fontWeight: 600, fontSize: '0.9rem' }}>{emailStatus.smtp_host || 'Not configured'}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Active Recipients', value: stats.active_recipients || 0, icon: <Users style={{ width: 20, height: 20 }} />, color: '#3b82f6' },
          { label: 'Total Recipients', value: stats.total_recipients || 0, icon: <Send style={{ width: 20, height: 20 }} />, color: '#10b981' },
          { label: 'Most Active', value: stats.most_active?.[0]?.email_count || 0, icon: <Mail style={{ width: 20, height: 20 }} />, color: '#fb923c' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(5,8,14,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b0b0c8' }}>{s.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Toast */}
      {message && (
        <div style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, background: messageType === 'error' ? 'rgba(255,61,61,0.12)' : 'rgba(16,185,129,0.12)', border: `1px solid ${messageType === 'error' ? 'rgba(255,61,61,0.25)' : 'rgba(16,185,129,0.25)'}`, color: messageType === 'error' ? '#ff8080' : '#34d399', fontWeight: 600, fontSize: '0.9rem' }} className="animate-slide-down">
          {messageType === 'error' ? <AlertCircle style={{ width: 18, height: 18 }} /> : <CheckCircle style={{ width: 18, height: 18 }} />}
          {message}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '24px 28px', marginBottom: 24 }} className="animate-slide-down">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserPlus style={{ width: 20, height: 20, color: '#e8c96a' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {editingEmail ? 'Edit Recipient' : 'Add New Recipient'}
              </h3>
            </div>
            <div onClick={cancelEdit} style={{ padding: 6, borderRadius: 8, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#8888a8' }}>
              <X style={{ width: 16, height: 16 }} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!!editingEmail}
                  placeholder="name@company.com"
                  style={{ ...inputStyle, opacity: editingEmail ? 0.5 : 1 }}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Inventory"
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <div
                onClick={cancelEdit}
                style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#b0b0c8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </div>
              <button
                type="submit"
                style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}
              >
                {editingEmail ? 'Update' : 'Add'} Recipient
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recipients List */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Active Recipients</h3>
          {!showAddForm && (
            <div
              onClick={() => setShowAddForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              Add Recipient
            </div>
          )}
        </div>

        {recipients.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                  {['Email', 'Name', 'Department', 'Emails Sent', 'Last Sent', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(201,168,76,0.04)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recipients.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 20px', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>{r.email}</td>
                    <td style={{ padding: '14px 20px', color: '#d0d0e8', fontSize: '0.9rem' }}>{r.name || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#d0d0e8', fontSize: '0.9rem' }}>{r.department || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#e8c96a', fontWeight: 700, fontSize: '0.9rem' }}>{r.email_count || 0}</td>
                    <td style={{ padding: '14px 20px', color: '#9090a8', fontSize: '0.85rem' }}>
                      {r.last_sent ? new Date(r.last_sent).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div
                          onClick={() => handleEdit(r)}
                          style={{ padding: 6, borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', color: '#60a5fa', transition: 'all 0.2s' }}
                        >
                          <Edit style={{ width: 14, height: 14 }} />
                        </div>
                        <div
                          onClick={() => handleDelete(r.email)}
                          style={{ padding: 6, borderRadius: 8, background: 'rgba(255,61,61,0.1)', border: '1px solid rgba(255,61,61,0.2)', cursor: 'pointer', color: '#ff6b6b', transition: 'all 0.2s' }}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Mail style={{ width: 48, height: 48, margin: '0 auto 12px', color: 'rgba(200,200,220,0.2)' }} />
            <p style={{ color: '#b0b0c8', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>No recipients added yet</p>
            <p style={{ color: '#8888a8', fontSize: '0.85rem', marginBottom: 20 }}>Add recipients to start sending email alerts</p>
            <div
              onClick={() => setShowAddForm(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}
            >
              <Plus style={{ width: 18, height: 18 }} />
              Add Your First Recipient
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipients;

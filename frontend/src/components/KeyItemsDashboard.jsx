import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Package, RefreshCw, Search, Layers } from 'lucide-react';
import { useData } from '../DataContext';

const SkeletonRow = () => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '18px 20px', marginBottom: 10 }} className="loading-elegant">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
        <div style={{ width: 180, height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 8 }} />
        <div style={{ width: 70, height: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 999 }} />
      </div>
      <div style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
    </div>
  </div>
);

const KeyItemsDashboard = () => {
  const { batchAlerts, batchLoading, fetchBatch } = useData();
  const [expandedItems, setExpandedItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const keyItems = useMemo(() => batchAlerts?.key_items || [], [batchAlerts]);
  const loading = batchLoading && !keyItems.length;
  const error = !batchLoading && !keyItems.length && batchAlerts?.message?.includes('No inventory files found')
    ? { type: 'no-files', message: batchAlerts.message, help: batchAlerts.help }
    : null;

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return keyItems;
    const term = searchTerm.toLowerCase();
    return keyItems.filter(i => (i.name || '').toLowerCase().includes(term));
  }, [keyItems, searchTerm]);

  const stats = useMemo(() => {
    const total = keyItems.length;
    const withAlerts = keyItems.filter(i => (i.alert_count || 0) > 0).length;
    const totalStock = keyItems.reduce((s, i) => s + (i.total_stock || 0), 0);
    return { total, withAlerts, totalStock };
  }, [keyItems]);

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
      <div className="max-w-5xl mx-auto animate-fade-in pb-10">
        <div className="card-premium p-8">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 className="text-gradient-gold" style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>Key Items Dashboard</h2>
            <p style={{ color: 'rgba(200,200,220,0.45)', fontSize: '0.85rem' }}>Loading inventory data...</p>
          </div>
          <div>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</div>
        </div>
      </div>
    );
  }

  if (error && !keyItems.length) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-10">
        <div className="card-premium p-12" style={{ textAlign: 'center' }}>
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ff6b6b', opacity: 0.6 }} />
          <h2 className="text-gradient-gold" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>No Inventory Data</h2>
          <p style={{ color: 'rgba(200,200,220,0.5)', marginBottom: 16, fontSize: '0.9rem' }}>{error.message}</p>
          {error.help && (
            <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 16, padding: 24, textAlign: 'left', maxWidth: 420, margin: '0 auto 20px' }}>
              <p style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 12 }}>{error.help.title}</p>
              {error.help.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(200,200,220,0.6)' }}>{step}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => fetchBatch(false)}
            className="btn-premium"
            style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-gold" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)' }}>
              <Package className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient-gold leading-tight font-elegant">Key Items Dashboard</h1>
              <p style={{ color: 'rgba(200,200,220,0.5)', fontSize: '0.85rem', marginTop: 2 }}>
                Click on any item to view detailed stock by colour
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', boxShadow: '0 4px 16px rgba(201,168,76,0.3)', opacity: refreshing ? 0.6 : 1, cursor: refreshing ? 'not-allowed' : 'pointer' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Items', value: stats.total, color: '#c9a84c' },
            { label: 'With Alerts', value: stats.withAlerts, color: '#ff4d4d' },
            { label: 'Total Stock', value: stats.totalStock.toLocaleString(), color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(5,8,14,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(200,200,220,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 16px' }}>
        <Search className="w-4 h-4" style={{ color: 'rgba(200,200,220,0.35)', flexShrink: 0 }} />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search items..."
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f0f8', fontSize: '0.9rem' }}
        />
        {searchTerm && (
          <span style={{ fontSize: '0.75rem', color: 'rgba(200,200,220,0.4)' }}>{filteredItems.length} results</span>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const itemName = item.name;
          const alertCount = item.alert_count || 0;
          const totalStock = item.total_stock ?? 0;
          const colorTotals = item.color_totals || [];
          const isExpanded = !!expandedItems[itemName];
          const hasAlerts = alertCount > 0;

          return (
            <div
              key={itemName}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${hasAlerts ? 'rgba(255,61,61,0.12)' : 'rgba(255,255,255,0.06)'}`,
                background: 'rgba(13,13,26,0.9)',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => toggleItem(itemName)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: isExpanded ? 'rgba(201,168,76,0.04)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                  borderLeft: hasAlerts ? '3px solid #ff4d4d' : '3px solid rgba(16,185,129,0.4)',
                }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <Package className="w-5 h-5" style={{ color: '#c9a84c', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: '#f0f0f8', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itemName}</span>
                  <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {totalStock} units
                  </span>
                  {hasAlerts && (
                    <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 999, background: 'rgba(255,61,61,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,61,61,0.2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {alertCount} alerts
                    </span>
                  )}
                </div>
                <div style={{ padding: 6, borderRadius: 8, background: isExpanded ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}>
                  {isExpanded ? <ChevronDown className="w-4 h-4" style={{ color: '#c9a84c' }} /> : <ChevronRight className="w-4 h-4" style={{ color: 'rgba(200,200,220,0.4)' }} />}
                </div>
              </button>

              {isExpanded && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px' }}>
                  {colorTotals.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <Layers className="w-4 h-4" style={{ color: 'rgba(200,200,220,0.4)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(200,200,220,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stock by Colour</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {colorTotals.map((c, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              background: 'rgba(5,8,14,0.5)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: 12,
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                          >
                            <span style={{ fontWeight: 600, color: '#d0d0e8', fontSize: '0.85rem' }}>{c.color || 'N/A'}</span>
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#c9a84c', fontSize: '0.9rem' }}>{c.total_stock}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 16, color: 'rgba(200,200,220,0.35)', fontSize: '0.85rem' }}>
                      No colour data available
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="card-premium" style={{ padding: '3rem', textAlign: 'center' }}>
          <Search className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(200,200,220,0.2)' }} />
          <p style={{ color: 'rgba(200,200,220,0.5)', fontSize: '0.9rem' }}>No items match "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default KeyItemsDashboard;

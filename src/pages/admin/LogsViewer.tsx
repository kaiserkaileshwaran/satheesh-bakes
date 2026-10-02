import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, Shield, Search, Download, Trash2,
  ChevronDown, ChevronUp, RefreshCw, XCircle
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import type { ActivityLog, AuditLog } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

type TabType = 'activity' | 'audit';
type SortField = 'timestamp' | 'action' | 'module' | 'userName';
type SortDir = 'asc' | 'desc';

const ROWS_PER_PAGE = 20;

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportExcel(data: Record<string, unknown>[], filename: string) {
  // For Excel, we use TSV format that Excel can open
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map(h => String(row[h] ?? '')).join('\t')
  );
  const tsv = [headers.join('\t'), ...rows].join('\n');
  const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace('.csv', '.xls');
  link.click();
  URL.revokeObjectURL(url);
}

export const LogsViewer: React.FC = () => {
  const { showToast } = useNotification();
  const [tab, setTab] = useState<TabType>('activity');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadLogs = () => {
    setActivityLogs(StorageService.getActivityLogs());
    setAuditLogs(StorageService.getAuditLogs());
  };

  useEffect(() => {
    // Defer to next microtask to avoid synchronous setState-in-effect warning
    const timeout = setTimeout(() => loadLogs(), 0);
    const handler = () => loadLogs();
    window.addEventListener('sb_data_change', handler);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('sb_data_change', handler);
    };
  }, []);

  // Derive unique module/action values
  const modules = useMemo(() => [...new Set(activityLogs.map(l => l.module))].sort(), [activityLogs]);
  const actions = useMemo(() => [...new Set(activityLogs.map(l => l.action))].sort(), [activityLogs]);

  // Filter + Sort + Search
  const filteredActivity = useMemo(() => {
    let list = [...activityLogs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.action?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.userName?.toLowerCase().includes(q) ||
        l.module?.toLowerCase().includes(q)
      );
    }
    if (moduleFilter) list = list.filter(l => l.module === moduleFilter);
    if (actionFilter) list = list.filter(l => l.action === actionFilter);

    list.sort((a, b) => {
      const aVal = a[sortField as keyof ActivityLog];
      const bVal = b[sortField as keyof ActivityLog];
      const aStr = (typeof aVal === 'string' ? aVal.toLowerCase() : aVal) ?? '';
      const bStr = (typeof bVal === 'string' ? bVal.toLowerCase() : bVal) ?? '';
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [activityLogs, search, moduleFilter, actionFilter, sortField, sortDir]);

  const filteredAudit = useMemo(() => {
    let list = [...auditLogs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.action?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.adminId?.toLowerCase().includes(q) ||
        l.entity?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortDir === 'desc') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });
    return list;
  }, [auditLogs, search, sortDir]);

  const currentList = tab === 'activity' ? filteredActivity : filteredAudit;
  const totalPages = Math.max(1, Math.ceil(currentList.length / ROWS_PER_PAGE));
  const paginated = currentList.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const handleBulkDelete = () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected log(s)?`)) return;

    if (tab === 'activity') {
      const newLogs = activityLogs.filter(l => !selected.has(l.id));
      // Save logs back (this is a direct manipulation)
      localStorage.setItem('sb_logs_v1', JSON.stringify(newLogs));
      window.dispatchEvent(new CustomEvent('sb_data_change'));
    } else {
      const newAudit = auditLogs.filter(l => !selected.has(l.id));
      localStorage.setItem('sb_audit_v1', JSON.stringify(newAudit));
      window.dispatchEvent(new CustomEvent('sb_data_change'));
    }
    setSelected(new Set());
    loadLogs();
    showToast('Deleted', `${selected.size} log(s) deleted.`, 'info');
  };

  const handleClearAll = () => {
    const key = tab === 'activity' ? 'sb_logs_v1' : 'sb_audit_v1';
    if (!confirm(`Clear ALL ${tab} logs? This cannot be undone.`)) return;
    localStorage.setItem(key, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('sb_data_change'));
    setSelected(new Set());
    loadLogs();
    showToast('Cleared', 'All logs cleared.', 'info');
  };

  const handleExportCSV = () => {
    const data = currentList.map(l => ({
      ...l,
      timestamp: new Date(l.timestamp).toLocaleString('en-IN'),
    }));
    exportCSV(data, `${tab}_logs_${Date.now()}.csv`);
    showToast('Exported', 'Logs exported as CSV.', 'success');
  };

  const handleExportExcel = () => {
    const data = currentList.map(l => ({
      ...l,
      timestamp: new Date(l.timestamp).toLocaleString('en-IN'),
    }));
    exportExcel(data, `${tab}_logs_${Date.now()}.xls`);
    showToast('Exported', 'Logs exported as Excel.', 'success');
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(l => l.id)));
    }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3 ml-1 inline" /> : <ChevronDown className="w-3 h-3 ml-1 inline" />
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream">Activity & Audit Logs</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={loadLogs} title="Refresh" className="p-2 rounded-xl hover:bg-bakery-beige/40 text-bakery-brown">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs hover:bg-emerald-200">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-100 text-sky-700 font-bold text-xs hover:bg-sky-200">
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs hover:bg-rose-200">
              <Trash2 className="w-3.5 h-3.5" /> Delete ({selected.size})
            </button>
          )}
          <button onClick={handleClearAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs hover:bg-gray-200">
            <XCircle className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-bakery-beige dark:border-gray-800">
        {(['activity', 'audit'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); setSelected(new Set()); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all capitalize ${
              tab === t
                ? 'border-bakery-gold text-bakery-brown dark:text-bakery-gold'
                : 'border-transparent text-bakery-chocolate/50 dark:text-bakery-cream/50 hover:text-bakery-chocolate'
            }`}
          >
            {t === 'activity' ? <Activity className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            {t === 'activity' ? 'Activity Log' : 'Audit Log'}
            <span className="px-1.5 py-0.5 rounded-full bg-bakery-beige dark:bg-gray-800 text-[10px]">
              {t === 'activity' ? filteredActivity.length : filteredAudit.length}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-bakery-brown/50" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search logs..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream"
          />
        </div>
        {tab === 'activity' && (
          <>
            <select
              value={moduleFilter}
              onChange={e => { setModuleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream"
            >
              <option value="">All Modules</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={actionFilter}
              onChange={e => { setActionFilter(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream"
            >
              <option value="">All Actions</option>
              {actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-bakery-beige overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {tab === 'activity' ? (
            <table className="w-full text-xs">
              <thead className="bg-bakery-beige/30 dark:bg-gray-800">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="accent-bakery-brown" />
                  </th>
                  {[
                    { label: 'Action', field: 'action' as SortField },
                    { label: 'Module', field: 'module' as SortField },
                    { label: 'User', field: 'userName' as SortField },
                    { label: 'Description', field: null },
                    { label: 'Time', field: 'timestamp' as SortField },
                  ].map(col => (
                    <th
                      key={col.label}
                      className={`py-3 px-4 text-left font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 ${col.field ? 'cursor-pointer hover:text-bakery-brown select-none' : ''}`}
                      onClick={() => col.field && toggleSort(col.field)}
                    >
                      {col.label}{col.field && <SortIcon field={col.field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-bakery-chocolate/40 dark:text-bakery-cream/40">
                      <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No activity logs found.</p>
                    </td>
                  </tr>
                )}
                {(paginated as ActivityLog[]).map(log => (
                  <tr key={log.id} className={`border-t border-bakery-beige/30 hover:bg-bakery-beige/10 transition-colors ${selected.has(log.id) ? 'bg-bakery-gold/5' : ''}`}>
                    <td className="py-3 px-4">
                      <input type="checkbox" checked={selected.has(log.id)} onChange={() => toggleSelect(log.id)} className="accent-bakery-brown" />
                    </td>
                    <td className="py-3 px-4 font-bold text-bakery-chocolate dark:text-bakery-cream">{log.action}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-bakery-beige/70 dark:bg-gray-800 text-bakery-brown dark:text-bakery-gold font-bold text-[10px]">{log.module}</span>
                    </td>
                    <td className="py-3 px-4 text-bakery-chocolate/70 dark:text-bakery-cream/70">{log.userName}</td>
                    <td className="py-3 px-4 text-bakery-chocolate/60 dark:text-bakery-cream/60 max-w-xs truncate">{log.description}</td>
                    <td className="py-3 px-4 text-bakery-chocolate/50 dark:text-bakery-cream/50 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-bakery-beige/30 dark:bg-gray-800">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="accent-bakery-brown" />
                  </th>
                  {['Entity', 'Action', 'By', 'Description', 'Time'].map(h => (
                    <th key={h} className="py-3 px-4 text-left font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-bakery-chocolate/40 dark:text-bakery-cream/40">
                      <Shield className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No audit records yet.</p>
                    </td>
                  </tr>
                )}
                {(paginated as AuditLog[]).map(log => (
                  <tr key={log.id} className={`border-t border-bakery-beige/30 hover:bg-bakery-beige/10 transition-colors ${selected.has(log.id) ? 'bg-bakery-gold/5' : ''}`}>
                    <td className="py-3 px-4">
                      <input type="checkbox" checked={selected.has(log.id)} onChange={() => toggleSelect(log.id)} className="accent-bakery-brown" />
                    </td>
                    <td className="py-3 px-4 font-bold text-bakery-chocolate dark:text-bakery-cream">{log.entity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.action === 'CREATE' || log.action === 'Product Saved' ? 'bg-emerald-100 text-emerald-700' :
                        log.action === 'UPDATE' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'
                      }`}>{log.action}</span>
                    </td>
                    <td className="py-3 px-4 text-bakery-chocolate/70 dark:text-bakery-cream/70">{log.adminId}</td>
                    <td className="py-3 px-4 text-bakery-chocolate/60 dark:text-bakery-cream/60 max-w-xs truncate">{log.description}</td>
                    <td className="py-3 px-4 text-bakery-chocolate/50 dark:text-bakery-cream/50 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">
          <span>Page {page} of {totalPages} ({currentList.length} total)</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-bakery-beige disabled:opacity-40"
            >Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const num = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-8 h-7 rounded-lg font-bold ${page === num ? 'bg-bakery-gold text-bakery-chocolate' : 'bg-white dark:bg-gray-900 border border-bakery-beige'}`}
                >{num}</button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-bakery-beige disabled:opacity-40"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

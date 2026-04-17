import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Form, FormResponse, FormField } from '../lib/types';

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  useEffect(() => {
    const load = async () => {
      const [formRes, respRes] = await Promise.all([
        supabase.from('forms').select('*').eq('id', id).maybeSingle(),
        supabase.from('form_responses').select('*').eq('form_id', id).order('submitted_at', { ascending: false }),
      ]);
      if (formRes.data) setForm(formRes.data as Form);
      if (respRes.data) setResponses(respRes.data as FormResponse[]);
      setLoading(false);
    };
    load();
  }, [id]);

  const inputFields = form?.fields.filter(f => !['heading', 'paragraph'].includes(f.type)) ?? [];

  const filtered = responses.filter(r => {
    if (!search) return true;
    const vals = Object.values(r.data).map(v => formatValue(v).toLowerCase());
    return vals.some(v => v.includes(search.toLowerCase()));
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const exportCSV = () => {
    const headers = ['Submitted At', 'Completion Time (s)', ...inputFields.map(f => f.label)];
    const rows = responses.map(r => [
      r.submitted_at,
      r.completion_time,
      ...inputFields.map(f => formatValue(r.data[f.id])),
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form?.title ?? 'responses'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = JSON.stringify(responses, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form?.title ?? 'responses'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selectedRows.size} response(s)?`)) return;
    await supabase.from('form_responses').delete().in('id', Array.from(selectedRows));
    setResponses(r => r.filter(x => !selectedRows.has(x.id)));
    setSelectedRows(new Set());
  };

  const toggleRow = (id: string) => {
    setSelectedRows(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === paginated.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(paginated.map(r => r.id)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-1">
            <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{form?.title}</h1>
              <p className="text-xs text-gray-500">{responses.length} total responses</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-9">
            <Link to={`/builder/${id}`} className="text-xs text-blue-600 hover:underline">Edit form</Link>
            <span className="text-gray-300">•</span>
            <Link to={`/forms/${id}/analytics`} className="text-xs text-blue-600 hover:underline">Analytics</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search responses..."
              className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>
          <div className="flex-1" />
          {selectedRows.size > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
            >
              <Trash2 size={13} />
              Delete ({selectedRows.size})
            </button>
          )}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <Download size={13} />
            Export JSON
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <p className="text-gray-400 text-sm">{search ? 'No responses match your search' : 'No responses yet'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === paginated.length && paginated.length > 0}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Submitted At</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Time (s)</th>
                    {inputFields.map(f => (
                      <th key={f.id} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap max-w-[180px]">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r, i) => (
                    <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedRows.has(r.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(r.id)}
                          onChange={() => toggleRow(r.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{formatDate(r.submitted_at)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{r.completion_time ?? '—'}</td>
                      {inputFields.map(f => (
                        <td key={f.id} className="px-4 py-3 text-gray-700 text-xs max-w-[180px] truncate">
                          {formatValue(r.data[f.id])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors ${
                        page === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, CreditCard as Edit, Trash2, BarChart2, Copy, Globe, GlobeLock, Eye, MessageSquare, MoreVertical } from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { useAuthStore } from '../store/authStore';
import { Form } from '../lib/types';
import { toast } from '../components/shared/Toast';

function FormCard({ form, onEdit, onDelete, onDuplicate, onTogglePublish, onViewResponses, onViewAnalytics }: {
  form: Form;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onTogglePublish: () => void;
  onViewResponses: () => void;
  onViewAnalytics: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const date = new Date(form.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${form.theme?.primary_color || '#3b82f6'}20` }}
        >
          <FileText size={18} style={{ color: form.theme?.primary_color || '#3b82f6' }} />
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Edit size={13} /> Edit
                </button>
                <button onClick={() => { onDuplicate(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Copy size={13} /> Duplicate
                </button>
                <button onClick={() => { onTogglePublish(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  {form.is_published ? <GlobeLock size={13} /> : <Globe size={13} />}
                  {form.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => { onViewResponses(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  <MessageSquare size={13} /> Responses
                </button>
                <button onClick={() => { onViewAnalytics(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  <BarChart2 size={13} /> Analytics
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 truncate">{form.title}</h3>
      <p className="text-xs text-gray-400 mb-4">Updated {date}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Eye size={11} /> {form.total_views}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={11} /> {form.fields?.length ?? 0} fields
          </span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          form.is_published
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {form.is_published ? 'Published' : 'Draft'}
        </span>
      </div>

      <button
        onClick={onEdit}
        className="mt-3 w-full py-2 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        Edit Form
      </button>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { forms, loading, fetchForms, createForm, deleteForm, duplicateForm, togglePublish } = useFormStore();
  const { user, profile } = useAuthStore();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchForms(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    const form = await createForm();
    setCreating(false);
    if (form) navigate(`/builder/${form.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this form? This cannot be undone.')) return;
    await deleteForm(id);
    toast('success', 'Form deleted');
  };

  const handleDuplicate = async (id: string) => {
    const form = await duplicateForm(id);
    if (form) {
      toast('success', 'Form duplicated');
      navigate(`/builder/${form.id}`);
    }
  };

  const filtered = forms.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = forms.filter(f => f.is_published).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage and build your forms</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Plus size={15} />
            New Form
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Forms', value: forms.length, color: 'blue' },
            { label: 'Published', value: publishedCount, color: 'emerald' },
            { label: 'Drafts', value: forms.length - publishedCount, color: 'gray' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search forms..."
            className="w-full max-w-xs h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
                <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              {search ? 'No forms found' : 'No forms yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {search ? 'Try a different search' : 'Create your first form to get started'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(form => (
              <FormCard
                key={form.id}
                form={form}
                onEdit={() => navigate(`/builder/${form.id}`)}
                onDelete={() => handleDelete(form.id)}
                onDuplicate={() => handleDuplicate(form.id)}
                onTogglePublish={() => togglePublish(form.id)}
                onViewResponses={() => navigate(`/forms/${form.id}/responses`)}
                onViewAnalytics={() => navigate(`/forms/${form.id}/analytics`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

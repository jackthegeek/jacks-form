import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Eye, EyeOff, Globe, GlobeLock,
  Settings, Palette, Type, Share2, Smartphone, Monitor,
  BarChart2, MessageSquare, X
} from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { FieldTypePanel } from '../components/builder/FieldTypePanel';
import { BuilderCanvas } from '../components/builder/BuilderCanvas';
import { FieldSettingsPanel } from '../components/builder/FieldSettingsPanel';
import { FormSettingsPanel } from '../components/builder/FormSettingsPanel';
import { ThemePanel } from '../components/builder/ThemePanel';
import { FormPreview } from '../components/preview/FormPreview';
import { PublishPanel } from '../components/builder/PublishPanel';
import { toast } from '../components/shared/Toast';
import { FieldType } from '../lib/types';

type LeftTab = 'fields' | 'settings' | 'theme' | 'publish';

export function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentForm, selectedFieldId, saving,
    fetchForm, saveForm, togglePublish,
    addField, selectField, setCurrentForm,
  } = useFormStore();

  const [leftTab, setLeftTab] = useState<LeftTab>('fields');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const form = await fetchForm(id);
      if (!form) { navigate('/dashboard'); }
      setLoading(false);
    };
    load();
    return () => { setCurrentForm(null); };
  }, [id]);

  useEffect(() => {
    if (!currentForm || loading) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(async () => {
      await saveForm();
    }, 2000);
    setAutoSaveTimer(timer);
    return () => clearTimeout(timer);
  }, [currentForm?.fields, currentForm?.title, currentForm?.description, currentForm?.settings, currentForm?.theme]);

  const handleSave = async () => {
    const { error } = await saveForm();
    if (error) toast('error', 'Failed to save');
    else toast('success', 'Saved successfully');
  };

  const handleAddField = (type: FieldType) => {
    addField(type);
    setLeftTab('fields');
  };

  const selectedField = currentForm?.fields.find(f => f.id === selectedFieldId);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentForm) return null;

  const leftTabs: { id: LeftTab; icon: typeof Type; title: string }[] = [
    { id: 'fields', icon: Type, title: 'Fields' },
    { id: 'settings', icon: Settings, title: 'Settings' },
    { id: 'theme', icon: Palette, title: 'Theme' },
    { id: 'publish', icon: Share2, title: 'Publish' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
        <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-sm font-semibold text-gray-800 max-w-[200px] truncate">{currentForm.title}</span>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Link to={`/forms/${id}/responses`} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageSquare size={13} /> Responses
          </Link>
          <Link to={`/forms/${id}/analytics`} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <BarChart2 size={13} /> Analytics
          </Link>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        <button
          onClick={() => setShowPreview(p => !p)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            showPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          Preview
        </button>

        <button
          onClick={() => togglePublish(currentForm.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            currentForm.is_published ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {currentForm.is_published ? <Globe size={13} /> : <GlobeLock size={13} />}
          {currentForm.is_published ? 'Published' : 'Publish'}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save size={13} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="flex border-b border-gray-200">
            {leftTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id)}
                className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                  leftTab === tab.id ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title={tab.title}
              >
                <tab.icon size={14} />
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {leftTab === 'fields' && <FieldTypePanel onAddField={handleAddField} />}
            {leftTab === 'settings' && <FormSettingsPanel />}
            {leftTab === 'theme' && <ThemePanel />}
            {leftTab === 'publish' && <PublishPanel form={currentForm} />}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 flex overflow-hidden ${showPreview ? 'border-r border-gray-200' : ''}`}>
            <BuilderCanvas onAddFieldClick={() => setLeftTab('fields')} />
          </div>

          {showPreview && (
            <div className="w-96 flex flex-col bg-gray-100 flex-shrink-0">
              <div className="h-9 bg-white border-b border-gray-200 flex items-center px-3 gap-2">
                <span className="text-xs font-medium text-gray-500 flex-1">Live Preview</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1 rounded transition-colors ${previewMode === 'desktop' ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    <Monitor size={13} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1 rounded transition-colors ${previewMode === 'mobile' ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    <Smartphone size={13} />
                  </button>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-0.5 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <FormPreview form={currentForm} mobileView={previewMode === 'mobile'} />
              </div>
            </div>
          )}
        </div>

        {selectedField && !showPreview && (
          <div className="w-64 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
            <div className="h-9 border-b border-gray-200 flex items-center px-4 gap-2">
              <span className="text-xs font-semibold text-gray-700 flex-1">Field Properties</span>
              <button onClick={() => selectField(null)} className="p-0.5 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FieldSettingsPanel field={selectedField} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

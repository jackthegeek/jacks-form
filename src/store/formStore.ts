import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  Form, FormField, FormSettings, FormTheme,
  DEFAULT_SETTINGS, DEFAULT_THEME, createDefaultField, FieldType
} from '../lib/types';

type BuilderTab = 'fields' | 'settings' | 'theme';
type PreviewMode = 'desktop' | 'mobile';

interface FormStore {
  forms: Form[];
  currentForm: Form | null;
  selectedFieldId: string | null;
  activeTab: BuilderTab;
  previewMode: PreviewMode;
  showPreview: boolean;
  saving: boolean;
  loading: boolean;

  fetchForms: () => Promise<void>;
  fetchForm: (id: string) => Promise<Form | null>;
  createForm: () => Promise<Form | null>;
  saveForm: () => Promise<{ error: string | null }>;
  deleteForm: (id: string) => Promise<void>;
  duplicateForm: (id: string) => Promise<Form | null>;
  togglePublish: (id: string) => Promise<void>;

  setCurrentForm: (form: Form | null) => void;
  updateFormMeta: (updates: Partial<Pick<Form, 'title' | 'description'>>) => void;
  updateSettings: (settings: Partial<FormSettings>) => void;
  updateTheme: (theme: Partial<FormTheme>) => void;

  addField: (type: FieldType) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  reorderFields: (fields: FormField[]) => void;

  selectField: (id: string | null) => void;
  setActiveTab: (tab: BuilderTab) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  togglePreview: () => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
  forms: [],
  currentForm: null,
  selectedFieldId: null,
  activeTab: 'fields',
  previewMode: 'desktop',
  showPreview: true,
  saving: false,
  loading: false,

  fetchForms: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('forms')
      .select('*')
      .order('updated_at', { ascending: false });
    set({ forms: (data as Form[]) ?? [], loading: false });
  },

  fetchForm: async (id) => {
    const { data } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (data) {
      const form = data as Form;
      set({ currentForm: form });
      return form;
    }
    return null;
  },

  createForm: async () => {
    const { data } = await supabase
      .from('forms')
      .insert({
        title: 'Untitled Form',
        description: '',
        fields: [],
        settings: DEFAULT_SETTINGS,
        theme: DEFAULT_THEME,
      })
      .select()
      .single();
    if (data) {
      const form = data as Form;
      set(s => ({ forms: [form, ...s.forms] }));
      return form;
    }
    return null;
  },

  saveForm: async () => {
    const form = get().currentForm;
    if (!form) return { error: 'No form loaded' };
    set({ saving: true });
    const { error } = await supabase
      .from('forms')
      .update({
        title: form.title,
        description: form.description,
        fields: form.fields,
        settings: form.settings,
        theme: form.theme,
        is_published: form.is_published,
        is_enabled: form.is_enabled,
      })
      .eq('id', form.id);
    set({ saving: false });
    if (!error) {
      set(s => ({
        forms: s.forms.map(f => f.id === form.id ? form : f),
      }));
    }
    return { error: error?.message ?? null };
  },

  deleteForm: async (id) => {
    await supabase.from('forms').delete().eq('id', id);
    set(s => ({ forms: s.forms.filter(f => f.id !== id) }));
  },

  duplicateForm: async (id) => {
    const form = get().forms.find(f => f.id === id);
    if (!form) return null;
    const { data } = await supabase
      .from('forms')
      .insert({
        title: `${form.title} (Copy)`,
        description: form.description,
        fields: form.fields,
        settings: form.settings,
        theme: form.theme,
      })
      .select()
      .single();
    if (data) {
      const newForm = data as Form;
      set(s => ({ forms: [newForm, ...s.forms] }));
      return newForm;
    }
    return null;
  },

  togglePublish: async (id) => {
    const form = get().forms.find(f => f.id === id);
    if (!form) return;
    const newPublished = !form.is_published;
    await supabase.from('forms').update({ is_published: newPublished }).eq('id', id);
    set(s => ({
      forms: s.forms.map(f => f.id === id ? { ...f, is_published: newPublished } : f),
      currentForm: s.currentForm?.id === id ? { ...s.currentForm, is_published: newPublished } : s.currentForm,
    }));
  },

  setCurrentForm: (form) => set({ currentForm: form, selectedFieldId: null }),

  updateFormMeta: (updates) => {
    set(s => ({
      currentForm: s.currentForm ? { ...s.currentForm, ...updates } : null,
    }));
  },

  updateSettings: (settings) => {
    set(s => ({
      currentForm: s.currentForm
        ? { ...s.currentForm, settings: { ...s.currentForm.settings, ...settings } }
        : null,
    }));
  },

  updateTheme: (theme) => {
    set(s => ({
      currentForm: s.currentForm
        ? { ...s.currentForm, theme: { ...s.currentForm.theme, ...theme } }
        : null,
    }));
  },

  addField: (type) => {
    const field = createDefaultField(type);
    set(s => ({
      currentForm: s.currentForm
        ? { ...s.currentForm, fields: [...s.currentForm.fields, field] }
        : null,
      selectedFieldId: field.id,
      activeTab: 'fields',
    }));
  },

  updateField: (id, updates) => {
    set(s => ({
      currentForm: s.currentForm
        ? {
            ...s.currentForm,
            fields: s.currentForm.fields.map(f => f.id === id ? { ...f, ...updates } : f),
          }
        : null,
    }));
  },

  removeField: (id) => {
    set(s => ({
      currentForm: s.currentForm
        ? { ...s.currentForm, fields: s.currentForm.fields.filter(f => f.id !== id) }
        : null,
      selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
    }));
  },

  duplicateField: (id) => {
    const fields = get().currentForm?.fields ?? [];
    const idx = fields.findIndex(f => f.id === id);
    if (idx === -1) return;
    const copy = { ...fields[idx], id: crypto.randomUUID() };
    const newFields = [...fields.slice(0, idx + 1), copy, ...fields.slice(idx + 1)];
    set(s => ({
      currentForm: s.currentForm ? { ...s.currentForm, fields: newFields } : null,
      selectedFieldId: copy.id,
    }));
  },

  reorderFields: (fields) => {
    set(s => ({
      currentForm: s.currentForm ? { ...s.currentForm, fields } : null,
    }));
  },

  selectField: (id) => set({ selectedFieldId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  togglePreview: () => set(s => ({ showPreview: !s.showPreview })),
}));

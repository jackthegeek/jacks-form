import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Form, FormField, FormTheme } from '../lib/types';
import { FieldRenderer } from '../components/preview/FieldRenderer';

function isFieldVisible(field: FormField, values: Record<string, unknown>): boolean {
  if (!field.conditional?.enabled) return true;
  const { field_id, operator, value } = field.conditional;
  if (!field_id) return true;
  const fieldValue = values[field_id];
  const strValue = Array.isArray(fieldValue) ? fieldValue.join(',') : String(fieldValue ?? '');
  switch (operator) {
    case 'equals': return strValue === value;
    case 'not_equals': return strValue !== value;
    case 'contains': return strValue.includes(value);
    case 'not_contains': return !strValue.includes(value);
    case 'is_empty': return !strValue;
    case 'is_not_empty': return !!strValue;
    default: return true;
  }
}

function validateField(field: FormField, value: unknown): string | null {
  const strVal = Array.isArray(value) ? value.join(',') : String(value ?? '');
  if (field.required && (!value || strVal === '')) return `${field.label} is required`;
  if (field.validation?.min_length && strVal.length < field.validation.min_length) {
    return `Minimum ${field.validation.min_length} characters required`;
  }
  if (field.validation?.max_length && strVal.length > field.validation.max_length) {
    return `Maximum ${field.validation.max_length} characters allowed`;
  }
  if (field.validation?.regex && strVal && !new RegExp(field.validation.regex).test(strVal)) {
    return field.validation.regex_message || 'Invalid format';
  }
  return null;
}

export function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      const { data } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .eq('is_enabled', true)
        .maybeSingle();

      if (!data) { setNotFound(true); setLoading(false); return; }
      setForm(data as Form);

      await supabase.from('forms').update({ total_views: (data.total_views ?? 0) + 1 }).eq('id', data.id);
      setLoading(false);
    };
    fetchForm();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const visibleFields = form.fields.filter(f => isFieldVisible(f, values) && !['heading', 'paragraph'].includes(f.type));
    const newErrors: Record<string, string> = {};
    for (const field of visibleFields) {
      const err = validateField(field, values[field.id]);
      if (err) newErrors[field.id] = err;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const completionTime = Math.round((Date.now() - startTime) / 1000);

    await supabase.from('form_responses').insert({
      form_id: form.id,
      data: values,
      metadata: { user_agent: navigator.userAgent, referrer: document.referrer },
      completion_time: completionTime,
    });

    setSubmitting(false);
    setSubmitted(true);

    if (form.settings?.redirect_url) {
      setTimeout(() => { window.location.href = form.settings.redirect_url; }, 2000);
    }
  };

  const verifyPassword = () => {
    if (!form) return;
    if (password === form.settings?.password) {
      setPasswordVerified(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ backgroundColor: '#f9fafb' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form not found</h1>
          <p className="text-gray-500">This form may not exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  const { theme, settings, fields } = form;
  const buttonRadius = theme.button_style === 'pill' ? '9999px' : theme.button_style === 'square' ? '4px' : '8px';

  if (settings?.is_password_protected && !passwordVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: theme.background_color, fontFamily: theme.font }}>
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-bold mb-2 text-center" style={{ color: theme.text_color }}>Password Protected</h2>
          <p className="text-sm text-center mb-6" style={{ color: `${theme.text_color}80` }}>Enter the password to access this form</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verifyPassword()}
            placeholder="Enter password"
            className="w-full h-10 px-3 text-sm border rounded-lg outline-none mb-3"
            style={{ borderColor: passwordError ? '#ef4444' : '#d1d5db', color: theme.text_color }}
          />
          {passwordError && <p className="text-xs text-red-500 mb-3">{passwordError}</p>}
          <button
            onClick={verifyPassword}
            className="w-full py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: theme.primary_color, borderRadius: buttonRadius }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: theme.background_color, fontFamily: theme.font }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${theme.primary_color}20` }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke={theme.primary_color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: theme.text_color }}>
            {settings?.success_message || 'Thank you for your response!'}
          </h2>
          {settings?.redirect_url && (
            <p className="text-sm" style={{ color: `${theme.text_color}80` }}>Redirecting you shortly...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: theme.background_color, fontFamily: theme.font }}>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text_color }}>{form.title}</h1>
          {form.description && (
            <p className="text-base" style={{ color: `${theme.text_color}80` }}>{form.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.filter(f => isFieldVisible(f, values)).map(field => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={val => {
                setValues(v => ({ ...v, [field.id]: val }));
                if (errors[field.id]) setErrors(e => { const n = { ...e }; delete n[field.id]; return n; });
              }}
              theme={theme}
              error={errors[field.id]}
            />
          ))}

          {fields.filter(f => !['heading', 'paragraph'].includes(f.type)).length > 0 && (
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.primary_color, borderRadius: buttonRadius }}
            >
              {submitting ? 'Submitting...' : (settings?.submit_button_text || 'Submit')}
            </button>
          )}
        </form>

        <p className="text-center text-xs mt-10" style={{ color: `${theme.text_color}40` }}>
          Powered by FormCraft
        </p>
      </div>
    </div>
  );
}

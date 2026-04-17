import { useState } from 'react';
import { Form, FormField } from '../../lib/types';
import { FieldRenderer } from './FieldRenderer';

interface Props {
  form: Form;
  mobileView?: boolean;
}

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
    case 'is_empty': return !strValue || strValue === '';
    case 'is_not_empty': return !!strValue && strValue !== '';
    default: return true;
  }
}

export function FormPreview({ form, mobileView = false }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);

  const { theme, settings, fields } = form;

  const buttonRadius =
    settings && theme.button_style === 'pill' ? '9999px' :
    theme.button_style === 'square' ? '4px' : '8px';

  if (submitted) {
    return (
      <div
        className="flex-1 flex items-center justify-center p-8 text-center"
        style={{ backgroundColor: theme.background_color, fontFamily: theme.font }}
      >
        <div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${theme.primary_color}20` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke={theme.primary_color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text_color }}>
            {settings?.success_message || 'Thank you!'}
          </h2>
          <button
            onClick={() => { setSubmitted(false); setValues({}); }}
            className="mt-4 text-sm underline"
            style={{ color: theme.primary_color }}
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-y-auto h-full ${mobileView ? 'max-w-sm mx-auto' : ''}`}
      style={{ backgroundColor: theme.background_color, fontFamily: theme.font }}
    >
      <div className="p-6 max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text_color }}>{form.title}</h1>
          {form.description && (
            <p className="text-sm" style={{ color: `${theme.text_color}80` }}>{form.description}</p>
          )}
        </div>

        <div className="space-y-5">
          {fields.filter(f => isFieldVisible(f, values)).map(field => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={val => setValues(v => ({ ...v, [field.id]: val }))}
              theme={theme}
            />
          ))}
        </div>

        {fields.length > 0 && (
          <button
            onClick={() => setSubmitted(true)}
            className="mt-6 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: theme.primary_color,
              borderRadius: buttonRadius,
              fontFamily: theme.font,
            }}
          >
            {settings?.submit_button_text || 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}

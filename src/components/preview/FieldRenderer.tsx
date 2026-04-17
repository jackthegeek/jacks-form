import { FormField, FormTheme } from '../../lib/types';

interface Props {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  theme: FormTheme;
  error?: string;
}

export function FieldRenderer({ field, value, onChange, theme, error }: Props) {
  const borderColor = error ? '#ef4444' : '#d1d5db';
  const focusRing = theme.primary_color;

  const inputClass = `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all`;
  const inputStyle = { borderColor, fontFamily: theme.font, color: theme.text_color };

  if (field.type === 'heading') {
    return (
      <h3 className="text-xl font-bold mt-2" style={{ color: theme.text_color, fontFamily: theme.font }}>
        {field.label}
      </h3>
    );
  }

  if (field.type === 'paragraph') {
    return (
      <p className="text-sm leading-relaxed" style={{ color: `${theme.text_color}99`, fontFamily: theme.font }}>
        {field.label}
      </p>
    );
  }

  const labelEl = (
    <div className="flex items-center gap-1 mb-1.5">
      <label className="text-sm font-medium" style={{ color: theme.text_color, fontFamily: theme.font }}>
        {field.label}
      </label>
      {field.required && <span className="text-red-500 text-sm">*</span>}
    </div>
  );

  const descEl = field.description && (
    <p className="text-xs mb-2" style={{ color: `${theme.text_color}80` }}>{field.description}</p>
  );

  const errEl = error && (
    <p className="text-xs text-red-500 mt-1">{error}</p>
  );

  if (field.type === 'text' || field.type === 'email' || field.type === 'number') {
    return (
      <div>
        {labelEl}
        {descEl}
        <input
          type={field.type}
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
          style={inputStyle}
          min={field.validation?.min_value ?? undefined}
          max={field.validation?.max_value ?? undefined}
        />
        {errEl}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        {labelEl}
        {descEl}
        <textarea
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
        {errEl}
      </div>
    );
  }

  if (field.type === 'dropdown') {
    return (
      <div>
        {labelEl}
        {descEl}
        <select
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
          style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b7280' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="">Select an option</option>
          {(field.options ?? []).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
        {errEl}
      </div>
    );
  }

  if (field.type === 'radio') {
    return (
      <div>
        {labelEl}
        {descEl}
        <div className="space-y-2">
          {(field.options ?? []).map((opt, i) => (
            <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${value === opt ? 'border-current' : 'border-gray-300'}`}
                style={{ borderColor: value === opt ? theme.primary_color : undefined }}
              >
                {value === opt && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary_color }} />
                )}
              </div>
              <input type="radio" className="sr-only" value={opt} checked={value === opt} onChange={() => onChange(opt)} />
              <span className="text-sm" style={{ color: theme.text_color }}>{opt}</span>
            </label>
          ))}
        </div>
        {errEl}
      </div>
    );
  }

  if (field.type === 'checkbox') {
    const selected = (value as string[]) ?? [];
    const toggle = (opt: string) => {
      onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
    };
    return (
      <div>
        {labelEl}
        {descEl}
        <div className="space-y-2">
          {(field.options ?? []).map((opt, i) => (
            <label key={i} className="flex items-center gap-2.5 cursor-pointer">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all`}
                style={{
                  borderColor: selected.includes(opt) ? theme.primary_color : '#d1d5db',
                  backgroundColor: selected.includes(opt) ? theme.primary_color : 'transparent',
                }}
                onClick={() => toggle(opt)}
              >
                {selected.includes(opt) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm" style={{ color: theme.text_color }}>{opt}</span>
            </label>
          ))}
        </div>
        {errEl}
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <div>
        {labelEl}
        {descEl}
        <input
          type="date"
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
        {errEl}
      </div>
    );
  }

  if (field.type === 'file') {
    return (
      <div>
        {labelEl}
        {descEl}
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          style={{ borderColor, fontFamily: theme.font }}
        >
          <p className="text-sm" style={{ color: `${theme.text_color}80` }}>Click to upload or drag & drop</p>
        </div>
        {errEl}
      </div>
    );
  }

  return null;
}

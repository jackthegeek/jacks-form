import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { FormField, ConditionalLogic } from '../../lib/types';
import { useFormStore } from '../../store/formStore';

interface Props {
  field: FormField;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </label>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string | number | null | undefined;
  onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 px-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
      />
    </div>
  );
}

export function FieldSettingsPanel({ field }: Props) {
  const { updateField, currentForm } = useFormStore();
  const update = (updates: Partial<FormField>) => updateField(field.id, updates);

  const otherFields = currentForm?.fields.filter(f => f.id !== field.id && !['heading', 'paragraph'].includes(f.type)) ?? [];

  const addOption = () => {
    const opts = [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`];
    update({ options: opts });
  };

  const updateOption = (idx: number, val: string) => {
    const opts = (field.options ?? []).map((o, i) => i === idx ? val : o);
    update({ options: opts });
  };

  const removeOption = (idx: number) => {
    update({ options: (field.options ?? []).filter((_, i) => i !== idx) });
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Field Settings</h3>
        <div className="space-y-3">
          {!['heading', 'paragraph'].includes(field.type) ? (
            <>
              <Input
                label="Label"
                value={field.label}
                onChange={v => update({ label: v })}
                placeholder="Field label"
              />
              <Input
                label="Placeholder"
                value={field.placeholder}
                onChange={v => update({ placeholder: v })}
                placeholder="Placeholder text"
              />
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                <textarea
                  value={field.description ?? ''}
                  onChange={e => update({ description: e.target.value })}
                  placeholder="Help text..."
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                />
              </div>
              <Toggle checked={field.required} onChange={v => update({ required: v })} label="Required" />
            </>
          ) : (
            <>
              <Input
                label={field.type === 'heading' ? 'Heading Text' : 'Paragraph Text'}
                value={field.label}
                onChange={v => update({ label: v })}
                placeholder={field.type === 'heading' ? 'Section heading' : 'Paragraph text'}
              />
            </>
          )}
        </div>
      </div>

      {['dropdown', 'radio', 'checkbox'].includes(field.type) && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Options</p>
          <div className="space-y-1.5">
            {(field.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  className="flex-1 h-7 px-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  onClick={() => removeOption(i)}
                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
            >
              <Plus size={12} />
              Add option
            </button>
          </div>
        </div>
      )}

      {!['heading', 'paragraph'].includes(field.type) && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Validation</p>
          <div className="space-y-2">
            {['text', 'textarea', 'email'].includes(field.type) && (
              <>
                <Input
                  label="Min length"
                  value={field.validation?.min_length}
                  onChange={v => update({ validation: { ...field.validation, min_length: v ? parseInt(v) : null } })}
                  type="number"
                  placeholder="0"
                />
                <Input
                  label="Max length"
                  value={field.validation?.max_length}
                  onChange={v => update({ validation: { ...field.validation, max_length: v ? parseInt(v) : null } })}
                  type="number"
                  placeholder="No limit"
                />
                <Input
                  label="Regex pattern"
                  value={field.validation?.regex}
                  onChange={v => update({ validation: { ...field.validation, regex: v || null } })}
                  placeholder="e.g. ^[A-Za-z]+$"
                />
              </>
            )}
            {field.type === 'number' && (
              <>
                <Input
                  label="Min value"
                  value={field.validation?.min_value}
                  onChange={v => update({ validation: { ...field.validation, min_value: v ? parseInt(v) : null } })}
                  type="number"
                />
                <Input
                  label="Max value"
                  value={field.validation?.max_value}
                  onChange={v => update({ validation: { ...field.validation, max_value: v ? parseInt(v) : null } })}
                  type="number"
                />
              </>
            )}
          </div>
        </div>
      )}

      {otherFields.length > 0 && !['heading', 'paragraph'].includes(field.type) && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conditional Logic</p>
          <Toggle
            checked={field.conditional?.enabled ?? false}
            onChange={v => update({ conditional: { ...field.conditional, enabled: v } as ConditionalLogic })}
            label="Show conditionally"
          />
          {field.conditional?.enabled && (
            <div className="mt-3 space-y-2 pl-3 border-l-2 border-blue-200">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Show when field</label>
                <select
                  value={field.conditional?.field_id ?? ''}
                  onChange={e => update({ conditional: { ...field.conditional, field_id: e.target.value } as ConditionalLogic })}
                  className="w-full h-8 px-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select field...</option>
                  {otherFields.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={field.conditional?.operator ?? 'equals'}
                  onChange={e => update({ conditional: { ...field.conditional, operator: e.target.value as ConditionalLogic['operator'] } as ConditionalLogic })}
                  className="w-full h-8 px-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="equals">equals</option>
                  <option value="not_equals">does not equal</option>
                  <option value="contains">contains</option>
                  <option value="not_contains">does not contain</option>
                  <option value="is_empty">is empty</option>
                  <option value="is_not_empty">is not empty</option>
                </select>
              </div>
              {!['is_empty', 'is_not_empty'].includes(field.conditional?.operator ?? '') && (
                <Input
                  label="Value"
                  value={field.conditional?.value}
                  onChange={v => update({ conditional: { ...field.conditional, value: v } as ConditionalLogic })}
                  placeholder="Enter value..."
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { FormField } from '../../lib/types';

interface Props {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function FieldPreview({ field }: { field: FormField }) {
  if (field.type === 'heading') {
    return <h3 className="text-base font-semibold text-gray-800">{field.label}</h3>;
  }
  if (field.type === 'paragraph') {
    return <p className="text-sm text-gray-600">{field.label}</p>;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium text-gray-700">{field.label}</label>
        {field.required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {['text', 'email', 'number'].includes(field.type) && (
        <div className="h-8 bg-gray-100 rounded-md border border-gray-200 px-2.5 flex items-center">
          <span className="text-xs text-gray-400">{field.placeholder || 'Enter text...'}</span>
        </div>
      )}
      {field.type === 'textarea' && (
        <div className="h-16 bg-gray-100 rounded-md border border-gray-200 px-2.5 py-2">
          <span className="text-xs text-gray-400">{field.placeholder || 'Enter text...'}</span>
        </div>
      )}
      {field.type === 'dropdown' && (
        <div className="h-8 bg-gray-100 rounded-md border border-gray-200 px-2.5 flex items-center justify-between">
          <span className="text-xs text-gray-400">Select an option</span>
          <span className="text-gray-400">▾</span>
        </div>
      )}
      {field.type === 'date' && (
        <div className="h-8 bg-gray-100 rounded-md border border-gray-200 px-2.5 flex items-center">
          <span className="text-xs text-gray-400">MM/DD/YYYY</span>
        </div>
      )}
      {field.type === 'file' && (
        <div className="h-10 bg-gray-50 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center">
          <span className="text-xs text-gray-400">Click to upload</span>
        </div>
      )}
      {['radio', 'checkbox'].includes(field.type) && (
        <div className="space-y-1">
          {(field.options ?? []).slice(0, 3).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 border border-gray-300 flex-shrink-0 ${field.type === 'radio' ? 'rounded-full' : 'rounded-sm'}`} />
              <span className="text-xs text-gray-600">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FieldItem({ field, isSelected, onSelect, onDuplicate, onDelete }: Props) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`relative group rounded-xl border-2 transition-all cursor-pointer ${
        isDragging ? 'opacity-40 bg-white' :
        isSelected
          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
          : 'border-transparent bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {field.conditional?.enabled && (
        <div className="absolute -top-2 left-3 flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-amber-200">
          <EyeOff size={9} />
          Conditional
        </div>
      )}

      <div className="flex items-start gap-2 p-3">
        <button
          {...listeners}
          {...attributes}
          onClick={e => e.stopPropagation()}
          className="mt-0.5 cursor-grab p-0.5 rounded text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={14} />
        </button>

        <div className="flex-1 min-w-0">
          <FieldPreview field={field} />
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Duplicate"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="absolute -left-px top-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-500 rounded-full" />
      )}
    </div>
  );
}

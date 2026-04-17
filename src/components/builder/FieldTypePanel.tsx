import { useDraggable } from '@dnd-kit/core';
import {
  Type, AlignLeft, Mail, Hash, ChevronDown, Circle,
  CheckSquare, Calendar, Upload, Heading, FileText
} from 'lucide-react';
import { FieldType, FIELD_TYPES } from '../../lib/types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Type, AlignLeft, Mail, Hash, ChevronDown, Circle,
  CheckSquare, Calendar, Upload, Heading, FileText,
};

function DraggableFieldType({ type, label, icon }: { type: FieldType; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type: 'palette', fieldType: type },
  });

  const Icon = ICON_MAP[icon];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 bg-white cursor-grab hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all select-none ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {Icon && <Icon size={14} className="flex-shrink-0" />}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

interface Props {
  onAddField: (type: FieldType) => void;
}

export function FieldTypePanel({ onAddField }: Props) {
  const basicFields = FIELD_TYPES.filter(f => !['heading', 'paragraph'].includes(f.type));
  const layoutFields = FIELD_TYPES.filter(f => ['heading', 'paragraph'].includes(f.type));

  return (
    <div className="p-3 space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-2">Input Fields</p>
        <div className="grid grid-cols-2 gap-1.5">
          {basicFields.map(f => (
            <div key={f.type} onClick={() => onAddField(f.type)}>
              <DraggableFieldType type={f.type} label={f.label} icon={f.icon} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-2">Layout</p>
        <div className="grid grid-cols-2 gap-1.5">
          {layoutFields.map(f => (
            <div key={f.type} onClick={() => onAddField(f.type)}>
              <DraggableFieldType type={f.type} label={f.label} icon={f.icon} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

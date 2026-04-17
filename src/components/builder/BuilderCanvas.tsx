import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { Plus, MousePointerClick } from 'lucide-react';
import { useFormStore } from '../../store/formStore';
import { FieldItem } from './FieldItem';
import { FormField, FieldType } from '../../lib/types';

interface Props {
  onAddFieldClick: () => void;
}

export function BuilderCanvas({ onAddFieldClick }: Props) {
  const {
    currentForm, selectedFieldId,
    selectField, removeField, duplicateField, reorderFields, addField,
  } = useFormStore();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fields = currentForm?.fields ?? [];

  const handleDragStart = (e: DragStartEvent) => {
    const id = e.active.id as string;
    if (!id.startsWith('palette-')) {
      setActiveDragId(id);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith('palette-')) {
      const fieldType = active.data.current?.fieldType as FieldType;
      addField(fieldType);
      return;
    }

    if (activeId !== overId) {
      const oldIdx = fields.findIndex(f => f.id === activeId);
      const newIdx = fields.findIndex(f => f.id === overId);
      if (oldIdx !== -1 && newIdx !== -1) {
        reorderFields(arrayMove(fields, oldIdx, newIdx));
      }
    }
  };

  const activeField = activeDragId ? fields.find(f => f.id === activeDragId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-8 px-6">
          <div className="mb-6 space-y-1">
            <h1
              contentEditable
              suppressContentEditableWarning
              onBlur={e => useFormStore.getState().updateFormMeta({ title: e.currentTarget.textContent || 'Untitled Form' })}
              className="text-2xl font-bold text-gray-900 outline-none border-b-2 border-transparent focus:border-blue-400 pb-1 cursor-text"
            >
              {currentForm?.title}
            </h1>
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={e => useFormStore.getState().updateFormMeta({ description: e.currentTarget.textContent || '' })}
              className="text-sm text-gray-500 outline-none border-b-2 border-transparent focus:border-blue-400 pb-0.5 cursor-text min-h-[1.5rem]"
            >
              {currentForm?.description || 'Add a description...'}
            </p>
          </div>

          {fields.length === 0 ? (
            <div
              onClick={onAddFieldClick}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                <Plus size={20} className="text-gray-400 group-hover:text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600">Add your first field</p>
              <p className="text-xs text-gray-400 mt-1">Click to add or drag a field type from the sidebar</p>
            </div>
          ) : (
            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {fields.map(field => (
                  <FieldItem
                    key={field.id}
                    field={field}
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => selectField(field.id)}
                    onDuplicate={() => duplicateField(field.id)}
                    onDelete={() => removeField(field.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          {fields.length > 0 && (
            <button
              onClick={onAddFieldClick}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all"
            >
              <Plus size={14} />
              Add field
            </button>
          )}

          {fields.length > 0 && (
            <div className="mt-6 flex justify-start">
              <div
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: currentForm?.theme?.primary_color || '#3b82f6' }}
              >
                {currentForm?.settings?.submit_button_text || 'Submit'}
              </div>
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeField && (
          <div className="bg-white rounded-xl border-2 border-blue-400 shadow-xl p-3 opacity-90 w-full max-w-lg">
            <span className="text-sm font-medium text-gray-700">{activeField.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

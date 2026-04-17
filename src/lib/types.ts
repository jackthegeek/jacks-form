export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'heading'
  | 'paragraph';

export interface FieldValidation {
  min_length?: number | null;
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  regex?: string | null;
  regex_message?: string | null;
}

export interface ConditionalLogic {
  enabled: boolean;
  field_id: string | null;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty';
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation: FieldValidation;
  conditional: ConditionalLogic;
  default_value?: string;
  width?: 'full' | 'half';
}

export interface FormSettings {
  success_message: string;
  redirect_url: string;
  is_password_protected: boolean;
  password: string;
  submit_button_text: string;
  show_progress_bar: boolean;
  allow_multiple_submissions: boolean;
  notification_email: string;
}

export interface FormTheme {
  primary_color: string;
  background_color: string;
  text_color: string;
  font: string;
  button_style: 'rounded' | 'pill' | 'square';
  preset?: string;
}

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description: string;
  fields: FormField[];
  settings: FormSettings;
  theme: FormTheme;
  is_published: boolean;
  is_enabled: boolean;
  slug: string;
  total_views: number;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  metadata: {
    user_agent?: string;
    referrer?: string;
  };
  completion_time: number;
  submitted_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
}

export interface FormAnalytics {
  total_responses: number;
  total_views: number;
  completion_rate: number;
  avg_completion_time: number;
  responses_over_time: { date: string; count: number }[];
  field_stats: Record<string, { label: string; values: Record<string, number> }>;
}

export const DEFAULT_SETTINGS: FormSettings = {
  success_message: 'Thank you for your response!',
  redirect_url: '',
  is_password_protected: false,
  password: '',
  submit_button_text: 'Submit',
  show_progress_bar: false,
  allow_multiple_submissions: true,
  notification_email: '',
};

export const DEFAULT_THEME: FormTheme = {
  primary_color: '#3b82f6',
  background_color: '#ffffff',
  text_color: '#111827',
  font: 'Inter',
  button_style: 'rounded',
  preset: 'default',
};

export const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Short Text', icon: 'Type' },
  { type: 'textarea', label: 'Long Text', icon: 'AlignLeft' },
  { type: 'email', label: 'Email', icon: 'Mail' },
  { type: 'number', label: 'Number', icon: 'Hash' },
  { type: 'dropdown', label: 'Dropdown', icon: 'ChevronDown' },
  { type: 'radio', label: 'Multiple Choice', icon: 'Circle' },
  { type: 'checkbox', label: 'Checkboxes', icon: 'CheckSquare' },
  { type: 'date', label: 'Date', icon: 'Calendar' },
  { type: 'file', label: 'File Upload', icon: 'Upload' },
  { type: 'heading', label: 'Heading', icon: 'Heading' },
  { type: 'paragraph', label: 'Paragraph', icon: 'FileText' },
];

export function createDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: crypto.randomUUID(),
    type,
    label: FIELD_TYPES.find(f => f.type === type)?.label ?? 'Field',
    placeholder: '',
    description: '',
    required: false,
    validation: {},
    conditional: {
      enabled: false,
      field_id: null,
      operator: 'equals',
      value: '',
    },
  };

  if (['dropdown', 'radio', 'checkbox'].includes(type)) {
    base.options = ['Option 1', 'Option 2', 'Option 3'];
  }

  return base;
}

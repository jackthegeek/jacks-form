import { useFormStore } from '../../store/formStore';

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-gray-700 font-medium">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );
}

export function FormSettingsPanel() {
  const { currentForm, updateSettings } = useFormStore();
  const settings = currentForm?.settings;
  if (!settings) return null;

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Form Behavior</h3>
        <div className="space-y-4">
          <Toggle
            checked={settings.allow_multiple_submissions}
            onChange={v => updateSettings({ allow_multiple_submissions: v })}
            label="Multiple submissions"
            description="Allow same user to submit multiple times"
          />
          <Toggle
            checked={settings.show_progress_bar}
            onChange={v => updateSettings({ show_progress_bar: v })}
            label="Progress bar"
            description="Show completion progress to respondents"
          />
          <Toggle
            checked={settings.is_password_protected}
            onChange={v => updateSettings({ is_password_protected: v })}
            label="Password protection"
            description="Require a password to access this form"
          />
          {settings.is_password_protected && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Password</label>
              <input
                type="password"
                value={settings.password ?? ''}
                onChange={e => updateSettings({ password: e.target.value })}
                placeholder="Enter password..."
                className="w-full h-8 px-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Submission</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Submit button text</label>
            <input
              type="text"
              value={settings.submit_button_text ?? 'Submit'}
              onChange={e => updateSettings({ submit_button_text: e.target.value })}
              className="w-full h-8 px-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Success message</label>
            <textarea
              value={settings.success_message ?? ''}
              onChange={e => updateSettings({ success_message: e.target.value })}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Redirect URL (optional)</label>
            <input
              type="url"
              value={settings.redirect_url ?? ''}
              onChange={e => updateSettings({ redirect_url: e.target.value })}
              placeholder="https://example.com/thank-you"
              className="w-full h-8 px-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Notifications</h3>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Notification email</label>
          <input
            type="email"
            value={settings.notification_email ?? ''}
            onChange={e => updateSettings({ notification_email: e.target.value })}
            placeholder="you@example.com"
            className="w-full h-8 px-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Receive an email for each new submission</p>
        </div>
      </div>
    </div>
  );
}

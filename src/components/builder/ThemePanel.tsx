import { useFormStore } from '../../store/formStore';

const PRESETS = [
  { name: 'Default', primary: '#3b82f6', bg: '#ffffff', text: '#111827' },
  { name: 'Dark', primary: '#60a5fa', bg: '#1f2937', text: '#f9fafb' },
  { name: 'Minimal', primary: '#111827', bg: '#f9fafb', text: '#111827' },
  { name: 'Forest', primary: '#059669', bg: '#f0fdf4', text: '#064e3b' },
  { name: 'Sunset', primary: '#f97316', bg: '#fff7ed', text: '#7c2d12' },
  { name: 'Ocean', primary: '#0891b2', bg: '#ecfeff', text: '#164e63' },
];

const FONTS = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Merriweather', 'Playfair Display'];

export function ThemePanel() {
  const { currentForm, updateTheme } = useFormStore();
  const theme = currentForm?.theme;
  if (!theme) return null;

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Preset Themes</h3>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => updateTheme({
                primary_color: preset.primary,
                background_color: preset.bg,
                text_color: preset.text,
                preset: preset.name,
              })}
              className={`p-2 rounded-lg border-2 text-left transition-all ${
                theme.preset === preset.name ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="h-6 rounded mb-1.5 flex items-center justify-center"
                style={{ backgroundColor: preset.bg, border: '1px solid #e5e7eb' }}
              >
                <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: preset.primary }} />
              </div>
              <span className="text-[10px] font-medium text-gray-600">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Colors</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Primary color</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">{theme.primary_color}</span>
              <input
                type="color"
                value={theme.primary_color}
                onChange={e => updateTheme({ primary_color: e.target.value, preset: 'custom' })}
                className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Background</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">{theme.background_color}</span>
              <input
                type="color"
                value={theme.background_color}
                onChange={e => updateTheme({ background_color: e.target.value, preset: 'custom' })}
                className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Text color</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">{theme.text_color}</span>
              <input
                type="color"
                value={theme.text_color}
                onChange={e => updateTheme({ text_color: e.target.value, preset: 'custom' })}
                className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Typography</h3>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Font family</label>
          <select
            value={theme.font}
            onChange={e => updateTheme({ font: e.target.value })}
            className="w-full h-8 px-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {FONTS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Button Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['rounded', 'pill', 'square'] as const).map(style => (
            <button
              key={style}
              onClick={() => updateTheme({ button_style: style })}
              className={`py-2 text-xs font-medium border-2 transition-all ${
                theme.button_style === style
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              } ${style === 'rounded' ? 'rounded-lg' : style === 'pill' ? 'rounded-full' : 'rounded-none'}`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

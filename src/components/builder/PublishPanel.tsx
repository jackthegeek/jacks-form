import { useState } from 'react';
import { Globe, Copy, Code, QrCode, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Form } from '../../lib/types';
import { toast } from '../shared/Toast';

interface Props {
  form: Form;
}

export function PublishPanel({ form }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const publicUrl = `${window.location.origin}/f/${form.slug}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast('success', 'Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      <div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
          form.is_published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
        }`}>
          <Globe size={12} />
          {form.is_published ? 'Published and accepting responses' : 'Not published yet'}
        </div>
        {!form.is_published && (
          <p className="text-xs text-gray-400 mt-2 px-1">
            Use the Publish button in the toolbar to make this form live.
          </p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Public URL</h3>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 overflow-hidden">
            <p className="text-xs text-gray-600 truncate">{publicUrl}</p>
          </div>
          <button
            onClick={() => copyToClipboard(publicUrl, 'url')}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            {copied === 'url' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
        </div>
        {form.is_published && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-1.5 block"
          >
            Open form →
          </a>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Embed Code</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 relative">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all font-mono">{embedCode}</pre>
          <button
            onClick={() => copyToClipboard(embedCode, 'embed')}
            className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copied === 'embed' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">QR Code</h3>
        <button
          onClick={() => setShowQR(q => !q)}
          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <QrCode size={13} />
          {showQR ? 'Hide QR code' : 'Show QR code'}
        </button>
        {showQR && (
          <div className="mt-3 flex justify-center p-4 bg-white border border-gray-200 rounded-xl">
            <QRCodeSVG value={publicUrl} size={140} level="M" />
          </div>
        )}
      </div>
    </div>
  );
}

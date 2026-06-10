"use client";

export default function WidgetPage() {
  const embedCode = `<iframe
  src="https://3cardtrick-livid.vercel.app/widget/embed"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius:16px;border:1px solid #e2e8f0;"
  title="3S Stock Finder"
></iframe>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">Embeddable Widget</h1>
          <p className="text-slate-300">Embed the 3S Stock Finder on your website or blog.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Live preview */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4">Live Preview</h2>
          <iframe
            src="/widget/embed"
            width="100%"
            height="600"
            style={{ borderRadius: "16px", border: "1px solid #e2e8f0" }}
            title="3S Stock Finder Widget Preview"
          />
        </div>

        {/* Embed code */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4">Embed Code</h2>
          <div className="bg-slate-900 rounded-2xl p-5">
            <pre className="text-sm text-emerald-400 whitespace-pre-wrap break-all font-mono">{embedCode}</pre>
          </div>
          <CopyEmbedButton code={embedCode} />
        </div>

        <p className="text-xs text-slate-400">
          The widget is free to embed. It respects the same search limits as the main site.
          Add <code className="bg-slate-100 px-1 rounded">?sector=Pharma</code> to pre-fill a sector on load.
        </p>
      </div>
    </div>
  );
}

function CopyEmbedButton({ code }: { code: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(code)}
      className="mt-3 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      type="button"
    >
      Copy embed code
    </button>
  );
}

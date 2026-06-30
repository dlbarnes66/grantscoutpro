export function AssetReporting({ assets }: { assets: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Asset Reporting
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {assets.map((asset) => (
          <li key={asset.id} className="flex items-center justify-between">
            <span>{asset.name}</span>
            <span className="text-slate-400">${asset.value.toLocaleString()}</span>
            <span className="text-blue-400 font-semibold">{asset.status}</span>
          </li>
        ))}
      </ul>

      <button className="rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
        Update Asset Status
      </button>
    </div>
  );
}

export function Table({ columns, rows }) {
  return (
    <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900">
      <table className="w-full text-left">
        
        {/* Header */}
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-sm font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-800/50 transition">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-300 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

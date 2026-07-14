export function Card({ children, className = "" }) {
  return (
    <div className={`p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow-md transition ${className}`}>
      {children}
    </div>
  );
}

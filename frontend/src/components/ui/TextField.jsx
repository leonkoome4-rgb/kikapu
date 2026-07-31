export default function TextField({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="label-caps mb-1.5 block text-basket-taupe">{label}</span>}
      <input
        className={`w-full rounded-xl border border-basket-ink/15 bg-white px-4 py-2.5 text-basket-ink placeholder:text-basket-taupe/50 transition-all duration-200 focus:border-basket-green focus:outline-none focus:ring-4 focus:ring-basket-green/15 ${className}`}
        {...props}
      />
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
    </label>
  );
}

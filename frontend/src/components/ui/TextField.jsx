export default function TextField({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="label-caps mb-1.5 block text-[11px] text-basket-taupe">{label}</span>}
      <input
        className={`w-full rounded-lg border border-basket-ink/15 bg-white px-3.5 py-2.5 text-basket-ink placeholder:text-basket-taupe/60 focus:border-basket-green focus:outline-none focus:ring-2 focus:ring-basket-green/20 ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

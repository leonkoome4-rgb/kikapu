export default function Card({ children, className = "" }) {
  const hasCustomBg = /(^|\s)bg-/.test(className);
  return (
    <div
      className={`rounded-2xl border border-basket-ink/10 p-6 shadow-sm ${hasCustomBg ? "" : "bg-white"} ${className}`}
    >
      {children}
    </div>
  );
}

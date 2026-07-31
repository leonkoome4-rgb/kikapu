export default function Card({ children, className = "", hover = false }) {
  const hasCustomBg = /(^|\s)bg-/.test(className);
  return (
    <div
      className={`rounded-2xl border border-basket-ink/10 p-6 shadow-sm transition-all duration-200 ${
        hasCustomBg ? "" : "bg-white"
      } ${hover ? "hover:-translate-y-0.5 hover:shadow-md" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

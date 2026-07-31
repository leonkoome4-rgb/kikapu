const styles = {
  pending:
    "bg-basket-gold/10 text-basket-gold border-basket-gold/25",
  completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed:
    "bg-red-50 text-red-700 border-red-200",
  rejected:
    "bg-red-50 text-red-700 border-red-200",
  sent:
    "bg-blue-50 text-blue-700 border-blue-200",
};

export default function Badge({ status, className = "" }) {
  const style = styles[status] || "bg-basket-ink/5 text-basket-ink border-basket-ink/10";
  return (
    <span
      className={`label-caps inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${style} ${className}`}
    >
      {status === "completed" && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {status === "pending" && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {status}
    </span>
  );
}

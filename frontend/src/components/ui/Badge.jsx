const styles = {
  pending: "bg-basket-gold/15 text-basket-gold-light border-basket-gold/30",
  completed: "bg-basket-green/10 text-basket-green border-basket-green/25",
  approved: "bg-basket-green/10 text-basket-green border-basket-green/25",
  failed: "bg-red-100 text-red-700 border-red-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function Badge({ status }) {
  const style = styles[status] || "bg-basket-ink/5 text-basket-ink border-basket-ink/10";
  return (
    <span className={`label-caps inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] ${style}`}>
      {status}
    </span>
  );
}

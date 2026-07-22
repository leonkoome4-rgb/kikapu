const variants = {
  primary: "bg-basket-green text-basket-cream hover:bg-basket-green-dark",
  gold: "bg-basket-gold text-basket-ink hover:bg-basket-gold-light",
  outline: "border border-basket-ink/20 text-basket-ink hover:border-basket-green hover:text-basket-green",
  ghost: "text-basket-taupe hover:text-basket-ink",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`label-caps inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

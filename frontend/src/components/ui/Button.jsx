const variants = {
  primary:
    "bg-basket-green text-basket-cream shadow-sm shadow-basket-green/20 hover:bg-basket-green-light hover:shadow-md hover:shadow-basket-green/30 active:scale-[0.97]",
  gold:
    "bg-basket-gold text-basket-ink shadow-sm shadow-basket-gold/20 hover:bg-basket-gold-light hover:shadow-md hover:shadow-basket-gold/20 active:scale-[0.97]",
  outline:
    "border border-basket-ink/15 text-basket-ink bg-white hover:border-basket-green hover:text-basket-green hover:bg-basket-green/5 active:scale-[0.97]",
  ghost:
    "text-basket-taupe hover:text-basket-ink hover:bg-basket-ink/5 active:scale-[0.97]",
  danger:
    "bg-red-700 text-white shadow-sm shadow-red-700/20 hover:bg-red-800 hover:shadow-md active:scale-[0.97]",
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
      className={`label-caps inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Please wait…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

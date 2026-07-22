export default function Logo({ className = "h-9 w-9", withWordmark = false, wordmarkClassName = "" }) {
  const mark = (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M20 24C13 20 13 9 21 6" stroke="#7A4B2A" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M44 24C51 20 51 9 43 6" stroke="#7A4B2A" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M14 26L18 50C18.4 52.5 20.5 54 23 54H41C43.5 54 45.6 52.5 46 50L50 26Z"
        fill="#0B4D3C"
      />
      <path d="M16.2 31H47.8" stroke="#FBFAF7" strokeOpacity="0.35" strokeWidth="1.4" />
      <path d="M17.4 37H46.6" stroke="#FBFAF7" strokeOpacity="0.35" strokeWidth="1.4" />
      <path d="M18.6 43H45.4" stroke="#FBFAF7" strokeOpacity="0.35" strokeWidth="1.4" />
      <path d="M19.8 49H44.2" stroke="#FBFAF7" strokeOpacity="0.35" strokeWidth="1.4" />
      <path
        d="M21 26L20 54M28 26L27.3 54M36 26L36.7 54M44 26L45 54"
        stroke="#FBFAF7"
        strokeOpacity="0.25"
        strokeWidth="1.2"
      />
      <rect x="13" y="22" width="38" height="6" rx="3" fill="#C98A2C" />
      <rect x="13" y="22" width="38" height="2.4" rx="1.2" fill="#0B4D3C" />
    </svg>
  );

  if (!withWordmark) return mark;

  return (
    <span className="inline-flex items-center gap-2">
      {mark}
      <span className={`font-display font-extrabold text-basket-green tracking-tight ${wordmarkClassName}`}>
        Kikapu
      </span>
    </span>
  );
}

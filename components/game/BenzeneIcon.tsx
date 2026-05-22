export function BenzeneIcon({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={compact ? "benzene-svg benzene-svg-compact" : "benzene-svg"}
      fill="none"
    >
      <polygon points="50,8 83,28 83,72 50,92 17,72 17,28" className="benzene-outline" />
      <circle cx="50" cy="50" r="18" className="benzene-ring" />
    </svg>
  );
}
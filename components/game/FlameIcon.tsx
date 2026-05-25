export function FlameIcon({ compact = false }: { compact?: boolean }) {
  return (
    <svg className={compact ? "h-4 w-4" : "h-5 w-5"} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.6 2.6c.4 3.2-1.7 4.8-3.4 6.4-1.4 1.3-2.5 2.7-2.5 5 0 3 2.1 5.5 5.1 5.5 3.2 0 5.6-2.4 5.6-5.9 0-2.7-1.4-4.8-3.3-6.7-.2 1.5-.9 2.5-1.8 3.2.5-2.3.2-4.8.3-7.5Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="M11.5 13.1c-.9.9-1.5 1.8-1.5 3.1 0 1.6 1.2 2.8 2.8 2.8 1.7 0 3-1.3 3-3 0-1.5-.8-2.8-2-3.9-.2 1.1-.7 1.9-1.4 2.4.1-1.1-.2-1.9-.9-1.4Z" fill="#fde68a" />
    </svg>
  );
}

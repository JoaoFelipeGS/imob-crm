export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-4">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/70 bg-panel/70 px-8 py-8 shadow-panel backdrop-blur-xl">
        <div className="animate-float-soft flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 shadow-glow">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="#00E5C7" strokeWidth="1.7" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#7C5CFF" strokeWidth="1.7" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-ink">Órbita CRM</p>
          <p className="mt-1 text-sm text-ink-muted">Carregando seu painel...</p>
        </div>
      </div>
    </div>
  );
}

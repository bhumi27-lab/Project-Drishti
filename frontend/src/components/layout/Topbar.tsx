export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur">
      <span className="text-sm text-text-muted">SOC</span>
      <span className="flex items-center gap-2 text-xs text-text-muted">
        <span className="size-2 rounded-full bg-success" />
        Live
      </span>
    </header>
  )
}

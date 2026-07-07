export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-[30px]">{value}</div>
      <div className="font-punk-mono text-[11px] text-ink-600">
        {label}
      </div>
    </div>
  )
}

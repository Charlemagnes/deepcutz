export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl">{value}</div>
      <div className="font-punk-mono text-11 text-ink-600">
        {label}
      </div>
    </div>
  )
}

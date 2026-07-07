export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-[family-name:var(--font-bungee)] text-[30px]">{value}</div>
      <div className="font-[family-name:var(--font-space-mono)] text-[11px] text-[#555]">
        {label}
      </div>
    </div>
  )
}

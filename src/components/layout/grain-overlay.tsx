export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,.045) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }}
    />
  )
}

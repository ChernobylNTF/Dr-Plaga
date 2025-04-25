interface ExplosionProps {
  x: number
  y: number
  size: number
}

export default function Explosion({ x, y, size }: ExplosionProps) {
  return (
    <div
      className="absolute rounded-full z-40 animate-explosion"
      style={{
        left: `${x - size / 2}px`,
        top: `${y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: "radial-gradient(circle, rgba(255,165,0,0.8) 0%, rgba(255,69,0,0.6) 50%, rgba(255,0,0,0) 100%)",
        boxShadow: "0 0 20px rgba(255, 165, 0, 0.8)",
      }}
    />
  )
}

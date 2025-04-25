interface BulletProps {
  x: number
  y: number
  width: number
  height: number
  debug?: boolean
  power?: number
}

export default function Bullet({ x, y, width, height, debug = false, power = 1 }: BulletProps) {
  // Calcular el hitbox (ligeramente más pequeño que el elemento visual)
  const hitboxPadding = 2
  const hitboxStyle = {
    left: `${x + hitboxPadding}px`,
    top: `${y + hitboxPadding}px`,
    width: `${width - 2 * hitboxPadding}px`,
    height: `${height - 2 * hitboxPadding}px`,
  }

  // Determinar el color según el poder
  const getBulletColor = () => {
    switch (power) {
      case 3:
        return "bg-red-400"
      case 2:
        return "bg-purple-400"
      default:
        return "bg-green-300"
    }
  }

  return (
    <>
      <div
        className={`absolute rounded-full z-25 ${getBulletColor()}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          boxShadow: `0 0 8px rgba(0, 255, 0, 0.9)`,
          border: "1px solid white",
        }}
      />

      {/* Hitbox visual (solo en modo debug) */}
      {debug && <div className="absolute border-2 border-yellow-400 z-40 pointer-events-none" style={hitboxStyle} />}
    </>
  )
}

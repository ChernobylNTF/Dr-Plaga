interface EnemyProps {
  x: number
  y: number
  width: number
  height: number
  debug?: boolean
  health?: number
}

export default function Enemy({ x, y, width, height, debug = false, health = 1 }: EnemyProps) {
  // Calcular el hitbox (ligeramente más pequeño que el elemento visual)
  const hitboxPadding = 5
  const hitboxStyle = {
    left: `${x + hitboxPadding}px`,
    top: `${y + hitboxPadding}px`,
    width: `${width - 2 * hitboxPadding}px`,
    height: `${height - 2 * hitboxPadding}px`,
  }

  // Determinar el color según la salud
  const getEnemyColor = () => {
    switch (health) {
      case 3:
        return "bg-red-800"
      case 2:
        return "bg-red-700"
      default:
        return "bg-red-600"
    }
  }

  return (
    <>
      <div
        className={`absolute rounded-full flex items-center justify-center z-20 ${getEnemyColor()}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          boxShadow: "0 0 8px rgba(255, 0, 0, 0.7)",
          border: "2px solid black",
        }}
      >
        <div className="w-1/2 h-1/2 bg-black rounded-full"></div>
        {health > 1 && (
          <div className="absolute -top-4 left-0 w-full flex justify-center">
            <div className="px-1 py-0 bg-black bg-opacity-50 rounded text-xs text-white">{health}</div>
          </div>
        )}
      </div>

      {/* Hitbox visual (solo en modo debug) */}
      {debug && <div className="absolute border-2 border-yellow-400 z-40 pointer-events-none" style={hitboxStyle} />}
    </>
  )
}

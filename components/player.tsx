import { WeaponType } from "./game-play"

interface PlayerProps {
  x: number
  y: number
  width: number
  height: number
  debug?: boolean
  weaponType?: WeaponType
}

export default function Player({ x, y, width, height, debug = false, weaponType = WeaponType.BASIC }: PlayerProps) {
  // Calcular el hitbox (ligeramente más pequeño que el elemento visual)
  const hitboxPadding = 5
  const hitboxStyle = {
    left: `${x + hitboxPadding}px`,
    top: `${y + hitboxPadding}px`,
    width: `${width - 2 * hitboxPadding}px`,
    height: `${height - 2 * hitboxPadding}px`,
  }

  // Determinar el color según el arma
  const getPlayerColor = () => {
    switch (weaponType) {
      case WeaponType.DOUBLE:
        return "bg-blue-500"
      case WeaponType.TRIPLE:
        return "bg-purple-500"
      case WeaponType.RAPID:
        return "bg-yellow-500"
      case WeaponType.POWERFUL:
        return "bg-red-500"
      default:
        return "bg-green-500"
    }
  }

  return (
    <>
      <div
        className={`absolute rounded-full flex items-center justify-center z-30 ${getPlayerColor()}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          boxShadow: "0 0 10px rgba(0, 255, 0, 0.7)",
          border: "2px solid white",
        }}
      >
        <div className="w-1/2 h-1/2 bg-white rounded-full"></div>
      </div>

      {/* Hitbox visual (solo en modo debug) */}
      {debug && <div className="absolute border-2 border-yellow-400 z-40 pointer-events-none" style={hitboxStyle} />}
    </>
  )
}

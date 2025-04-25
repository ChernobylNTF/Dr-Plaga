import { SupplyType, WeaponType } from "./game-play"

interface SupplyProps {
  x: number
  y: number
  width: number
  height: number
  debug?: boolean
  type?: SupplyType
  value?: string | number
}

export default function Supply({
  x,
  y,
  width,
  height,
  debug = false,
  type = SupplyType.SCORE,
  value = 10,
}: SupplyProps) {
  // Calcular el hitbox (ligeramente más pequeño que el elemento visual)
  const hitboxPadding = 2
  const hitboxStyle = {
    left: `${x + hitboxPadding}px`,
    top: `${y + hitboxPadding}px`,
    width: `${width - 2 * hitboxPadding}px`,
    height: `${height - 2 * hitboxPadding}px`,
  }

  // Determinar el color y símbolo según el tipo
  const getSupplyStyle = () => {
    switch (type) {
      case SupplyType.WEAPON:
        // Determinar color según el arma
        switch (value) {
          case WeaponType.DOUBLE:
            return { bg: "bg-blue-400", text: "D", textColor: "text-white" }
          case WeaponType.TRIPLE:
            return { bg: "bg-purple-400", text: "T", textColor: "text-white" }
          case WeaponType.RAPID:
            return { bg: "bg-yellow-400", text: "R", textColor: "text-black" }
          case WeaponType.POWERFUL:
            return { bg: "bg-red-500", text: "P", textColor: "text-white" }
          default:
            return { bg: "bg-green-400", text: "B", textColor: "text-white" }
        }
      case SupplyType.SCORE:
        return { bg: "bg-blue-400", text: "+", textColor: "text-white" }
      default:
        return { bg: "bg-blue-400", text: "?", textColor: "text-white" }
    }
  }

  const style = getSupplyStyle()

  return (
    <>
      <div
        className={`absolute rounded-sm flex items-center justify-center z-10 ${style.bg}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          boxShadow: "0 0 6px rgba(0, 100, 255, 0.7)",
          border: "2px solid white",
        }}
      >
        <div className={`w-3/4 h-3/4 bg-white text-xs flex items-center justify-center font-bold ${style.textColor}`}>
          {style.text}
        </div>
      </div>

      {/* Hitbox visual (solo en modo debug) */}
      {debug && <div className="absolute border-2 border-yellow-400 z-40 pointer-events-none" style={hitboxStyle} />}
    </>
  )
}

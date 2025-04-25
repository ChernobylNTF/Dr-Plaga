import { WeaponType } from "./game-play"

interface WeaponInfoProps {
  type: WeaponType
}

export default function WeaponInfo({ type }: WeaponInfoProps) {
  // Obtener información del arma
  const getWeaponInfo = () => {
    switch (type) {
      case WeaponType.DOUBLE:
        return { name: "Doble", color: "text-blue-400", bg: "bg-blue-900" }
      case WeaponType.TRIPLE:
        return { name: "Triple", color: "text-purple-400", bg: "bg-purple-900" }
      case WeaponType.RAPID:
        return { name: "Rápido", color: "text-yellow-400", bg: "bg-yellow-900" }
      case WeaponType.POWERFUL:
        return { name: "Poderoso", color: "text-red-500", bg: "bg-red-900" }
      default:
        return { name: "Básico", color: "text-green-400", bg: "bg-green-900" }
    }
  }

  const info = getWeaponInfo()

  return (
    <div className="absolute top-22 left-2 bg-black bg-opacity-50 px-3 py-1 rounded-md z-50 mt-2">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${info.bg} mr-2`}></div>
        <span className={`font-bold ${info.color}`}>Arma: {info.name}</span>
      </div>
    </div>
  )
}

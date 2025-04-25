"use client"

import { Button } from "@/components/ui/button"
import { Skull } from "lucide-react"

interface GameStartProps {
  onStart: () => void
}

export default function GameStart({ onStart }: GameStartProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-900 to-red-900 p-6 text-center">
      <div className="mb-8">
        <Skull className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-red-500 mb-2">Dr. Plaga</h1>
        <h2 className="text-2xl font-semibold text-white mb-6">Escape the Horde</h2>
        <p className="text-gray-300 mb-8">
          Ayuda al Dr. Plaga a escapar de la horda de infectados. ¡Sobrevive el mayor tiempo posible!
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Cómo jugar:</h3>
        <ul className="text-left text-gray-300 space-y-2">
          <li>• Toca la pantalla para mover al Dr. Plaga</li>
          <li>• Dispara automáticamente a los infectados</li>
          <li>• Evita a los infectados a toda costa</li>
          <li>• Recoge suministros para ganar puntos</li>
          <li>• Destruye infectados para ganar puntos</li>
        </ul>
      </div>

      <Button onClick={onStart} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-xl">
        ¡COMENZAR!
      </Button>
    </div>
  )
}

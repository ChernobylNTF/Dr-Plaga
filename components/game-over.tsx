"use client"

import { Button } from "@/components/ui/button"
import { Skull } from "lucide-react"

interface GameOverProps {
  score: number
  tokens: number
  onRestart: () => void
}

export default function GameOver({ score, tokens, onRestart }: GameOverProps) {
  // Calcular el nivel alcanzado
  const level = Math.floor(score / 1000) + 1

  // Determinar el mensaje según el nivel
  const getMessage = () => {
    if (level <= 1) return "Apenas comenzaste tu escape..."
    if (level <= 3) return "Un buen intento, pero la horda es implacable."
    if (level <= 5) return "¡Impresionante! Casi logras escapar."
    return "¡Increíble! Eres un verdadero superviviente."
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-black to-red-900 p-6 text-center">
      <Skull className="w-20 h-20 text-red-500 mb-4" />
      <h1 className="text-4xl font-bold text-red-500 mb-6">Game Over</h1>

      <div className="mb-8">
        <p className="text-xl text-gray-300 mb-2">La horda te ha atrapado</p>
        <p className="text-3xl font-bold text-white mb-2">Puntuación: {score}</p>
        <p className="text-2xl font-semibold text-yellow-400 mb-2">Nivel: {level}</p>
        <p className="text-2xl font-semibold text-yellow-500 mb-6">
          <span className="inline-block w-5 h-5 rounded-full bg-yellow-500 mr-2 text-xs flex items-center justify-center">
            D
          </span>
          Coin DSY: {tokens}
        </p>
        <p className="text-lg text-gray-300">{getMessage()}</p>
      </div>

      <Button onClick={onRestart} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-xl" type="button">
        Intentar de nuevo
      </Button>
    </div>
  )
}

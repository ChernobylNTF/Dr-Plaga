"use client"

import { useState } from "react"
import GameStart from "./game-start"
import GamePlay from "./game-play"
import GameOver from "./game-over"

export type GameState = "start" | "playing" | "gameover"

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [score, setScore] = useState(0)
  const [tokens, setTokens] = useState(0)

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setTokens(0)
  }

  const endGame = (finalScore: number, finalTokens: number) => {
    setScore(finalScore)
    setTokens(finalTokens)
    setGameState("gameover")
  }

  const restartGame = () => {
    setGameState("start")
  }

  return (
    <div className="w-full max-w-md mx-auto h-[80vh] relative overflow-hidden rounded-lg shadow-lg border border-red-900">
      {gameState === "start" && <GameStart onStart={startGame} />}
      {gameState === "playing" && <GamePlay onGameOver={endGame} />}
      {gameState === "gameover" && <GameOver score={score} tokens={tokens} onRestart={restartGame} />}
    </div>
  )
}

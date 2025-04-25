"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTouch } from "@/hooks/use-touch"
import Player from "./player"
import Enemy from "./enemy"
import Supply from "./supply"
import Bullet from "./bullet"
import Explosion from "./explosion"
import GameBackground from "./game-background"
import WeaponInfo from "./weapon-info"
import TokenDisplay from "./token-display"
import { Button } from "@/components/ui/button"
import { Pause, Trophy, Volume2, VolumeX } from "lucide-react"

// Tipos de armas disponibles
export enum WeaponType {
  BASIC = "basic",
  DOUBLE = "double",
  TRIPLE = "triple",
  RAPID = "rapid",
  POWERFUL = "powerful",
}

// Tipos de suministros
export enum SupplyType {
  HEALTH = "health",
  WEAPON = "weapon",
  SCORE = "score",
}

interface GamePlayProps {
  onGameOver: (score: number, tokens: number) => void
}

interface Position {
  x: number
  y: number
}

interface GameObject extends Position {
  id: number
  width: number
  height: number
}

interface BulletObject extends GameObject {
  speed: number
  power: number
}

interface EnemyObject extends GameObject {
  health: number
  speed: number
}

interface SupplyObject extends GameObject {
  type: SupplyType
  value: string | number
}

interface ExplosionObject extends Position {
  id: number
  size: number
}

export default function GamePlay({ onGameOver }: GamePlayProps) {
  // Referencias al DOM
  const containerRef = useRef<HTMLDivElement>(null)

  // Estado del juego
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [player, setPlayer] = useState<GameObject>({ id: 0, x: 0, y: 0, width: 40, height: 40 })
  const [enemies, setEnemies] = useState<EnemyObject[]>([])
  const [supplies, setSupplies] = useState<SupplyObject[]>([])
  const [bullets, setBullets] = useState<BulletObject[]>([])
  const [explosions, setExplosions] = useState<ExplosionObject[]>([])
  const [score, setScore] = useState(0)
  const [tokens, setTokens] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [gameTime, setGameTime] = useState(0)
  const [difficulty, setDifficulty] = useState(1)
  const [debug, setDebug] = useState(false)
  const [level, setLevel] = useState(1)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>(WeaponType.BASIC)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Referencias para el bucle del juego
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const enemySpawnTimeRef = useRef<number>(0)
  const supplySpawnTimeRef = useRef<number>(0)
  const levelUpAnimationRef = useRef<number>(0)
  const explosionTimeoutIds = useRef<number[]>([])

  // Referencias para evitar re-renderizados
  const playerRef = useRef(player)
  const enemiesRef = useRef(enemies)
  const suppliesRef = useRef(supplies)
  const bulletsRef = useRef(bullets)
  const explosionsRef = useRef(explosions)
  const scoreRef = useRef(score)
  const tokensRef = useRef(tokens)
  const difficultyRef = useRef(difficulty)
  const gameTimeRef = useRef(gameTime)
  const isPausedRef = useRef(isPaused)
  const levelRef = useRef(level)
  const currentWeaponRef = useRef<WeaponType>(currentWeapon)
  const soundEnabledRef = useRef(soundEnabled)

  // Referencias para audio
  const shootSoundRef = useRef<HTMLAudioElement | null>(null)
  const explosionSoundRef = useRef<HTMLAudioElement | null>(null)
  const levelUpSoundRef = useRef<HTMLAudioElement | null>(null)
  const tokenSoundRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar sonidos
  useEffect(() => {
    // Función para crear un audio con manejo de errores
    const createAudio = (name: string) => {
      if (typeof window === "undefined") return null

      try {
        // Usar un elemento de audio vacío en lugar de cargar archivos que no existen
        const audio = new Audio()

        // Agregar un manejador de errores para evitar errores en consola
        audio.addEventListener("error", (e) => {
          console.log(`Audio ${name} no disponible:`, e)
        })

        return audio
      } catch (error) {
        console.log(`Error al crear audio ${name}:`, error)
        return null
      }
    }

    // Crear elementos de audio
    shootSoundRef.current = createAudio("shoot")
    explosionSoundRef.current = createAudio("explosion")
    levelUpSoundRef.current = createAudio("levelup")
    tokenSoundRef.current = createAudio("token")

    return () => {
      // Limpiar timeouts de explosiones al desmontar
      explosionTimeoutIds.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  // Actualizar refs cuando cambian los estados
  useEffect(() => {
    playerRef.current = player
  }, [player])
  useEffect(() => {
    enemiesRef.current = enemies
  }, [enemies])
  useEffect(() => {
    suppliesRef.current = supplies
  }, [supplies])
  useEffect(() => {
    bulletsRef.current = bullets
  }, [bullets])
  useEffect(() => {
    explosionsRef.current = explosions
  }, [explosions])
  useEffect(() => {
    scoreRef.current = score
  }, [score])
  useEffect(() => {
    tokensRef.current = tokens
  }, [tokens])
  useEffect(() => {
    difficultyRef.current = difficulty
  }, [difficulty])
  useEffect(() => {
    gameTimeRef.current = gameTime
  }, [gameTime])
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])
  useEffect(() => {
    levelRef.current = level
  }, [level])
  useEffect(() => {
    currentWeaponRef.current = currentWeapon
  }, [currentWeapon])
  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  // Efecto para verificar si se ha subido de nivel
  useEffect(() => {
    // Comprobar si el jugador ha subido de nivel (cada 1000 puntos)
    const newLevel = Math.floor(score / 1000) + 1
    if (newLevel > levelRef.current) {
      setLevel(newLevel)
      setShowLevelUp(true)
      levelUpAnimationRef.current = 0

      // Aumentar dificultad con cada nivel
      setDifficulty((prev) => prev + 0.5)

      // Reproducir sonido de subida de nivel
      if (soundEnabledRef.current && levelUpSoundRef.current) {
        try {
          levelUpSoundRef.current.currentTime = 0
          levelUpSoundRef.current.play().catch((e) => {
            // Silenciar errores de reproducción
            console.log("No se pudo reproducir el sonido de subida de nivel")
          })
        } catch (error) {
          // Silenciar cualquier error
        }
      }
    }

    // Comprobar si se ha ganado un token (cada 1000 puntos)
    const newTokens = Math.floor(score / 1000)
    if (newTokens > tokensRef.current) {
      setTokens(newTokens)

      // Reproducir sonido de token
      if (soundEnabledRef.current && tokenSoundRef.current) {
        try {
          tokenSoundRef.current.currentTime = 0
          tokenSoundRef.current.play().catch((e) => {
            // Silenciar errores de reproducción
            console.log("No se pudo reproducir el sonido de token")
          })
        } catch (error) {
          // Silenciar cualquier error
        }
      }
    }
  }, [score])

  // Touch controls
  const { touchPosition, isTouching } = useTouch(containerRef)

  // Initialize container size and player position
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setContainerSize({ width, height })
      setPlayer((prev) => ({
        ...prev,
        x: width / 2 - prev.width / 2,
        y: height - prev.height - 20,
      }))
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  // Move player based on touch
  useEffect(() => {
    if (!touchPosition || isPaused || containerSize.width === 0) return

    const newX = Math.max(0, Math.min(containerSize.width - player.width, touchPosition.x - player.width / 2))

    // Solo actualizar si la posición realmente cambió significativamente
    if (Math.abs(newX - player.x) > 2) {
      setPlayer((prev) => ({
        ...prev,
        x: newX,
      }))
    }
  }, [touchPosition, isPaused, containerSize.width, player.width, player.x])

  // Reproducir sonido de disparo
  const playShootSound = useCallback(() => {
    if (soundEnabledRef.current && shootSoundRef.current) {
      try {
        // Clonar el sonido para permitir múltiples reproducciones simultáneas
        const sound = new Audio()
        sound.volume = 0.3 // Reducir volumen para no ser molesto
        sound.play().catch((e) => {
          // Silenciar errores de reproducción
          console.log("No se pudo reproducir el sonido de disparo")
        })
      } catch (error) {
        // Silenciar cualquier error
      }
    }
  }, [])

  // Reproducir sonido de explosión
  const playExplosionSound = useCallback(() => {
    if (soundEnabledRef.current && explosionSoundRef.current) {
      try {
        // Clonar el sonido para permitir múltiples reproducciones simultáneas
        const sound = new Audio()
        sound.volume = 0.4 // Reducir volumen para no ser molesto
        sound.play().catch((e) => {
          // Silenciar errores de reproducción
          console.log("No se pudo reproducir el sonido de explosión")
        })
      } catch (error) {
        // Silenciar cualquier error
      }
    }
  }, [])

  // Crear una explosión
  const createExplosion = useCallback(
    (x: number, y: number, size = 30) => {
      const newExplosion: ExplosionObject = {
        id: Date.now(),
        x,
        y,
        size,
      }

      setExplosions((prev) => [...prev, newExplosion])

      // Eliminar la explosión después de 500ms
      const timeoutId = window.setTimeout(() => {
        setExplosions((prev) => prev.filter((exp) => exp.id !== newExplosion.id))
      }, 500)

      explosionTimeoutIds.current.push(timeoutId)

      // Reproducir sonido de explosión
      playExplosionSound()
    },
    [playExplosionSound],
  )

  // Fire bullets based on weapon type
  const fireBullet = useCallback(() => {
    const currentPlayer = playerRef.current
    const weapon = currentWeaponRef.current
    const newBullets: BulletObject[] = []

    // Configuración de armas
    switch (weapon) {
      case WeaponType.DOUBLE:
        // Dos balas paralelas
        newBullets.push({
          id: Date.now(),
          x: currentPlayer.x + currentPlayer.width / 4 - 5,
          y: currentPlayer.y - 10,
          width: 8,
          height: 12,
          speed: 8,
          power: 1,
        })
        newBullets.push({
          id: Date.now() + 1,
          x: currentPlayer.x + (currentPlayer.width * 3) / 4 - 5,
          y: currentPlayer.y - 10,
          width: 8,
          height: 12,
          speed: 8,
          power: 1,
        })
        break

      case WeaponType.TRIPLE:
        // Tres balas en abanico
        newBullets.push({
          id: Date.now(),
          x: currentPlayer.x + currentPlayer.width / 2 - 5,
          y: currentPlayer.y - 10,
          width: 10,
          height: 15,
          speed: 9,
          power: 1,
        })
        newBullets.push({
          id: Date.now() + 1,
          x: currentPlayer.x + currentPlayer.width / 4 - 5,
          y: currentPlayer.y - 5,
          width: 8,
          height: 12,
          speed: 8,
          power: 1,
        })
        newBullets.push({
          id: Date.now() + 2,
          x: currentPlayer.x + (currentPlayer.width * 3) / 4 - 5,
          y: currentPlayer.y - 5,
          width: 8,
          height: 12,
          speed: 8,
          power: 1,
        })
        break

      case WeaponType.RAPID:
        // Una bala rápida
        newBullets.push({
          id: Date.now(),
          x: currentPlayer.x + currentPlayer.width / 2 - 4,
          y: currentPlayer.y - 10,
          width: 8,
          height: 14,
          speed: 12,
          power: 1,
        })
        break

      case WeaponType.POWERFUL:
        // Una bala poderosa
        newBullets.push({
          id: Date.now(),
          x: currentPlayer.x + currentPlayer.width / 2 - 7,
          y: currentPlayer.y - 10,
          width: 14,
          height: 18,
          speed: 7,
          power: 3,
        })
        break

      default:
        // Arma básica
        newBullets.push({
          id: Date.now(),
          x: currentPlayer.x + currentPlayer.width / 2 - 5,
          y: currentPlayer.y - 10,
          width: 10,
          height: 15,
          speed: 8,
          power: 1,
        })
    }

    setBullets((prev) => [...prev, ...newBullets])
    playShootSound()
  }, [playShootSound])

  // Check for collisions
  const checkCollisions = useCallback(() => {
    const currentPlayer = playerRef.current
    const currentEnemies = enemiesRef.current
    const currentSupplies = suppliesRef.current
    const currentBullets = bulletsRef.current

    // Definir hitboxes más pequeños que los elementos visuales para mayor precisión
    const playerHitbox = {
      left: currentPlayer.x + 5,
      right: currentPlayer.x + currentPlayer.width - 5,
      top: currentPlayer.y + 5,
      bottom: currentPlayer.y + currentPlayer.height - 5,
    }

    // Verificar colisiones entre balas y enemigos
    const remainingBullets = [...currentBullets]
    const remainingEnemies = [...currentEnemies]
    let enemiesDestroyed = false

    // Verificar cada bala contra cada enemigo
    for (let i = remainingBullets.length - 1; i >= 0; i--) {
      const bullet = remainingBullets[i]
      const bulletHitbox = {
        left: bullet.x + 2,
        right: bullet.x + bullet.width - 2,
        top: bullet.y + 2,
        bottom: bullet.y + bullet.height - 2,
      }

      for (let j = remainingEnemies.length - 1; j >= 0; j--) {
        const enemy = remainingEnemies[j]
        const enemyHitbox = {
          left: enemy.x + 5,
          right: enemy.x + enemy.width - 5,
          top: enemy.y + 5,
          bottom: enemy.y + enemy.height - 5,
        }

        // Verificar colisión bala-enemigo
        if (
          bulletHitbox.left < enemyHitbox.right &&
          bulletHitbox.right > enemyHitbox.left &&
          bulletHitbox.top < enemyHitbox.bottom &&
          bulletHitbox.bottom > enemyHitbox.top
        ) {
          // Reducir la salud del enemigo según el poder de la bala
          enemy.health -= bullet.power

          // Eliminar la bala
          remainingBullets.splice(i, 1)

          // Crear explosión en el punto de impacto
          createExplosion(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.power * 10 + 20)

          // Si el enemigo ha sido destruido
          if (enemy.health <= 0) {
            // Eliminar el enemigo
            remainingEnemies.splice(j, 1)

            // Crear explosión más grande
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 40)

            // Aumentar puntuación
            setScore((prevScore) => prevScore + 5)
          }

          enemiesDestroyed = true
          break // Esta bala ya no puede golpear a más enemigos
        }
      }
    }

    // Actualizar balas y enemigos si hubo cambios
    if (enemiesDestroyed) {
      setBullets(remainingBullets)
      setEnemies(remainingEnemies)
    }

    // Verificar colisiones jugador-enemigo
    for (const enemy of remainingEnemies) {
      const enemyHitbox = {
        left: enemy.x + 5,
        right: enemy.x + enemy.width - 5,
        top: enemy.y + 5,
        bottom: enemy.y + enemy.height - 5,
      }

      // Verificar si hay colisión
      if (
        playerHitbox.left < enemyHitbox.right &&
        playerHitbox.right > enemyHitbox.left &&
        playerHitbox.top < enemyHitbox.bottom &&
        playerHitbox.bottom > enemyHitbox.top
      ) {
        console.log("¡Colisión con enemigo detectada!")
        // Crear explosión grande
        createExplosion(currentPlayer.x + currentPlayer.width / 2, currentPlayer.y + currentPlayer.height / 2, 60)
        onGameOver(scoreRef.current, tokensRef.current)
        return
      }
    }

    // Verificar colisiones con suministros
    let collectedSupplies = false
    const newSupplies = currentSupplies.filter((supply) => {
      const supplyHitbox = {
        left: supply.x + 2,
        right: supply.x + supply.width - 2,
        top: supply.y + 2,
        bottom: supply.y + supply.height - 2,
      }

      // Verificar si hay colisión
      const isCollected =
        playerHitbox.left < supplyHitbox.right &&
        playerHitbox.right > supplyHitbox.left &&
        playerHitbox.top < supplyHitbox.bottom &&
        playerHitbox.bottom > supplyHitbox.top

      if (isCollected) {
        collectedSupplies = true
        console.log("¡Suministro recogido!", supply.type, supply.value)

        // Aplicar efecto según el tipo de suministro
        switch (supply.type) {
          case SupplyType.SCORE:
            setScore((prevScore) => prevScore + (supply.value as number))
            break
          case SupplyType.WEAPON:
            setCurrentWeapon(supply.value as WeaponType)
            break
        }
      }

      // Mantener el suministro si no ha sido recogido
      return !isCollected
    })

    // Actualizar suministros si se recogió alguno
    if (collectedSupplies) {
      setSupplies(newSupplies)
    }
  }, [onGameOver, createExplosion])

  // Game loop
  const gameLoop = useCallback(
    (time: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = time
      }

      const deltaTime = time - previousTimeRef.current
      previousTimeRef.current = time

      // Manejar la animación de subida de nivel
      if (showLevelUp) {
        levelUpAnimationRef.current += deltaTime
        if (levelUpAnimationRef.current > 2000) {
          // Mostrar durante 2 segundos
          setShowLevelUp(false)
        }
      }

      if (!isPausedRef.current) {
        // Update game time
        const newGameTime = gameTimeRef.current + deltaTime
        setGameTime(newGameTime)

        // Disparar si se está tocando la pantalla
        if (isTouching) {
          // Limitar la frecuencia de disparo según el arma
          const weapon = currentWeaponRef.current
          let fireRate = 500 // ms entre disparos

          switch (weapon) {
            case WeaponType.RAPID:
              fireRate = 200 // Más rápido
              break
            case WeaponType.POWERFUL:
              fireRate = 800 // Más lento
              break
            default:
              fireRate = 500 // Normal
          }

          // Verificar si es momento de disparar
          if (newGameTime % fireRate < deltaTime) {
            fireBullet()
          }
        }

        // Spawn enemies
        enemySpawnTimeRef.current += deltaTime
        const currentLevel = levelRef.current
        const spawnRate = Math.max(1500 - currentLevel * 100, 500) / difficultyRef.current

        if (enemySpawnTimeRef.current > spawnRate) {
          enemySpawnTimeRef.current = 0

          // Calcular salud y velocidad según el nivel
          const health = Math.min(currentLevel, 3)
          const speed = 2 + currentLevel * 0.3

          const newEnemy: EnemyObject = {
            id: Date.now(),
            x: Math.random() * (containerSize.width - 30),
            y: -30,
            width: 30,
            height: 30,
            health,
            speed,
          }

          setEnemies((prev) => [...prev, newEnemy])
        }

        // Spawn supplies
        supplySpawnTimeRef.current += deltaTime
        if (supplySpawnTimeRef.current > 5000) {
          // Cada 5 segundos
          supplySpawnTimeRef.current = 0
          if (Math.random() < 0.4) {
            // 40% de probabilidad
            // Determinar tipo de suministro
            let type: SupplyType
            let value: string | number

            const rand = Math.random()
            if (rand < 0.6) {
              // 60% puntos
              type = SupplyType.SCORE
              value = 20
            } else {
              // 40% armas
              type = SupplyType.WEAPON

              // Determinar qué arma dar según el nivel
              const weaponRand = Math.random()
              if (currentLevel >= 5 && weaponRand < 0.2) {
                value = WeaponType.POWERFUL
              } else if (currentLevel >= 4 && weaponRand < 0.4) {
                value = WeaponType.TRIPLE
              } else if (currentLevel >= 3 && weaponRand < 0.6) {
                value = WeaponType.RAPID
              } else if (currentLevel >= 2 && weaponRand < 0.8) {
                value = WeaponType.DOUBLE
              } else {
                value = WeaponType.BASIC
              }
            }

            const newSupply: SupplyObject = {
              id: Date.now(),
              x: Math.random() * (containerSize.width - 20),
              y: -20,
              width: 20,
              height: 20,
              type,
              value,
            }

            setSupplies((prev) => [...prev, newSupply])
          }
        }

        // Move enemies
        setEnemies((prev) =>
          prev
            .map((enemy) => ({
              ...enemy,
              y: enemy.y + enemy.speed, // Usar la velocidad específica del enemigo
            }))
            .filter((enemy) => enemy.y < containerSize.height),
        )

        // Move supplies
        setSupplies((prev) =>
          prev
            .map((supply) => ({
              ...supply,
              y: supply.y + 1.5,
            }))
            .filter((supply) => supply.y < containerSize.height),
        )

        // Move bullets
        setBullets((prev) =>
          prev
            .map((bullet) => ({
              ...bullet,
              y: bullet.y - bullet.speed,
            }))
            .filter((bullet) => bullet.y + bullet.height > 0),
        )

        // Check collisions
        checkCollisions()
      }

      requestRef.current = requestAnimationFrame(gameLoop)
    },
    [containerSize, fireBullet, checkCollisions, showLevelUp, isTouching],
  )

  // Start game loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameLoop])

  // Toggle pause
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  // Toggle debug mode
  const toggleDebug = useCallback(() => {
    setDebug((prev) => !prev)
  }, [])

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-800 relative touch-none overflow-hidden">
      {/* Background based on level */}
      <GameBackground level={level} />

      {/* Score and level display */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded-md z-50">
        <span className="text-white font-bold">Score: {score}</span>
      </div>

      <div className="absolute top-12 left-2 bg-black bg-opacity-50 px-3 py-1 rounded-md z-50">
        <span className="text-white font-bold">Level: {level}</span>
      </div>

      {/* Weapon info */}
      <WeaponInfo type={currentWeapon} />

      {/* Token display */}
      <TokenDisplay tokens={tokens} />

      {/* Pause button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2 bg-black bg-opacity-50 z-50"
        onClick={togglePause}
        type="button"
      >
        <Pause className="h-4 w-4" />
      </Button>

      {/* Sound toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-12 bg-black bg-opacity-50 z-50"
        onClick={toggleSound}
        type="button"
      >
        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Button>

      {/* Debug button */}
      {debug && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-12 right-2 bg-black bg-opacity-50 z-50"
          onClick={toggleDebug}
          type="button"
        >
          Debug: ON
        </Button>
      )}

      {/* Game elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Player */}
        <Player
          x={player.x}
          y={player.y}
          width={player.width}
          height={player.height}
          debug={debug}
          weaponType={currentWeapon}
        />

        {/* Bullets */}
        {bullets.map((bullet) => (
          <Bullet
            key={bullet.id}
            x={bullet.x}
            y={bullet.y}
            width={bullet.width}
            height={bullet.height}
            debug={debug}
            power={bullet.power}
          />
        ))}

        {/* Enemies */}
        {enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            x={enemy.x}
            y={enemy.y}
            width={enemy.width}
            height={enemy.height}
            debug={debug}
            health={enemy.health}
          />
        ))}

        {/* Supplies */}
        {supplies.map((supply) => (
          <Supply
            key={supply.id}
            x={supply.x}
            y={supply.y}
            width={supply.width}
            height={supply.height}
            debug={debug}
            type={supply.type}
            value={supply.value}
          />
        ))}

        {/* Explosions */}
        {explosions.map((explosion) => (
          <Explosion key={explosion.id} x={explosion.x} y={explosion.y} size={explosion.size} />
        ))}
      </div>

      {/* Level up notification */}
      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-black bg-opacity-70 px-8 py-6 rounded-lg text-center animate-bounce">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <h2 className="text-3xl font-bold text-yellow-400">¡NIVEL {level}!</h2>
            <p className="text-white mt-2">La infección se intensifica...</p>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Juego Pausado</h2>
            <Button onClick={togglePause} className="bg-red-600 hover:bg-red-700" type="button">
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

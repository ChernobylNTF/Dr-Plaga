"use client"

interface GameBackgroundProps {
  level: number
}

export default function GameBackground({ level }: GameBackgroundProps) {
  // Determinar el fondo según el nivel
  const getBackgroundStyle = () => {
    switch (level) {
      case 1:
        return {
          backgroundImage: "linear-gradient(to bottom, #1a202c, #2d3748)",
        }
      case 2:
        return {
          backgroundImage: "linear-gradient(to bottom, #742a2a, #9b2c2c)",
        }
      case 3:
        return {
          backgroundImage: "linear-gradient(to bottom, #22543d, #276749)",
        }
      case 4:
        return {
          backgroundImage: "linear-gradient(to bottom, #2a4365, #3182ce)",
        }
      case 5:
        return {
          backgroundImage: "linear-gradient(to bottom, #44337a, #6b46c1)",
        }
      default:
        // Para niveles superiores a 5, crear un patrón más complejo
        return {
          backgroundImage: `
            linear-gradient(to bottom, 
              rgba(0, 0, 0, 0.9), 
              rgba(${(level * 20) % 255}, ${(level * 10) % 255}, ${(level * 30) % 255}, 0.8)
            ),
            radial-gradient(
              circle at ${level % 2 === 0 ? "top left" : "bottom right"},
              rgba(${(level * 30) % 255}, ${(level * 15) % 255}, ${(level * 25) % 255}, 0.8),
              rgba(0, 0, 0, 0.8)
            )
          `,
        }
    }
  }

  // Añadir elementos decorativos según el nivel
  const getDecorations = () => {
    const decorations = []

    // Añadir estrellas/partículas para niveles 3+
    if (level >= 3) {
      const starCount = Math.min(level * 10, 100)
      for (let i = 0; i < starCount; i++) {
        const size = Math.random() * 3 + 1
        decorations.push(
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white opacity-70"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`,
            }}
          />,
        )
      }
    }

    // Añadir niebla para niveles 2+
    if (level >= 2) {
      const fogCount = Math.min(level * 2, 10)
      for (let i = 0; i < fogCount; i++) {
        const width = Math.random() * 30 + 20
        const opacity = Math.random() * 0.2 + 0.1
        decorations.push(
          <div
            key={`fog-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${width}%`,
              height: `${width / 2}%`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: opacity,
              filter: "blur(20px)",
              animation: `float ${Math.random() * 20 + 30}s infinite alternate`,
            }}
          />,
        )
      }
    }

    return decorations
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={getBackgroundStyle()}>
      {/* Decoraciones de fondo */}
      {getDecorations()}

      {/* Efecto de vignette */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, transparent 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Indicador de nivel */}
      <div className="absolute bottom-2 right-2 text-xs text-white opacity-30">Nivel {level}</div>

      {/* Estilos para animaciones */}
      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        @keyframes float {
          0% { transform: translateY(0) translateX(-10%); }
          50% { transform: translateY(-20px) translateX(10%); }
          100% { transform: translateY(0) translateX(-5%); }
        }
      `}</style>
    </div>
  )
}

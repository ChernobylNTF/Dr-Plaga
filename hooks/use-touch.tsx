"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"

interface TouchPosition {
  x: number
  y: number
}

export function useTouch(containerRef: React.RefObject<HTMLElement>) {
  // Usar useRef en lugar de useState para evitar re-renderizados innecesarios
  const touchPositionRef = useRef<TouchPosition | null>(null)
  const [touchPosition, setTouchPosition] = useState<TouchPosition | null>(null)
  const [isTouching, setIsTouching] = useState(false)

  // Usar un ref para rastrear si los event listeners ya están configurados
  const listenersSetupRef = useRef(false)

  // Función para actualizar la posición del toque
  const updateTouchPosition = useCallback((x: number, y: number) => {
    touchPositionRef.current = { x, y }
    // Usar un timeout para evitar actualizaciones de estado demasiado frecuentes
    requestAnimationFrame(() => {
      setTouchPosition(touchPositionRef.current)
    })
  }, [])

  // Manejadores de eventos memoizados
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      if (!containerRef.current) return

      setIsTouching(true)
      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      updateTouchPosition(touch.clientX - rect.left, touch.clientY - rect.top)
    },
    [containerRef, updateTouchPosition],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      if (!containerRef.current) return

      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      updateTouchPosition(touch.clientX - rect.left, touch.clientY - rect.top)
    },
    [containerRef, updateTouchPosition],
  )

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false)
  }, [])

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      if (!containerRef.current) return

      setIsTouching(true)
      const rect = containerRef.current.getBoundingClientRect()
      updateTouchPosition(e.clientX - rect.left, e.clientY - rect.top)
    },
    [containerRef, updateTouchPosition],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (e.buttons !== 1) return // Solo rastrear cuando el botón del ratón está presionado
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      updateTouchPosition(e.clientX - rect.left, e.clientY - rect.top)
    },
    [containerRef, updateTouchPosition],
  )

  const handleMouseUp = useCallback(() => {
    setIsTouching(false)
  }, [])

  // Configurar event listeners solo una vez
  useEffect(() => {
    const container = containerRef.current
    if (!container || listenersSetupRef.current) return

    // Marcar que los listeners ya están configurados
    listenersSetupRef.current = true

    // Agregar event listeners
    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)
    container.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    // Función de limpieza
    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      listenersSetupRef.current = false
    }
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp])

  return { touchPosition, isTouching }
}

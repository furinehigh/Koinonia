"use client"

import React, { useEffect, useState } from "react"

export default function GridReveal() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [radius, setRadius] = useState(225)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      let clientX: number
      let clientY: number

      if (e instanceof TouchEvent) {
        const t = e.touches[0] ?? e.changedTouches[0]
        if (!t) return
        clientX = t.clientX
        clientY = t.clientY
      } else {
        clientX = (e as MouseEvent).clientX
        clientY = (e as MouseEvent).clientY
      }

      setPos({ x: clientX, y: clientY })
      setVisible(true)
    }

    const onLeave = () => setVisible(false)

    window.addEventListener("mousemove", onMove)
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("mouseleave", onLeave)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  const gridPattern = `
    repeating-linear-gradient(0deg, rgba(120,120,120,0.25) 0 1px, transparent 1px 40px),
    repeating-linear-gradient(90deg, rgba(120,120,120,0.25) 0 1px, transparent 1px 40px)
  `

  return (
    <div className="fixed inset-0 -z-10 bg-white">
      {/* Grid layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: gridPattern,
          backgroundSize: "40px 40px",
          WebkitMaskImage: visible
            ? `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, black 0%, transparent 100%)`
            : "none",
          maskImage: visible
            ? `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, black 0%, transparent 100%)`
            : "none",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          transition: "opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Soft glow following cursor */}
      <div
        className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: pos.x,
          top: pos.y,
          width: radius * 2,
          height: radius * 2,
          filter: "blur(25px)",
          opacity: visible ? 0.25 : 0,
          transition: "opacity 0.3s ease",
          background: "radial-gradient(circle, rgba(100,100,100,0.25) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
    </div>
  )
}

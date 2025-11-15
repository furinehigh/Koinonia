"use client"

import { useEffect, useRef } from "react"

export default function ConstellationField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouse = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.3 + Math.random()
    }))

    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      mouse.current.active = true
    }

    const leave = () => (mouse.current.active = false)

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseleave", leave)
    window.addEventListener("resize", resize)

    const loop = () => {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, w, h)

      for (const s of stars) {
        if (mouse.current.active) {
          const dx = s.x - mouse.current.x
          const dy = s.y - mouse.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const f = (150 - dist) / 150
            s.x += (dx / dist) * f * 2
            s.y += (dy / dist) * f * 2
          }
        }

        s.x += s.vx
        s.y += s.vy

        if (s.x < 0 || s.x > w) s.vx *= -1
        if (s.y < 0 || s.y > h) s.vy *= -1
      }

      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 0.6

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i]
          const b = stars[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = dx * dx + dy * dy

          if (dist < 130 * 130) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const s of stars) {
        ctx.beginPath()
        ctx.fillStyle = "black"
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      requestAnimationFrame(loop)
    }

    loop()

    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseleave", leave)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
    />
  )
}

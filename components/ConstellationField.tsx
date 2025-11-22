"use client"

import { useEffect, useRef } from "react"

export default function FrameworkField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouse = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    // grid cells
    const gap = 80
    const points: { x: number; y: number; ox: number; oy: number }[] = []

    for (let y = 0; y < h + gap; y += gap) {
      for (let x = 0; x < w + gap; x += gap) {
        points.push({ x, y, ox: x, oy: y })
      }
    }

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
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = "rgba(0,0,0,0.12)"
      ctx.lineWidth = 1

      // gentle movement toward/away from cursor
      for (const p of points) {
        if (mouse.current.active) {
          const dx = p.ox - mouse.current.x
          const dy = p.oy - mouse.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 200) {
            const force = (200 - dist) / 200
            p.x = p.ox + (dx / dist) * force * 15
            p.y = p.oy + (dy / dist) * force * 15
          } else {
            // relax back to origin
            p.x += (p.ox - p.x) * 0.05
            p.y += (p.oy - p.y) * 0.05
          }
        } else {
          p.x += (p.ox - p.x) * 0.05
          p.y += (p.oy - p.y) * 0.05
        }
      }

      // draw connecting lines (like blueprint scaffold)
      for (let i = 0; i < points.length; i++) {
        const a = points[i]

        // only connect right + down to avoid spaghetti
        if (i + 1 < points.length && Math.abs(points[i + 1].oy - a.oy) < 5)
          draw(a, points[i + 1])

        const below = points.find(p => p.ox === a.ox && p.oy === a.oy + gap)
        if (below) draw(a, below)
      }

      // render subtle node dots
      ctx.fillStyle = "rgba(0,0,0,0.35)"
      for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      requestAnimationFrame(loop)
    }

    const draw = (a: any, b: any) => {
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }

    loop()

    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseleave", leave)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />
}

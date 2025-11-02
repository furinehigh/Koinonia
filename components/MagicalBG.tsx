"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Ghost } from "lucide-react"

const ghosts = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  size: 35 + Math.random() * 40,
  color: Math.random() > 0.5 ? "white" : "black",
}))

export default function SpookyReactiveBG() {
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 })
  const [isStill, setIsStill] = useState(false)
  const [isAway, setIsAway] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      setIsStill(false)
      setIsAway(false)
      clearTimeout(timeout)
      timeout = setTimeout(() => setIsStill(true), 1200)
    }

    const handleMouseLeave = () => {
      setIsAway(true)
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      clearTimeout(timeout)
    }
  }, [])

  const getRandomPosition = () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  })

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {ghosts.map((ghost) => (
        <motion.div
          key={ghost.id}
          initial={getRandomPosition()}
          animate={
            isAway
              ? getRandomPosition()
              : {
                  x:
                    mousePos.x +
                    (isStill
                      ? (Math.random() - 0.5) * 200
                      : (Math.random() - 0.5) * 400),
                  y:
                    mousePos.y +
                    (isStill
                      ? (Math.random() - 0.5) * 200
                      : (Math.random() - 0.5) * 400),
                  scale: isStill ? 1.4 : 1,
                  rotate: Math.random() * 360,
                }
          }
          transition={{
            type: "spring",
            stiffness: isStill ? 60 : 200,
            damping: 15,
            mass: 0.5,
            duration: isAway ? 3 : 0.8,
            repeat: isAway ? Infinity : 0,
          }}
          className="absolute pointer-events-none"
        >
          <Ghost size={ghost.size} className="opacity-80 drop-shadow-lg" />
        </motion.div>
      ))}
    </div>
  )
}

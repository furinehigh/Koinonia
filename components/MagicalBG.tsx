"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const leaves = [
  { src: "/leaves/leaf1.png", size: 40 },
  { src: "/leaves/leaf2.png", size: 50 },
  { src: "/leaves/leaf3.png", size: 45 },
  { src: "/leaves/leaf4.png", size: 55 },
  { src: "/leaves/leaf1.png", size: 60 },
  { src: "/leaves/leaf2.png", size: 48 },
  { src: "/leaves/leaf3.png", size: 52 },
]

export default function MagicalBG() {
  const [positions, setPositions] = useState<{ left: number; delay: number }[]>([])

  useEffect(() => {
    setPositions(
      leaves.map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 8,
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {leaves.map((item, i) => {
        const pos = positions[i] || { left: 0, delay: 0 }
        return (
          <motion.img
            key={i}
            src={item.src}
            className="absolute opacity-90"
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
              left: `${pos.left}%`,
              top: `-${item.size}px`,
            }}
            animate={{
              y: ["-10vh", "110vh"],
              x: [0, 20, -20, 10, 0],
              rotate: [0, 45, -45, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: pos.delay,
            }}
          />
        )
      })}
    </div>
  )
}

"use client"
import { motion } from "framer-motion"

const leaves = [
  { emoji: "🍁", size: 40 },
  { emoji: "🍂", size: 36 },
  { emoji: "🍃", size: 42 },
  { emoji: "🍁", size: 50 },
  { emoji: "🍂", size: 45 },
  { emoji: "🍃", size: 38 },
]

export default function MagicalBG() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            fontSize: `${leaf.size}px`,
            left: `${Math.random() * 100}%`,
            top: `${-10 - Math.random() * 20}%`,
          }}
          animate={{
            y: ["0%", "110%"],
            x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        >
          {leaf.emoji}
        </motion.div>
      ))}
    </div>
  )
}

"use client"
import { motion } from "framer-motion"

const items = [
  { name: "Scroll of Wisdom", color: "rgba(200,200,200,0.15)", size: 90 },
  { name: "Arcane Orb", color: "rgba(150,150,150,0.2)", size: 60 },
  { name: "Silver Wand", color: "rgba(180,180,180,0.1)", size: 70 },
  { name: "Crystal Rune", color: "rgba(220,220,220,0.1)", size: 80 },
  { name: "Book of Mana", color: "rgba(255,255,255,0.08)", size: 100 },
]

export default function MagicalBG() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute backdrop-blur-md rounded-full"
          style={{
            background: item.color,
            width: `${item.size}px`,
            height: `${item.size}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

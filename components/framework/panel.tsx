// components/framework/panel.tsx
import { cn } from "@/lib/utils"

export default function FrameworkPanel({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "border border-neutral-300 bg-white p-4 rounded-none transition-all",
      "hover:border-neutral-800",
      className
    )}>
      {children}
    </div>
  )
}

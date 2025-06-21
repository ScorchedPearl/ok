"use client"

import { cn } from "@/lib/utils"
import { Check, Plus } from "lucide-react"

interface FilterPillProps {
  label: string
  isActive: boolean
  onClick: () => void
  className?: string
}

export function FilterPill({ label, isActive, onClick, className }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
        isActive ? "bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        className,
      )}

      style={{ background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)" }}
    >
      {isActive ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      {label}
    </button>
  )
}


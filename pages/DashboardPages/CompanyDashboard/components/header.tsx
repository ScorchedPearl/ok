import { useState, useEffect } from "react"
import { Search, Settings, Bell } from "lucide-react"
import {Link} from "react-router-dom"
import Notifications from "./notifications"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null)

  const handleNotificationClick = () => {
    setIsOpen((prev) => !prev)

    // Clear existing timer if any
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
    }

    // Set new timer only if opening the notifications
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false)
      }, 3000)
      setAutoCloseTimer(timer)
    }
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer)
      }
    }
  }, [autoCloseTimer])

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#EBEEF2]">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-[#2D3648]">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AvJOiVjBAdsvikXmoTLvagjSOJCJNj.png"
            alt="BankDash Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className = "hidden sm:inline">BankDash.</span>
        </Link>
        <h1 className="text-xl font-semibold text-[#2D3648] hidden sm:inline">Overview</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search for something"
            className="w-32 sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border-0 focus-visible:ring-2 focus-visible:ring-offset-0"
          />
        </div>

        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
          <Settings className="h-5 w-5 text-gray-700" />
        </Button>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5 text-gray-700" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0 bg-white" align="end">
            <Notifications />
          </PopoverContent>
        </Popover>

        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AvJOiVjBAdsvikXmoTLvagjSOJCJNj.png"
          alt="Profile"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
        />
      </div>
    </header>
  )
}


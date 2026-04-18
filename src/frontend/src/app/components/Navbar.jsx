'use client'

import { Bell, Settings, User } from 'lucide-react'

export default function Navbar({ accountName = 'Admin' }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left — Logo */}
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-orange-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-lg font-bold text-gray-800 tracking-tight">
          Problem Seeker
        </span>
      </div>

      {/* Right — Account + Icons */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">{accountName}</span>

        {/* Profile */}
        <button className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors">
          <User size={18} className="text-orange-500" />
        </button>

        {/* Bell */}
        <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors relative">
          <Bell size={18} className="text-gray-600" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Settings */}
        <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
          <Settings size={18} className="text-gray-600" />
        </button>
      </div>
    </header>
  )
}

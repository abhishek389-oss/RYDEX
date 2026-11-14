"use client"
import { motion } from 'motion/react'

function TabButton({ active, count, onClick, icon, children }: any) {
  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs
        font-medium transition-all duration-200 select-none cursor-pointer
        ${active
          ? "bg-neutral-950 text-white shadow-md shadow-black/15 font-semibold"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        }
      `}
    >
      <span className={`flex items-center ${active ? "text-white" : "text-gray-400"}`}>
        {icon}
      </span>
      <span className='hidden sm:inline'>{children}</span>
      <span
        className={`min-w-4.5 h-4.5 px-1 text-[10px] font-bold rounded-full flex
          items-center justify-center transition-all 
          ${active
            ? "bg-white text-black"
            : count > 0
            ? "bg-red-500 text-white"
            : "bg-gray-200 text-gray-400"
          }`}
      >
        {count}
      </span>
    </motion.div>
  )
}

export default TabButton
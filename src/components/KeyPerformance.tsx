"use client"
import { motion } from 'motion/react'
import React from 'react'

const KEY_PERFORMANCE_CARD: Record<string, { iconBg: string, iconColor: string, cardHover: string }> = {

  totalPartners: {
    iconBg: "bg-purple-50",
    iconColor: "text-purple-700",
    cardHover: "hover:shadow-purple-100/60"
  },
  approved: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-800",
    cardHover: "hover:shadow-blue-100/60"
  },
  pending: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-800",
    cardHover: "hover:shadow-amber-100/60"
  },
  rejected: {
    iconBg: "bg-red-50",
    iconColor: "text-red-800",
    cardHover: "hover:shadow-red-100/60"
  }

}

function KeyPerformance({ label, value, icon, variant }: any) {

  const cfg = KEY_PERFORMANCE_CARD[variant]
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs cursor-default relative overflow-hidden group ${cfg.cardHover}`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl
          ${cfg.iconBg}`}
        style={{ zIndex: 0 }} />

      <div className='relative z-10'>
        <motion.div
          whileHover={{ rotate: -6, scale: 1.08 }}
          transition={{ type: "spring", stiffness: 400 }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${cfg.iconBg} ${cfg.iconColor}`}
        >
          {icon}
        </motion.div>
        
        <p className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5'>{label}</p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className='text-2xl font-bold text-gray-950 leading-tight'
        >
          {value}
        </motion.div>
      </div>

    </motion.div>
  )
}

export default KeyPerformance
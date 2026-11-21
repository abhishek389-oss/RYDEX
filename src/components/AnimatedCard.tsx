"use client"
import { motion } from 'motion/react'
import React from 'react'
function AnimatedCard({title,icon,children}:any) {
  return (
    <motion.div
    whileHover={{ y:-4 }}
    whileTap={{ y:-3, scale: 0.99 }}
    transition={{ duration: 0.2 }}
    className='bg-white rounded-[32px] p-6 sm:p-8 shadow-xl active:shadow-2xl space-y-6 touch-manipulation select-none'
    >
      <div className='flex items-center gap-2 font-semibold'>
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  )
}

export default AnimatedCard
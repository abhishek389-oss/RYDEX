"use client"
import { motion } from 'motion/react'
import React from 'react'

function StatusCard({ icon, title, desc }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start sm:items-center'
        >
            <div className='bg-black text-white p-2.5 rounded-lg shrink-0 flex items-center justify-center'>
                {icon}
            </div>

            <div className='flex-1'>
                <h2 className='text-sm sm:text-base font-semibold text-gray-900'>{title}</h2>
                <p className='text-gray-500 text-xs sm:text-sm mt-0.5'>{desc}</p>
            </div>

        </motion.div>
    )
}

export default StatusCard
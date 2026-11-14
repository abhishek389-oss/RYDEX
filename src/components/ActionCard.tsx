"use client"
import React from 'react'

function ActionCard({ icon, title, button, onclick }: any) {
  return (
    <div
      className='bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'
    >
      <div className='flex items-center gap-3.5'>
        <div className='bg-black text-white p-2.5 rounded-lg shrink-0 flex items-center justify-center'>
          {icon}
        </div>
        <div className='text-sm sm:text-base font-semibold text-gray-900'>
          {title}
        </div>
      </div>
      <button
        className='w-full sm:w-auto bg-black text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition hover:bg-gray-800 cursor-pointer flex items-center justify-center gap-1.5'
        onClick={onclick}
      >
        {button}
      </button>
    </div>
  )
}

export default ActionCard
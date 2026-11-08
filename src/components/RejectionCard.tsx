"use client"
import { AlertTriangle } from 'lucide-react'
import React from 'react'

function RejectionCard({ title, reason, actionLabel, onAction }: any) {
    return (
        <div className='bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 space-y-3'>
            <div className='flex items-center gap-2 text-red-600 font-semibold text-xs sm:text-sm'>
                <AlertTriangle size={16} />
                {title}
            </div>
            <div className='bg-white border border-red-100 rounded-lg p-3 text-xs sm:text-sm text-gray-700 leading-relaxed'>
                {reason}
            </div>
            {
                onAction && (
                    <button
                        onClick={onAction}
                        className='w-full sm:w-auto px-4 py-2 bg-black text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition cursor-pointer'
                    >
                        {actionLabel || "Retry"}
                    </button>
                )
            }
        </div>
    )
}

export default RejectionCard
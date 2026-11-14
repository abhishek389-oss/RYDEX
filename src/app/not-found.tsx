"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { ArrowLeft, Car } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#0b0b0b] text-white flex flex-col items-center justify-center px-4 relative select-none">
      
      <div className="absolute w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none -top-20 left-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 max-w-md w-full flex flex-col items-center text-center"
      >
        <div className="mb-6 flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <Image 
            src="/logo.png" 
            alt="Rydex Logo" 
            width={40} 
            height={40} 
            priority 
            className="w-auto h-auto"
          />
        </div>

        <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold uppercase tracking-widest text-gray-300 border border-white/5">
          Error 404 • Destination Not Found
        </span>

        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight mt-4 text-white">
          Wrong Turn?
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 mt-3 max-w-sm leading-relaxed">
          The route you requested doesn’t exist or has ended. Let’s get you back on track with Rydex.
        </p>

        <div className="mt-8 w-full sm:w-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-gray-200 transition-colors shadow-[0_4px_20px_rgba(255,255,255,0.1)] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Home</span>
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-2 text-[11px] text-gray-500">
          <Car size={14} className="text-gray-400" />
          <span>Rydex Premium Mobility</span>
        </div>
      </motion.div>
    </div>
  )
}
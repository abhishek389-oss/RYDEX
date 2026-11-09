"use client"
import React from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { motion } from 'motion/react'
import { 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Clock, 
  Car, 
  Bike, 
  Truck, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Live Booking",
    desc: "Real-time driver matching and live tracking powered by WebSockets and precision maps."
  },
  {
    icon: ShieldCheck,
    title: "Verified Fleet & Drivers",
    desc: "Rigorous onboarding with document screening and mandatory Admin Video KYC verification."
  },
  {
    icon: Clock,
    title: "Zero Hidden Charges",
    desc: "Transparent upfront pricing with clear base fare, per-km rates, and no surge surprises."
  },
  {
    icon: Sparkles,
    title: "AI-Assisted Experience",
    desc: "Smart route suggestions, quick chat prompts, and intelligent ride status management."
  }
]

const FLEET = [
  { id: "bike", label: "Two Wheeler", icon: Bike, desc: "Fast city commutes" },
  { id: "car", label: "Cars & Cabs", icon: Car, desc: "Comfortable travel" },
  { id: "logistics", label: "Mini Truck & Loading", icon: Truck, desc: "Heavy transport & parcels" }
]

const STATS = [
  { label: "On-Time Arrival", value: "99.4%" },
  { label: "Verified Partners", value: "100%" },
  { label: "Secure Rides", value: "OTP-Protected" },
  { label: "Active Support", value: "24 / 7" }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-between selection:bg-zinc-900 selection:text-white">
      <Nav />

      <main className="flex-1 px-4 pt-24 pb-16 max-w-5xl mx-auto w-full space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold shadow-xs">
            <Sparkles size={13} className="text-zinc-700" />
            <span>Modern Mobility & Logistics</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Seamless Rides. Smarter Logistics.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Rydex is built to simplify modern urban transport. Whether it's a quick daily bike trip, a comfortable family ride, or moving goods across the city, we connect riders with thoroughly verified driver partners instantly.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {STATS.map((s, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="group bg-white hover:bg-zinc-950 rounded-2xl border border-zinc-200/90 hover:border-zinc-950 p-4 text-center shadow-xs hover:shadow-xl transition-all duration-200 cursor-default select-none"
            >
              <p className="text-lg sm:text-xl font-black text-zinc-950 group-hover:text-white tracking-tight transition-colors duration-200">{s.value}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 group-hover:text-zinc-400 font-medium uppercase tracking-wider mt-0.5 transition-colors duration-200">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">Built for Both Riders & Partners</h2>
              <p className="text-[11px] text-zinc-400">Reliable transport engineered from the ground up</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            We believe moving across your city shouldn't be stressful. Riders get secure, OTP-validated trips with live GPS tracking and direct in-app chat. Partners benefit from transparent daily earnings, flexible route controls, and streamlined payout management with verified bank integration.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {FLEET.map((f) => {
              const Icon = f.icon
              return (
                <motion.div 
                  key={f.id} 
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-950 border border-zinc-200/80 hover:border-zinc-950 flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-2xs select-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-zinc-900 border border-zinc-200 group-hover:border-zinc-800 flex items-center justify-center text-zinc-900 group-hover:text-white shadow-2xs shrink-0 transition-colors duration-200">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 group-hover:text-white truncate transition-colors duration-200">{f.label}</p>
                    <p className="text-[10px] text-zinc-400 group-hover:text-zinc-400 truncate transition-colors duration-200">{f.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">Why Choose Rydex</h2>
            <p className="text-xs text-zinc-400">Security, transparency, and speed at every step</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {FEATURES.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.25, delay: 0.05 * idx }}
                  className="group bg-white hover:bg-zinc-950 rounded-2xl border border-zinc-200/80 hover:border-zinc-950 p-5 shadow-xs hover:shadow-xl transition-all duration-200 space-y-2.5 cursor-pointer select-none"
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-white text-zinc-900 group-hover:text-zinc-950 flex items-center justify-center transition-colors duration-200">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-white transition-colors duration-200">{item.title}</h3>
                  <p className="text-xs text-zinc-500 group-hover:text-zinc-300 leading-relaxed transition-colors duration-200">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md"
        >
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold">Ready to ride or drive with us?</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              Book your ride in seconds or register as a partner to start earning with verified vehicle onboardings.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link 
              href="/user/book" 
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white text-zinc-950 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Book a Ride</span>
              <ArrowRight size={13} />
            </Link>
            <Link 
              href="/partner/onboarding/vehicle" 
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-700 transition-all active:scale-95 flex items-center justify-center"
            >
              Drive with Us
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  Bike,
  Car,
  Truck,
  MapPin,
  Navigation,
  IndianRupee,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Nav from '@/components/Nav'

const getVehicleIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "bike":
      return <Bike size={16} className="text-white" />
    case "truck":
    case "loading":
      return <Truck size={16} className="text-white" />
    default:
      return <Car size={16} className="text-white" />
  }
}

const statusBadge: Record<string, { label: string; cls: string }> = {
  requested: {
    label: "Requested",
    cls: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  confirmed: {
    label: "Confirmed",
    cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  started: {
    label: "In Progress",
    cls: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
  completed: {
    label: "Completed",
    cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
}

export default function UserBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/user/booking")
      const list = Array.isArray(data?.bookings)
        ? data.bookings
        : Array.isArray(data)
          ? data
          : []
      setBookings(list)
    } catch (error) {
      console.log("Fetch user bookings error:", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const safeBookings = Array.isArray(bookings) ? bookings : []

  const filteredBookings = safeBookings.filter((b) => {
    if (filter === "all") return true
    if (filter === "active") {
      return (
        b.bookingStatus === "confirmed" ||
        b.bookingStatus === "started" ||
        b.bookingStatus === "requested" ||
        b.bookingStatus === "awaiting_payment"
      )
    }
    if (filter === "completed") return b.bookingStatus === "completed"
    if (filter === "cancelled") {
      return b.bookingStatus === "cancelled" || b.bookingStatus === "rejected"
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-2 pt-24">
        <Loader2 className="w-7 h-7 text-white animate-spin" />
        <p className="text-white/40 text-xs tracking-widest uppercase font-medium">
          Loading bookings...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 pt-24 pb-8 max-w-4xl mx-auto">
      <Nav />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Your Rides</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            View and track your previous and active bookings
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl self-start sm:self-auto">
          {["all", "active", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${filter === tab
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-400 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Clock size={36} className="text-zinc-600 mb-3" />
          <h3 className="text-sm font-bold text-white">No rides found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            You don't have any rides under this category right now.
          </p>
          <button
            onClick={() => router.push("/user/book")}
            className="mt-4 px-4 py-2 bg-white text-zinc-950 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Book a Ride
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((b, idx) => {
            const badge = statusBadge[b.bookingStatus] || statusBadge.requested
            const isActive =
              b.bookingStatus === "confirmed" ||
              b.bookingStatus === "started" ||
              b.bookingStatus === "awaiting_payment"

            return (
              <motion.div
                key={b._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                      {getVehicleIcon(b.vehicle?.type)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white capitalize leading-tight">
                        {b.vehicle?.type || "Ride"} • {b.vehicle?.vehicleModel || "Standard"}
                      </p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-sm font-black text-white flex items-center gap-0.5">
                      <IndianRupee size={13} className="text-zinc-400" />
                      {b.fare}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <p className="text-zinc-300 truncate leading-snug">{b.pickUpAddress}</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <p className="text-zinc-300 truncate leading-snug">{b.dropAddress}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    ID: {b._id ? String(b._id).slice(-8) : "N/A"}
                  </span>

                  {isActive ? (
                    <button
                      onClick={() => router.push(`/user/ride/${b._id}`)}
                      className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Track Live</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/user/ride/${b._id}`)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
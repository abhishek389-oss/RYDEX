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
  Plus
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
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  confirmed: {
    label: "Confirmed",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  started: {
    label: "In Progress",
    cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  completed: {
    label: "Completed",
    cls: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
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
      <div className="min-h-dvh bg-zinc-100 flex flex-col items-center justify-center gap-2 pt-24">
        <Nav />
        <Loader2 className="w-7 h-7 text-zinc-900 animate-spin" />
        <p className="text-zinc-400 text-xs tracking-widest uppercase font-bold">
          Loading bookings...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900 px-4 sm:px-6 pt-24 pb-12">
      <Nav />
      <div className="relative max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="h-0.5 w-6 bg-zinc-900" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                RIDE HISTORY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              Your Rides
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              View and track your previous and active bookings
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white border border-zinc-200/90 p-1 rounded-xl self-start sm:self-end shadow-2xs overflow-x-auto max-w-full">
            {["all", "active", "completed", "cancelled"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer shrink-0 touch-manipulation ${
                  filter === tab
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-xs"
          >
            <div className="h-1 bg-zinc-900 w-full" />
            <div className="p-10 sm:p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-3">
                <Clock size={22} className="text-zinc-500" />
              </div>
              <h3 className="text-base font-black text-zinc-900">No rides found</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs font-medium">
                You don&apos;t have any rides under this category right now.
              </p>
              <button
                type="button"
                onClick={() => router.push("/user/book")}
                className="mt-5 px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer touch-manipulation"
              >
                <Plus size={14} />
                <span>Book a Ride</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b, idx) => {
              const badge = statusBadge[b.bookingStatus] || statusBadge.requested
              const isActive =
                b.bookingStatus === "confirmed" ||
                b.bookingStatus === "started" ||
                b.bookingStatus === "awaiting_payment"

              return (
                <motion.div
                  key={b._id || idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="bg-white border border-zinc-200/90 hover:border-zinc-300 active:border-zinc-900 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <div className="h-1 bg-zinc-900 w-full" />
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 shadow-2xs">
                          {getVehicleIcon(b.vehicle?.type)}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-black text-zinc-900 capitalize leading-tight">
                            {b.vehicle?.type || "Ride"} • {b.vehicle?.vehicleModel || "Standard"}
                          </p>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
                            <Calendar size={11} />
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-base font-black text-zinc-900 flex items-center">
                          <IndianRupee size={13} className="text-zinc-900 stroke-[2.5]" />
                          {b.fare}
                        </span>
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden mb-3.5">
                      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-zinc-100">
                        <div className="w-2 h-2 rounded-full bg-zinc-900 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-400">
                            PICKUP
                          </p>
                          <p className="text-xs font-semibold text-zinc-900 truncate leading-snug">
                            {b.pickUpAddress}
                          </p>
                        </div>
                        <MapPin size={12} className="text-zinc-400 shrink-0" />
                      </div>

                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-2 h-2 rounded-full border-2 border-zinc-900 bg-white shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-400">
                            DROP
                          </p>
                          <p className="text-xs font-semibold text-zinc-900 truncate leading-snug">
                            {b.dropAddress}
                          </p>
                        </div>
                        <Navigation size={12} className="text-zinc-400 shrink-0" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200/80">
                        ID: {b._id ? String(b._id).slice(-8).toUpperCase() : "N/A"}
                      </span>

                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/user/ride/${b._id}`)}
                          className="px-3.5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer touch-manipulation"
                        >
                          <span>Track Live</span>
                          <ArrowRight size={13} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => router.push(`/user/ride/${b._id}`)}
                          className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                        >
                          <span>Details</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
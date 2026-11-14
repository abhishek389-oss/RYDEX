"use client"
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { motion } from 'motion/react'
import { Zap, ChevronUp, CheckCircle2 } from 'lucide-react'
import { getSocket } from '@/lib/socket'
import PanelContent from '@/components/PanelContent'
import type { LiveRideMapProps } from '@/components/LiveRideMap'

const LiveRideMap = dynamic<LiveRideMapProps>(() => import('@/components/LiveRideMap'), {
  ssr: false,
})

const statusLabel: Record<string, { label: string; subLabel: string; dot: string }> = {
  requested: {
    label: "Awaiting Confirmation",
    subLabel: "Booking is being processed",
    dot: "bg-amber-400",
  },
  awaiting_payment: {
    label: "Payment Pending",
    subLabel: "Customer payment is pending",
    dot: "bg-blue-400",
  },
  confirmed: {
    label: "Heading to Pickup",
    subLabel: "Driver to the pickup location",
    dot: "bg-emerald-400",
  },
  started: {
    label: "Heading to Drop Location",
    subLabel: "Driving to the drop location",
    dot: "bg-indigo-400",
  },
  completed: {
    label: "Ride Completed",
    subLabel: "Trip finished successfully",
    dot: "bg-zinc-400",
  },
  cancelled: {
    label: "Ride Cancelled",
    subLabel: "Ride has been cancelled",
    dot: "bg-rose-500",
  },
  rejected: {
    label: "Ride Rejected",
    subLabel: "Ride was rejected",
    dot: "bg-rose-500",
  },
  idle: {
    label: "No Active Ride",
    subLabel: "Waiting for new ride requests",
    dot: "bg-zinc-400",
  },
}

const paymentBadge: Record<string, { label: string; cls: string }> = {
  pending: {
    label: "Payment Pending",
    cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  paid: {
    label: "Paid Online",
    cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  cash: {
    label: "Cash on Drop",
    cls: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  },
}

export default function PartnerActiveRidePage() {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [driverPosition, setDriverPosition] = useState<number[] | null>(null)
  const [pickupPosition, setPickupPosition] = useState<number[] | null>(null)
  const [dropPosition, setDropPosition] = useState<number[] | null>(null)
  const [status, setStatus] = useState<string>("")

  const [distanceToPickup, setDistanceToPickup] = useState(0)
  const [distanceToDrop, setDistanceToDrop] = useState(0)
  const [etaToPickup, setEtaToPickup] = useState(0)
  const [etaToDrop, setEtaToDrop] = useState(0)

  const [chatOpen, setChatOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true)

  const fetchActiveRide = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get("/api/partner/my-active")
      if (data?.booking) {
        setBooking(data.booking)
        setStatus(data.booking.bookingStatus)

        if (data.booking.pickUpLocation?.coordinates) {
          setPickupPosition([
            data.booking.pickUpLocation.coordinates[1],
            data.booking.pickUpLocation.coordinates[0],
          ])
        }

        if (data.booking.dropLocation?.coordinates) {
          setDropPosition([
            data.booking.dropLocation.coordinates[1],
            data.booking.dropLocation.coordinates[0],
          ])
        }
      } else {
        setStatus("idle")
      }
    } catch (error) {
      console.log(error)
      setStatus("idle")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveRide()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation || !booking?._id || status === "completed") return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        setDriverPosition([latitude, longitude])

        const socket = getSocket()
        socket.emit("driver_location_update", {
          bookingId: booking._id,
          latitude,
          longitude,
          status,
        })
      },
      (err) => {
        console.log("GPS error:", err)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [booking?._id, status])

  const cfg = statusLabel[status] || statusLabel.idle
  const isActive = status === "confirmed" || status === "started"
  const isCompleted = status === "completed"

  const displayEta = status === "confirmed" ? etaToPickup : etaToDrop
  const displayDistance = status === "confirmed" ? distanceToPickup : distanceToDrop
  const canChat = status === "confirmed" || status=="started"

  const onChatToggle = () => {
    setChatOpen((prev) => !prev)
  }

  const paymentStatus = paymentBadge[booking?.paymentStatus] || paymentBadge.cash

  const panelProps = {
    booking,
    status,
    isActive,
    displayEta,
    displayDistance,
    canChat,
    chatOpen,
    onChatToggle,
    currentRole: "driver" as const,
    paymentStatus,
    onRideStatusUpdate: (newStatus: string) => {
      setStatus(newStatus)
      if (booking) {
        setBooking((prev: any) => ({ ...prev, bookingStatus: newStatus }))
      }
    },
  }

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-2">
        <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-white/40 text-[11px] tracking-widest uppercase font-medium">
          Loading ride...
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden relative">
      <div className="relative flex-1 h-[60vh] lg:h-full w-full z-0">
        <LiveRideMap
          driverLocation={driverPosition}
          pickupLocation={pickupPosition}
          dropLocation={dropPosition}
          mapStatus={status}
          onStats={(s: any) => {
            setDistanceToPickup(s.distanceToPickup)
            setEtaToPickup(s.etaToPickup)
            setDistanceToDrop(s.distanceToDrop)
            setEtaToDrop(s.etaToDrop)
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md border border-zinc-100">
            <span className={`w-2 h-2 rounded-full ${cfg.dot} ${isActive ? "animate-pulse" : ""}`} />
            <span className="text-xs font-semibold tracking-wider text-zinc-900">
              {cfg.label}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="lg:hidden flex flex-col bg-white border-t border-zinc-200 rounded-t-2xl shadow-2xl z-20 transition-all duration-300">
        <div
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="w-full py-2 flex flex-col items-center justify-center cursor-pointer border-b border-zinc-100"
        >
          <div className="w-10 h-1 bg-zinc-300 rounded-full mb-1" />
          <div className="flex items-center justify-between w-full px-4">
            <span className="text-xs font-bold text-zinc-900">
              {cfg.label} {isActive ? `(${Math.round(displayEta)} min)` : ""}
            </span>
            <ChevronUp
              size={16}
              className={`text-zinc-500 transition-transform ${mobileDrawerOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {mobileDrawerOpen && (
          <div className="max-h-[38vh] overflow-y-auto px-3 py-2">
            <PanelContent {...panelProps} />
          </div>
        )}
      </div>

      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55 }}
        className="hidden lg:flex w-[340px] xl:w-[380px] bg-white border-l border-zinc-100 flex-col overflow-hidden z-10 shadow-lg"
      >
        <div className="bg-zinc-950 px-4 py-3 shrink-0">
          <p className="text-zinc-500 text-[9px] tracking-widest uppercase font-semibold mb-0.5">
            DRIVER PANEL
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-white text-base font-bold">
              {isCompleted ? "Trip Completed" : "Active Ride"}
            </h1>
            {isActive && (
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full">
                <Zap size={11} className="text-amber-400" />
                <span className="text-white text-[11px] font-semibold">
                  {Math.round(displayEta)} min
                </span>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-bold">Done</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <PanelContent {...panelProps} />
        </div>
      </motion.div>
    </div>
  )
}
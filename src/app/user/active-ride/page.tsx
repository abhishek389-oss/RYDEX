"use client"
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { 
  Bike, 
  Car, 
  Truck, 
  Clock, 
  IndianRupee, 
  MessageSquare, 
  Phone, 
  User as UserIcon, 
  X, 
  Zap, 
  KeyRound, 
  CheckCircle2, 
  Star, 
  Loader2 
} from 'lucide-react'
import { getSocket } from '@/lib/socket'
import RideChat from '@/components/RideChat'
import type { LiveRideMapProps } from '@/components/LiveRideMap'

const LiveRideMap = dynamic<LiveRideMapProps>(() => import('@/components/LiveRideMap'), {
  ssr: false,
})

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

export default function UserActiveRidePage() {
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [driverPosition, setDriverPosition] = useState<number[] | null>(null)
  const [pickupPosition, setPickupPosition] = useState<number[] | null>(null)
  const [dropPosition, setDropPosition] = useState<number[] | null>(null)
  const [status, setStatus] = useState<string>("")
  const [chatOpen, setChatOpen] = useState(false)

  const [distanceToPickup, setDistanceToPickup] = useState(0)
  const [distanceToDrop, setDistanceToDrop] = useState(0)
  const [etaToPickup, setEtaToPickup] = useState(0)
  const [etaToDrop, setEtaToDrop] = useState(0)

  // राइड कम्प्लीशन व रेटिंग स्टेट्स
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)

  const fetchActiveRide = async () => {
    try {
      const { data } = await axios.get("/api/user/active-ride")
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
      }
    } catch (error) {
      console.log("Fetch user active ride error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveRide()
  }, [])

  useEffect(() => {
    if (!booking?._id) return

    const socket = getSocket()

    socket.emit("join_ride", booking._id)

    socket.on("driver_location_update", (data: any) => {
      if (data.latitude && data.longitude) {
        setDriverPosition([data.latitude, data.longitude])
      }
      if (data.status) {
        setStatus(data.status)
      }
    })

    socket.on("ride_started", () => {
      setStatus("started")
      setBooking((prev: any) => ({ ...prev, bookingStatus: "started" }))
    })

    socket.on("ride_completed", () => {
      setStatus("completed")
      setBooking((prev: any) => ({ ...prev, bookingStatus: "completed" }))
      setShowRatingModal(true)
    })

    return () => {
      socket.off("driver_location_update")
      socket.off("ride_started")
      socket.off("ride_completed")
    }
  }, [booking?._id])

  const handleRatingSubmit = async () => {
    if (!booking?._id) return
    setSubmittingRating(true)
    try {
      await axios.post("/api/user/bookings/rating", {
        bookingId: booking._id,
        rating: selectedRating,
        feedback: feedbackText,
      })
      setShowRatingModal(false)
      router.push("/user/bookings")
    } catch (error) {
      console.log("Submit rating error:", error)
      router.push("/user/bookings")
    } finally {
      setSubmittingRating(false)
    }
  }

  const displayEta = status === "confirmed" ? etaToPickup : etaToDrop
  const isConfirmed = status === "confirmed"
  const isStarted = status === "started"

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-2">
        <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-white/40 text-[11px] tracking-widest uppercase font-medium">
          Loading your ride...
        </p>
      </div>
    )
  }

  if (!booking && !showRatingModal) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <CheckCircle2 size={36} className="text-emerald-500" />
        <h2 className="text-white text-base font-bold">No Active Ride Running</h2>
        <p className="text-zinc-500 text-xs">Your ride is either completed or not yet confirmed.</p>
        <button
          onClick={() => router.push("/user/bookings")}
          className="mt-2 px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-colors"
        >
          View All Bookings
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden relative">
      
      <div className="relative flex-1 h-full z-0">
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
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md border border-zinc-100">
            <span className={`w-2 h-2 rounded-full ${isConfirmed ? "bg-emerald-500" : "bg-indigo-500"} animate-pulse`} />
            <span className="text-xs font-semibold tracking-wider text-zinc-900">
              {isConfirmed ? "Driver is arriving at pickup" : "On the way to destination"}
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55 }}
        className="hidden lg:flex w-[340px] xl:w-[380px] bg-white border-l border-zinc-100 flex-col overflow-hidden z-10 shadow-lg"
      >
        <div className="bg-zinc-950 px-4 py-3 shrink-0">
          <p className="text-zinc-500 text-[9px] tracking-widest uppercase font-semibold mb-0.5">
            YOUR RIDE
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-white text-base font-bold">
              {isConfirmed ? "Driver Arriving" : "Trip in Progress"}
            </h1>
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full">
              <Zap size={11} className="text-amber-400" />
              <span className="text-white text-[11px] font-semibold">
                {Math.round(displayEta)} min
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
          
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${isConfirmed ? "bg-emerald-50 border-emerald-200" : "bg-zinc-50 border-zinc-100 opacity-60"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">START OTP</span>
                <KeyRound size={12} className="text-emerald-700" />
              </div>
              <p className="text-lg font-mono font-black text-emerald-950 tracking-widest mt-1">
                {booking?.startOtp || "----"}
              </p>
              <span className="text-[8px] text-emerald-700">Give at pickup</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${isStarted ? "bg-indigo-50 border-indigo-200" : "bg-zinc-50 border-zinc-100 opacity-60"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-800">END OTP</span>
                <KeyRound size={12} className="text-indigo-700" />
              </div>
              <p className="text-lg font-mono font-black text-indigo-950 tracking-widest mt-1">
                {booking?.endOtp || "----"}
              </p>
              <span className="text-[8px] text-indigo-700">Give at drop</span>
            </div>
          </div>

          {booking?.driver && (
            <div className="bg-zinc-950 text-white rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs border border-zinc-700">
                    <UserIcon size={15} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate max-w-[110px]">
                      {booking.driver?.name || "Driver"}
                    </p>
                    <div className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.2 rounded-full">
                      <IndianRupee size={9} className="text-amber-400" />
                      <span className="text-[10px] font-semibold text-white">{booking?.fare}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{booking.driver?.mobileNumber || "Driver Assigned"}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {booking?.driver?.mobileNumber && (
                  <a
                    href={`tel:${booking.driver.mobileNumber}`}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
                  >
                    <Phone size={13} />
                  </a>
                )}

                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    chatOpen ? "bg-white text-zinc-950" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  }`}
                >
                  {chatOpen ? <X size={14} /> : <MessageSquare size={13} />}
                </button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 360 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-xl border border-zinc-100 bg-white"
              >
                <RideChat
                  bookingId={booking?._id}
                  currentRole="user"
                  otherName={booking?.driver?.name || "Driver"}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {booking?.vehicle && (
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                  {getVehicleIcon(booking.vehicle.type)}
                </div>
                <div>
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">VEHICLE DETAILS</p>
                  <p className="text-[11px] font-bold text-zinc-900 leading-tight">
                    {booking.vehicle.vehicleModel}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                {booking.vehicle.number}
              </span>
            </div>
          )}

          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-2.5 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <div className="w-2 h-2 rounded-full bg-zinc-900 border border-white shadow-xs" />
                <div className="w-px h-5 bg-zinc-200 my-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">PICKUP</p>
                <p className="text-[11px] font-semibold text-zinc-800 truncate leading-snug">
                  {booking?.pickUpAddress}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full border border-zinc-900 bg-white shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">DROP</p>
                <p className="text-[11px] font-semibold text-zinc-800 truncate leading-snug">
                  {booking?.dropAddress}
                </p>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-zinc-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>

              <h3 className="text-base font-bold text-zinc-900">Ride Completed!</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Total fare paid: <span className="font-bold text-zinc-900">₹{booking?.fare}</span>
              </p>

              <div className="flex items-center justify-center gap-2 my-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      size={24}
                      className={
                        star <= selectedRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-200"
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write your feedback for driver (optional)..."
                rows={2}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 mb-4 outline-none focus:border-zinc-900 resize-none text-zinc-900"
              />

              <button
                onClick={handleRatingSubmit}
                disabled={submittingRating}
                className="w-full py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submittingRating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Submit & Close"
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
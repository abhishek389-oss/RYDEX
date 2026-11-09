"use client"
import React, { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
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
  Loader2,
  ChevronUp,
  ArrowLeft
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

function RideTrackingContent() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [routeCalculating, setRouteCalculating] = useState(true)
  const [driverPosition, setDriverPosition] = useState<number[] | null>(null)
  const [pickupPosition, setPickupPosition] = useState<number[] | null>(null)
  const [dropPosition, setDropPosition] = useState<number[] | null>(null)
  const [status, setStatus] = useState<string>("")
  const [chatOpen, setChatOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true)

  const [distanceToPickup, setDistanceToPickup] = useState(0)
  const [distanceToDrop, setDistanceToDrop] = useState(0)
  const [etaToPickup, setEtaToPickup] = useState(0)
  const [etaToDrop, setEtaToDrop] = useState(0)

  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)

  const fetchRideDetails = async () => {
    try {
      const { data } = await axios.get(`/api/user/booking/${bookingId}`)
      const b = data?.booking || data
      if (b) {
        // पेमेंट बाईपास प्रिवेंशन: अगर पेमेंट पेंडिंग है तो सीधे चेकआउट पर रीडायरेक्ट करें
        if (b.paymentStatus === "pending" || b.bookingStatus === "awaiting_payment") {
          router.push(`/user/checkout?pickup=${encodeURIComponent(b.pickUpAddress || "")}&drop=${encodeURIComponent(b.dropAddress || "")}&fare=${b.fare || 0}&vehicle=${b.vehicle?.type || "car"}`);
          return;
        }

        setBooking(b)
        setStatus(b.bookingStatus)

        if (b.rating) {
          setSelectedRating(b.rating)
        }
        if (b.feedback) {
          setFeedbackText(b.feedback)
        }

        if (b.pickUpLocation?.coordinates) {
          setPickupPosition([
            b.pickUpLocation.coordinates[1],
            b.pickUpLocation.coordinates[0],
          ])
        }

        if (b.dropLocation?.coordinates) {
          setDropPosition([
            b.dropLocation.coordinates[1],
            b.dropLocation.coordinates[0],
          ])
        }
      }
    } catch (error) {
      console.log("Fetch ride details error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookingId) {
      fetchRideDetails()
    }
  }, [bookingId])

  useEffect(() => {
    if (!bookingId) return

    const socket = getSocket()
    socket.emit("join_ride", bookingId)

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
  }, [bookingId])

  const handleRatingSubmit = async () => {
    if (!bookingId) return
    setSubmittingRating(true)
    try {
      await axios.post("/api/user/booking/rating", {
        bookingId,
        rating: selectedRating,
        feedback: feedbackText,
      })
      setBooking((prev: any) => ({
        ...prev,
        rating: selectedRating,
        feedback: feedbackText,
      }))
      setShowRatingModal(false)
    } catch (error) {
      console.log("Submit rating error:", error)
      setShowRatingModal(false)
    } finally {
      setSubmittingRating(false)
    }
  }

  const rawEta = status === "confirmed" ? etaToPickup : etaToDrop
  const isConfirmed = status === "confirmed"
  const isStarted = status === "started"
  const isCompleted = status === "completed"

  const getStatusHeading = () => {
    if (isCompleted) return "Trip Completed"
    if (isConfirmed) return "Driver Arriving"
    if (isStarted) return "Trip in Progress"
    return "Ride Details"
  }

  const getFloatingStatusText = () => {
    if (isCompleted) return "You have reached your destination"
    if (isConfirmed) return "Driver is arriving at pickup"
    if (isStarted) return "On the way to destination"
    return "Ride Completed"
  }

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
        <h2 className="text-white text-base font-bold">Ride Not Found</h2>
        <button
          onClick={() => router.push("/user/bookings")}
          className="mt-2 px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          View Bookings
        </button>
      </div>
    )
  }

  const RideDetailsBody = () => (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${isConfirmed ? "bg-emerald-50 border-emerald-200" : isCompleted ? "bg-zinc-50 border-zinc-100 opacity-60" : "bg-zinc-50 border-zinc-100 opacity-60"}`}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">START OTP</span>
            <KeyRound size={12} className="text-emerald-700" />
          </div>
          {booking?.pickUpOtp ? (
            <p className="text-lg font-mono font-black text-emerald-950 tracking-widest mt-1">
              {booking.pickUpOtp}
            </p>
          ) : (
            <div className="h-6 w-16 bg-emerald-200/60 rounded animate-pulse my-1" />
          )}
          <span className="text-[8px] text-emerald-700">
            {isConfirmed ? "Give at pickup" : "Pickup Verified"}
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${isStarted ? "bg-indigo-50 border-indigo-200" : isCompleted ? "bg-zinc-50 border-zinc-100 opacity-60" : "bg-zinc-50 border-zinc-100 opacity-60"}`}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-800">END OTP</span>
            <KeyRound size={12} className="text-indigo-700" />
          </div>
          {booking?.dropOtp ? (
            <p className="text-lg font-mono font-black text-indigo-950 tracking-widest mt-1">
              {booking.dropOtp}
            </p>
          ) : (
            <div className="h-6 w-16 bg-indigo-200/60 rounded animate-pulse my-1" />
          )}
          <span className="text-[8px] text-indigo-700">
            {isStarted ? "Give at drop" : "Drop Verified"}
          </span>
        </div>
      </div>

      {booking?.driver && (
        <div className="bg-zinc-950 text-white rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs border border-zinc-700">
                <UserIcon size={15} />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${isCompleted ? "bg-zinc-500" : "bg-emerald-500"}`} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {booking.driver?.name || "Driver"}
                </p>
                <div className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-full">
                  <IndianRupee size={9} className="text-amber-400" />
                  {booking?.fare ? (
                    <span className="text-[10px] font-semibold text-white">{booking.fare}</span>
                  ) : (
                    <span className="inline-block w-8 h-2.5 bg-white/20 rounded animate-pulse" />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">{booking.driver?.mobileNumber || "Driver Assigned"}</p>
            </div>
          </div>

          {!isCompleted && (
            <div className="flex items-center gap-1.5">
              {booking?.driver?.mobileNumber && (
                <a
                  href={`tel:${booking.driver.mobileNumber}`}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
                >
                  <Phone size={14} />
                </a>
              )}

              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  chatOpen ? "bg-white text-zinc-950" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                }`}
              >
                {chatOpen ? <X size={15} /> : <MessageSquare size={14} />}
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {chatOpen && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 340 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <RideChat
              bookingId={bookingId}
              currentRole="user"
              otherName={booking?.driver?.name || "Driver"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {booking?.vehicle && (
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
              {getVehicleIcon(booking.vehicle.type)}
            </div>
            <div>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">VEHICLE DETAILS</p>
              <p className="text-xs font-bold text-zinc-900 leading-tight">
                {booking.vehicle.vehicleModel}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">
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
            <p className="text-xs font-semibold text-zinc-800 truncate leading-snug">
              {booking?.pickUpAddress}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full border border-zinc-900 bg-white shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">DROP</p>
            <p className="text-xs font-semibold text-zinc-800 truncate leading-snug">
              {booking?.dropAddress}
            </p>
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">YOUR RATING</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  className={
                    star <= (booking?.rating || selectedRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-200"
                  }
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowRatingModal(true)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            {booking?.rating ? "Update Rating" : "Rate Driver"}
          </button>
        </div>
      )}
    </div>
  )

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
            setRouteCalculating(false)
          }}
        />

        <div className="absolute top-3 left-3 z-[500]">
          <button
            onClick={() => router.push("/user/bookings")}
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-zinc-900 shadow-md border border-zinc-100 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md border border-zinc-100">
            {routeCalculating && !isCompleted ? (
              <>
                <Loader2 size={12} className="animate-spin text-zinc-600" />
                <span className="text-xs font-semibold tracking-wider text-zinc-700">
                  Calculating route...
                </span>
              </>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full ${isCompleted ? "bg-zinc-400" : isConfirmed ? "bg-emerald-500" : "bg-indigo-500"} ${isCompleted ? "" : "animate-pulse"}`} />
                <span className="text-xs font-semibold tracking-wider text-zinc-900">
                  {getFloatingStatusText()}
                </span>
              </>
            )}
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
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <span>{getStatusHeading()}</span>
              {!isCompleted && (
                routeCalculating ? (
                  <Loader2 size={12} className="animate-spin text-zinc-400" />
                ) : (
                  <span className="text-zinc-500 font-normal">({Math.round(rawEta || 5)} min)</span>
                )
              )}
            </span>
            <ChevronUp size={16} className={`text-zinc-500 transition-transform ${mobileDrawerOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        {mobileDrawerOpen && (
          <div className="max-h-[38vh] overflow-y-auto p-3">
            <RideDetailsBody />
          </div>
        )}
      </div>

      <div className="hidden lg:flex w-[360px] xl:w-[400px] bg-white border-l border-zinc-100 flex-col overflow-hidden z-10 shadow-lg">
        <div className="bg-zinc-950 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-zinc-500 text-[9px] tracking-widest uppercase font-semibold">
              YOUR RIDE
            </p>
            <button
              onClick={() => router.push("/user/bookings")}
              className="text-zinc-400 hover:text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={12} />
              <span>All Rides</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-white text-base font-bold">
              {getStatusHeading()}
            </h1>
            {!isCompleted ? (
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                <Zap size={12} className="text-amber-400" />
                {routeCalculating ? (
                  <Loader2 size={12} className="animate-spin text-white/60" />
                ) : (
                  <span className="text-white text-xs font-semibold">
                    {Math.round(rawEta || 5)} min
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-bold">Completed</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <RideDetailsBody />
        </div>
      </div>

      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-zinc-100 text-center"
            >
              <button
                onClick={() => setShowRatingModal(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

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

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={submittingRating}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingRating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function UserRideTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-white/40 text-[11px] tracking-widest uppercase font-medium">
            Loading...
          </p>
        </div>
      }
    >
      <RideTrackingContent />
    </Suspense>
  )
}
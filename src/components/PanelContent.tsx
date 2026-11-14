"use client"
import React, { useState } from 'react'
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
  KeyRound,
  Loader2,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react'
import axios from 'axios'
import RideChat from './RideChat'

export interface PanelContentProps {
  booking: any
  status: string
  isActive: boolean
  displayEta: number
  displayDistance: number
  canChat: boolean
  chatOpen: boolean
  onChatToggle: () => void
  currentRole: "driver" | "user"
  paymentStatus?: { label: string; cls: string }
  onRideStatusUpdate?: (newStatus: string) => void
}

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

export default function PanelContent({
  booking,
  status,
  isActive,
  displayEta,
  displayDistance,
  canChat,
  chatOpen,
  onChatToggle,
  currentRole,
  paymentStatus,
  onRideStatusUpdate,
}: PanelContentProps) {
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState("")

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 4) {
      setOtpError("Enter valid 4-digit OTP")
      return
    }

    setOtpLoading(true)
    setOtpError("")

    try {
      const otpType = status === "confirmed" ? "start" : "end"
      const { data } = await axios.post(
        `/api/partner/bookings/${booking._id}/verify-otp`,
        {
          otp: otpValue,
          type: otpType,
        }
      )

      if (data?.success) {
        setShowOtpModal(false)
        setOtpValue("")
        if (onRideStatusUpdate) {
          onRideStatusUpdate(data.booking.bookingStatus)
        }
      }
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || "Invalid OTP")
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2.5 py-1 text-zinc-900">
      {isActive && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
              <Clock size={14} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">ETA</p>
              <p className="text-xs font-black text-zinc-900 leading-tight">
                {Math.round(displayEta)} <span className="text-[9px] font-medium text-zinc-500">min</span>
              </p>
            </div>
          </div>

          <div className="bg-zinc-950 text-white rounded-xl p-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
              <IndianRupee size={14} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">FARE</p>
              <p className="text-xs font-black leading-tight">
                ₹{booking?.fare || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {booking?.user && (
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
                  {booking.user?.name || "Customer"}
                </p>
                <div className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.2 rounded-full">
                  <IndianRupee size={9} className="text-amber-400" />
                  <span className="text-[10px] font-semibold text-white">{booking?.fare}</span>
                </div>
              </div>
              <div className="mt-0.5">
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${paymentStatus?.cls || "bg-zinc-800 text-zinc-300"}`}>
                  {paymentStatus?.label || "Cash on Drop"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {booking?.userMobileNumber && (
              <a
                href={`tel:${booking.userMobileNumber}`}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
              >
                <Phone size={13} />
              </a>
            )}

            {canChat && (
              <button
                onClick={onChatToggle}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  chatOpen ? "bg-white text-zinc-950" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                }`}
              >
                {chatOpen ? <X size={14} /> : <MessageSquare size={13} />}
              </button>
            )}
          </div>
        </div>
      )}

      {isActive && currentRole === "driver" && (
        <div className="pt-1">
          {status === "confirmed" && (
            <button
              onClick={() => {
                setOtpError("")
                setOtpValue("")
                setShowOtpModal(true)
              }}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <KeyRound size={14} />
              <span>Enter Start OTP</span>
            </button>
          )}

          {status === "started" && (
            <button
              onClick={() => {
                setOtpError("")
                setOtpValue("")
                setShowOtpModal(true)
              }}
              className="w-full h-10 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Complete Ride (End OTP)</span>
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {chatOpen && canChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 360 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-xl border border-zinc-100 bg-white"
          >
            <RideChat
              bookingId={booking._id}
              currentRole={currentRole}
              otherName={booking.user?.name || "Customer"}
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
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">YOUR VEHICLE</p>
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

      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-zinc-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
                    <KeyRound size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">
                      {status === "confirmed" ? "Start Ride OTP" : "End Ride OTP"}
                    </h3>
                    <p className="text-[10px] text-zinc-500">Ask customer for the 4-digit code</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {otpError && (
                <div className="mb-3 p-2 rounded-lg bg-red-50 text-red-600 text-[11px] flex items-center gap-1.5 font-medium">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <input
                type="text"
                maxLength={4}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full text-center tracking-[1em] text-2xl font-mono font-bold bg-zinc-50 border border-zinc-200 rounded-xl py-2 mb-4 outline-none focus:border-zinc-900"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otpValue.length !== 4}
                  className="flex-1 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {otpLoading ? <Loader2 size={14} className="animate-spin" /> : "Verify & Continue"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
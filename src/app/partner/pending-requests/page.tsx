"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Clock, IndianRupee, MapPin, Navigation, Loader2 } from 'lucide-react'
import axios from 'axios'
import { getSocket } from '@/lib/socket'
import { useAppSelector } from '@/redux/hooks'
import Nav from '@/components/Nav'

export default function PendingRequestPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const userData = useAppSelector((state) => state.user.userData)

  const fetchPendingRequests = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/partner/bookings/pending')
      setBookings(Array.isArray(data) ? data : (data?.bookings || []))
    } catch (error) {
      console.log("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingRequests();

    const socket = getSocket();

    if (userData?._id) {
      socket.emit("identity", userData._id);
    }

    socket.on("new_booking", (data: any) => {
      console.log("Realtime booking received:", data);
      setBookings((prev) => {
        const alreadyExists = prev.some((item) => item._id === data._id);
        if (alreadyExists) return prev;
        return [data, ...prev];
      });
    });

    return () => {
      socket.off("new_booking");
    };
  }, [userData]);

  const handleAccept = async (id: string) => {
    if (actionId) return;
    setActionId(id);
    try {
      const { data } = await axios.get(`/api/partner/bookings/${id}/accept`);
      if (data?.success) {
        setBookings((prev) => prev.filter((b: any) => b._id !== id));
      }
    } catch (error) {
      console.log("Accept error:", error);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (actionId) return;
    setActionId(id);
    try {
      const { data } = await axios.get(`/api/partner/bookings/${id}/reject`);
      if (data?.success) {
        setBookings((prev) => prev.filter((b: any) => b._id !== id));
      }
    } catch (error) {
      console.log("Reject error:", error);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-100">
      <Nav />
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-7">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-0.5 w-6 bg-zinc-900" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
              LIVE DISPATCH
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Ride Requests
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5 font-medium">
            Manage incoming ride requests and respond in real-time
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="animate-spin text-zinc-900" size={28} />
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Loading requests...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-xs">
            <div className="h-1 bg-zinc-900 w-full" />
            <div className="p-10 sm:p-12 text-center">
              <p className="text-zinc-900 font-bold text-sm">No pending ride requests</p>
              <p className="text-zinc-400 text-xs mt-1">New requests from nearby riders will appear here automatically.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any, index) => {
              const isBusy = actionId === b._id;
              return (
                <motion.div
                  key={b._id || index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.995 }}
                  className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-xs"
                >
                  <div className="h-1 bg-zinc-900 w-full" />
                  <div className="p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    <div className="flex-1 w-full space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={15} className="text-zinc-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">PICKUP LOCATION</p>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">
                            {b.pickUpAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center shrink-0 mt-0.5">
                          <Navigation size={15} className="text-zinc-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">DROP LOCATION</p>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">
                            {b.dropAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                        <Clock size={13} />
                        <span>{new Date(b.createdAt || Date.now()).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end justify-between gap-4 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                      <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 lg:text-right">ESTIMATED FARE</p>
                        <div className="flex items-center gap-0.5 text-xl sm:text-2xl font-black text-zinc-900">
                          <IndianRupee size={18} className="stroke-[2.5]" />
                          <span>{b.fare}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full lg:w-auto">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReject(b._id)}
                          className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-50 text-zinc-800 text-xs font-bold transition-colors cursor-pointer touch-manipulation"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleAccept(b._id)}
                          className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                        >
                          {isBusy ? <Loader2 size={14} className="animate-spin" /> : "Accept Ride"}
                        </button>
                      </div>
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
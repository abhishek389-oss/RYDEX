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
  const userData = useAppSelector((state) => state.user.userData)

  const fetchPendingRequests = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/partner/bookings/pending')
      setBookings(data || [])
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
    try {
      const { data } = await axios.get(`/api/partner/bookings/${id}/accept`);
      if (data?.success) {
        setBookings((prev) => prev.filter((b: any) => b._id !== id));
      }
    } catch (error) {
      console.log("Accept error:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/partner/bookings/${id}/reject`);
      if (data?.success) {
        setBookings((prev) => prev.filter((b: any) => b._id !== id));
      }
    } catch (error) {
      console.log("Reject error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-8">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Ride Requests
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage incoming ride requests and respond in real-time
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-zinc-900" size={32} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-xs">
            <p className="text-zinc-500 font-medium">No pending ride requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any, index) => (
              <motion.div
                key={b._id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={16} className="text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">PICKUP LOCATION</p>
                      <p className="text-sm font-semibold text-zinc-900 leading-snug">
                        {b.pickUpAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Navigation size={16} className="text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">DROP LOCATION</p>
                      <p className="text-sm font-semibold text-zinc-900 leading-snug">
                        {b.dropAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                    <Clock size={13} />
                    <span>{new Date(b.createdAt || Date.now()).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex flex-col lg:items-end justify-between gap-4 w-full lg:w-auto">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 lg:text-right">ESTIMATED FARE</p>
                    <div className="flex items-center gap-1 text-2xl font-black text-zinc-900">
                      <IndianRupee size={20} />
                      <span>{b.fare}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                      onClick={() => handleReject(b._id)}
                      className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(b._id)}
                      className="flex-1 lg:flex-none px-7 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      Accept Ride
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
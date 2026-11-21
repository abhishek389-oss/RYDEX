"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Bike,
  Car,
  Truck,
  Calendar,
  ChevronRight,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  User as UserIcon
} from 'lucide-react'
import { BookingStatus, PaymentStatus } from '@/models/booking.model'
import Nav from '@/components/Nav'

interface IBooking {
  _id: string;
  user: { name: string; email: string; mobileNumber: string };
  driver: { name: string; mobileNumber: string };
  vehicle: { vehicleModel: string; number: string; type: string };
  pickUpAddress: string;
  dropAddress: string;
  fare: number;
  userMobileNumber: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-zinc-100 text-zinc-700 border-zinc-200",
    request: "bg-amber-50 text-amber-700 border-amber-200",
    requested: "bg-amber-50 text-amber-700 border-amber-200",
    awaiting_payment: "bg-blue-50 text-blue-700 border-blue-200",
    started: "bg-indigo-50 text-indigo-700 border-indigo-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    expired: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };
  return colors[status?.toLowerCase()] || "bg-zinc-50 text-zinc-700 border-zinc-200";
};

const getVehicleIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "bike":
      return <Bike size={15} />;
    case "truck":
    case "loading":
      return <Truck size={15} />;
    case "car":
    case "auto":
    default:
      return <Car size={15} />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", "");
};

export default function PartnerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/partner/bookings");
      setBookings(Array.isArray(data) ? data : (data?.bookings || []));
    } catch (error) {
      console.log("Fetch partner bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = selectedStatus === "all"
    ? bookings
    : bookings.filter((b) => b.bookingStatus?.toLowerCase() === selectedStatus.toLowerCase());

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
                PARTNER RIDES
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              Partner Bookings
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              {bookings.length} {bookings.length === 1 ? "ride" : "rides"} assigned to you
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-end bg-white border border-zinc-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-xs font-bold text-zinc-400">Filter:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-900 outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="requested">Requested</option>
              <option value="awaiting_payment">Awaiting Payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="started">Started</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="animate-spin text-zinc-900" size={28} />
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">Loading bookings...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-xs">
            <div className="h-1 bg-zinc-900 w-full" />
            <div className="p-10 sm:p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                <Car size={22} />
              </div>
              <h3 className="text-base font-black text-zinc-900 mb-1">No Bookings Yet</h3>
              <p className="text-xs text-zinc-400 font-medium">
                When customers book rides, they will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b, idx) => (
              <motion.div
                key={b._id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.995 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs hover:border-zinc-300 transition-all overflow-hidden"
              >
                <div className="h-1 bg-zinc-900 w-full" />

                <div className="flex items-center gap-3 p-4 sm:px-5 bg-zinc-50/70 border-b border-zinc-100">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <UserIcon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-xs sm:text-sm text-zinc-900 truncate">
                        {b.user?.name ? b.user.name.toUpperCase() : "CUSTOMER"}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border shrink-0 ${getStatusColor(b.bookingStatus)}`}>
                        {b.bookingStatus?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5 font-medium">
                      <Phone size={11} className="text-zinc-400" />
                      <span>{b.userMobileNumber || b.user?.mobileNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3.5">
                  {b.vehicle && (
                    <div className="bg-zinc-50 rounded-xl px-3 py-2 flex items-center gap-2.5 border border-zinc-100">
                      <div className="text-zinc-700">{getVehicleIcon(b.vehicle.type)}</div>
                      <div className="text-xs font-medium text-zinc-700">
                        <span className="text-zinc-900 font-bold">{b.vehicle.vehicleModel}</span>
                        <span className="mx-1.5 text-zinc-300">•</span>
                        <span className="font-mono text-zinc-500 uppercase">{b.vehicle.number}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden">
                    <div className="flex items-start gap-3 px-3 py-2.5 border-b border-zinc-100">
                      <div className="w-2 h-2 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.16em]">
                          PICKUP
                        </p>
                        <p className="text-xs font-semibold text-zinc-900 mt-0.5 leading-snug">
                          {b.pickUpAddress}
                        </p>
                      </div>
                      <MapPin size={12} className="text-zinc-400 shrink-0 mt-1" />
                    </div>

                    <div className="flex items-start gap-3 px-3 py-2.5">
                      <div className="w-2 h-2 rounded-full border-2 border-zinc-900 bg-white mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.16em]">
                          DROP
                        </p>
                        <p className="text-xs font-semibold text-zinc-900 mt-0.5 leading-snug">
                          {b.dropAddress}
                        </p>
                      </div>
                      <Navigation size={12} className="text-zinc-400 shrink-0 mt-1" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                        <Calendar size={13} className="text-zinc-400" />
                        <span>{formatDate(b.createdAt)}</span>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        b.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : b.paymentStatus === "cash"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      }`}>
                        {b.paymentStatus?.toUpperCase() || "PENDING"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                      <div className="flex items-center font-black text-zinc-900">
                        <IndianRupee size={14} className="stroke-[2.5]" />
                        <span className="text-base">{b.fare}</span>
                      </div>

                      {["confirmed", "started"].includes(b.bookingStatus?.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => router.push("/partner/active-ride")}
                          className="flex items-center gap-1 text-xs font-bold text-white bg-zinc-900 hover:bg-black px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer touch-manipulation"
                        >
                          <span>Active Ride</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
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
    completed: "bg-gray-100 text-gray-700 border-gray-200",
    request: "bg-amber-50 text-amber-700 border-amber-200",
    requested: "bg-amber-50 text-amber-700 border-amber-200",
    awaiting_payment: "bg-blue-50 text-blue-700 border-blue-200",
    started: "bg-indigo-50 text-indigo-700 border-indigo-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    expired: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };
  return colors[status?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
};

const getVehicleIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "bike":
      return <Bike size={16} />;
    case "truck":
    case "loading":
      return <Truck size={16} />;
    case "car":
    case "auto":
    default:
      return <Car size={16} />;
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
      setBookings(data || []);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Nav/>
      <div className="max-w-3xl mx-auto mt-15 md:20">

        <div className="bg-white border-b border-gray-200 -mx-4 -mt-8 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-6">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Car size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Partner Bookings
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {bookings.length} {bookings.length === 1 ? "ride" : "rides"} assigned to you
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
            <span className="text-sm font-medium">Loading bookings...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-300">
              <Car size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Bookings Yet</h3>
            <p className="text-sm text-gray-500">
              When customers book rides, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b, idx) => (
              <motion.div
                key={b._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-blue-200 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
                    <UserIcon size={22} className="text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {b.user?.name ? b.user.name.toUpperCase() : "CUSTOMER"}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(b.bookingStatus)}`}>
                        {b.bookingStatus?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                      <Phone size={12} className="text-gray-400" />
                      <span>{b.userMobileNumber || b.user?.mobileNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {b.vehicle && (
                  <div className="px-4 pt-3">
                    <div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-gray-100">
                      <div className="text-gray-600">{getVehicleIcon(b.vehicle.type)}</div>
                      <div className="text-xs font-medium text-gray-700">
                        <span className="text-gray-900 font-semibold">{b.vehicle.vehicleModel}</span>
                        <span className="mx-1.5 text-gray-300">•</span>
                        <span className="font-mono text-gray-600 uppercase">{b.vehicle.number}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={12} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wider">
                        PICKUP
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
                        {b.pickUpAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={12} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-red-600 uppercase tracking-wider">
                        DROP
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
                        {b.dropAddress}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{formatDate(b.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-gray-900">
                    <IndianRupee size={15} />
                    <span className="text-base">{b.fare}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Payment:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : b.paymentStatus === "cash"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                      {b.paymentStatus?.toUpperCase() || "PENDING"}
                    </span>
                  </div>

                  {["confirmed", "started"].includes(b.bookingStatus?.toLowerCase()) && (
                    <button
                      onClick={() => router.push("/partner/active-ride")}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
"use client"
import React, { Suspense, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  Bike, 
  Car, 
  Clock, 
  CreditCard, 
  IndianRupee, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Truck, 
  Loader2, 
  XCircle, 
  CheckCircle, 
  Banknote, 
  Wallet 
} from 'lucide-react'
import axios from 'axios'
import { getSocket } from '@/lib/socket'
import Nav from '@/components/Nav'

const VEHICLE_META: any = {
  bike: { label: "Bike", icon: Bike },
  auto: { label: "Auto", icon: Car },
  car: { label: "Car", icon: Car },
  loading: { label: "Loading", icon: Truck },
  truck: { label: "Truck", icon: Truck }
}

type CheckoutStatus =
  | "idle"
  | "requested"
  | "awaiting_payment"
  | "payment"
  | "confirmed"
  | "rejected"
  | "expired"
  | "cancelled";

const features = [
  { icon: Clock, text: "Driver will respond within 2 minutes" },
  { icon: ShieldCheck, text: "Verified and insured drivers only" },
  { icon: CreditCard, text: "Pay after driver accepts ride" },
];

const paymentOptions = [
  { id: "cash", icon: Banknote, title: "Cash", sub: "Pay driver after ride" },
  { id: "online", icon: Wallet, title: "Online Payment", sub: "UPI, Card, Netbanking" },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckoutContent() {
  const router = useRouter()
  const params = useSearchParams()

  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");

  const pickUp = params.get("pickUp") || params.get("pickup") || ""
  const drop = params.get("drop") || ""
  const vehicle = params.get("vehicle") || "car"
  const fare = params.get("fare") || "0"
  const mobile = params.get("mobile") || ""

  const { icon: VehicleIcon, label: vehicleLabel } = VEHICLE_META[vehicle] || { icon: Car, label: vehicle }

  const driverId = params.get("driverId") || ""
  const vehicleId = params.get("vehicleId") || ""
  const pickUpLat = Number(params.get("pickUpLat") || params.get("pickuplat") || 0)
  const pickUpLon = Number(params.get("pickUpLon") || params.get("pickuplon") || 0)
  const dropLat = Number(params.get("dropLat") || params.get("droplat") || 0)
  const dropLon = Number(params.get("dropLon") || params.get("droplon") || 0)

  const fetchActiveBooking = async () => {
    try {
      const { data } = await axios.get("/api/user/active-ride");
      if (data?.booking) {
        setBooking(data.booking);
        setStatus(data.booking.bookingStatus || "idle");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchActiveBooking();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.on("accept_booking", (data: any) => {
      if (data?.bookingId) {
        setBooking((prev: any) => ({ ...(prev || {}), _id: data.bookingId }));
      }
      setStatus("awaiting_payment");
    });

    socket.on("reject_booking", () => {
      setStatus("rejected");
    });

    return () => {
      socket.off("accept_booking");
      socket.off("reject_booking");
    };
  }, []);

  useEffect(() => {
    if (status !== "awaiting_payment") return;
    const t = setTimeout(() => {
      setStatus("payment");
    }, 2000);
    return () => clearTimeout(t);
  }, [status]);

  const handleRequestBooking = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/user/booking", {
        driverId,
        vehicleId,
        pickUpAddress: pickUp,
        dropAddress: drop,
        pickUpLocation: {
          type: "Point",
          coordinates: [pickUpLon, pickUpLat],
        },
        dropLocation: {
          type: "Point",
          coordinates: [dropLon, dropLat],
        },
        fare,
        mobile,
      });
      const createdBooking = data?.booking || data;
      setBooking(createdBooking);
      setStatus("requested");
    } catch (error: any) {
      console.log("Booking error:", error?.response?.data?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking?._id) return;
    try {
      const { data } = await axios.get(`/api/user/booking/${booking._id}/cancel`);
      if (data?.success) {
        setStatus("idle");
        setBooking(null);
      }
    } catch (error) {
      console.log("Cancel error:", error);
    }
  };

  const handleConfirmPayment = async () => {
    if (!booking?._id) return;
    setLoading(true);

    try {
      if (paymentMethod === "online") {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert("Razorpay SDK failed to load.");
          setLoading(false);
          return;
        }

        const { data: orderData } = await axios.post("/api/payment/create", {
          bookingId: booking._id,
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "RideX",
          description: "Ride Payment",
          order_id: orderData.orderId,
          handler: async (response: any) => {
            try {
              const { data: verifyData } = await axios.post("/api/payment/verify", {
                bookingId: booking._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyData?.success) {
                setStatus("confirmed");
                router.push(`/user/ride/${booking._id}`);
              }
            } catch (err) {
              console.log("Payment verification failed:", err);
            }
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
        setLoading(false);
      } else {
        const { data } = await axios.get(`/api/user/booking/${booking._id}/confirm`);
        if (data?.success) {
          setStatus("confirmed");
          router.push(`/user/ride/${booking._id}`);
        }
        setLoading(false);
      }
    } catch (error) {
      console.log("Payment error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 px-4 pt-24 pb-8 sm:pb-12">
      <Nav/>
      <div className="relative max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 sm:mb-6"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-0.5 w-6 bg-zinc-900" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
              BOOKING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Checkout
          </h1>
          <p className="text-zinc-400 text-xs mt-0.5 font-medium">
            Review your ride & confirm
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-xs flex flex-col"
          >
            <div className="h-1 bg-zinc-900 w-full" />
            <div className="p-4.5 sm:p-5 flex flex-col flex-1 justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                      SELECTED VEHICLE
                    </p>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 capitalize">
                      {vehicleLabel}
                    </h2>
                  </div>
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-xs text-white">
                    {VehicleIcon && <VehicleIcon size={20} />}
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden mb-1">
                  <div className="flex gap-3 p-3 border-b border-zinc-100">
                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white ring-1 ring-zinc-300" />
                      <div className="w-px flex-1 bg-zinc-300 my-1 min-h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                        PICKUP
                      </p>
                      <p className="text-xs font-semibold text-zinc-900 leading-snug truncate">
                        {booking?.pickUpAddress || pickUp}
                      </p>
                    </div>
                    <MapPin size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                  </div>

                  <div className="flex gap-3 p-3">
                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-900 bg-white ring-1 ring-zinc-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                        DROP
                      </p>
                      <p className="text-xs font-semibold text-zinc-900 leading-snug truncate">
                        {booking?.dropAddress || drop}
                      </p>
                    </div>
                    <Navigation size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between pt-3 border-t border-zinc-100 mt-auto">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                    TOTAL FARE
                  </p>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Includes base + distance charge
                  </p>
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex items-baseline gap-0.5"
                >
                  <IndianRupee size={18} className="text-zinc-900 stroke-[2.5]" />
                  <span className="text-3xl font-black tracking-tight text-zinc-900 leading-none">
                    {booking?.fare || fare}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-xs flex flex-col"
          >
            <div className="h-1 bg-zinc-900 w-full" />
            <div className="p-4.5 sm:p-5 flex-1 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {(status === "idle" || status === "rejected") && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col flex-1 justify-between"
                  >
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                        {status === "rejected" ? "RIDE REJECTED" : "READY TO GO?"}
                      </p>
                      <h3 className="text-lg sm:text-xl font-black text-zinc-900 mb-3.5">
                        {status === "rejected" ? "Driver declined your request" : "Confirm your ride"}
                      </h3>
                      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 space-y-2">
                        {features.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <div key={index} className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
                                <Icon size={12} />
                              </div>
                              <p className="text-[11px] font-medium text-zinc-500">
                                {item.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.01 }}
                      disabled={loading}
                      onClick={handleRequestBooking}
                      className="w-full h-11 mt-5 bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                      <span>{status === "rejected" ? "Request Again" : "Request Ride"}</span>
                      <ArrowRight size={14} />
                    </motion.button>
                  </motion.div>
                )}

                {status === "requested" && (
                  <motion.div
                    key="requested"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col flex-1 items-center justify-center gap-4 text-center py-4"
                  >
                    <div className="relative flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-zinc-900"
                      />
                      <div className="relative w-14 h-14 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
                        <Loader2 size={22} className="text-zinc-900 animate-spin" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 mb-0.5">
                        Finding your drivers
                      </h3>
                      <p className="text-zinc-400 text-xs font-medium">
                        Waiting for driver to accept
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors border border-zinc-200 hover:border-zinc-400 px-3.5 py-1.5 rounded-lg cursor-pointer mt-1"
                    >
                      <XCircle size={12} />
                      <span>Cancel Request</span>
                    </motion.button>
                  </motion.div>
                )}

                {status === "awaiting_payment" && (
                  <motion.div
                    key="awaiting_payment"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col flex-1 items-center justify-center gap-4 text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="w-14 h-14 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center"
                    >
                      <CheckCircle size={26} className="text-zinc-900" />
                    </motion.div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 mb-0.5">
                        Driver Accepted!
                      </h3>
                      <p className="text-zinc-400 text-xs font-medium">
                        Preparing payment options
                      </p>
                    </div>
                    <div className="w-36 h-1 bg-zinc-100 rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-zinc-900 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}

                {status === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col flex-1 justify-between"
                  >
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                        ALMOST THERE
                      </p>
                      <h3 className="text-lg sm:text-xl font-black text-zinc-900 mb-3.5">
                        Select payment method
                      </h3>
                      <div className="space-y-2">
                        {paymentOptions.map((p) => {
                          const Icon = p.icon;
                          const active = paymentMethod === p.id;
                          return (
                            <motion.div
                              key={p.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setPaymentMethod(p.id as any)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                active
                                  ? "bg-zinc-900 border-zinc-900 text-white"
                                  : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-900"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  active
                                    ? "bg-white/10 text-white"
                                    : "bg-zinc-200 text-zinc-700"
                                }`}
                              >
                                <Icon size={15} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold leading-tight ${active ? "text-white" : "text-zinc-900"}`}>
                                  {p.title}
                                </p>
                                <p className={`text-[10px] font-medium leading-tight mt-0.5 ${active ? "text-zinc-400" : "text-zinc-500"}`}>
                                  {p.sub}
                                </p>
                              </div>
                              <AnimatePresence>
                                {active && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <CheckCircle size={14} className="text-white shrink-0" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.01 }}
                      disabled={loading || !paymentMethod}
                      onClick={handleConfirmPayment}
                      className="w-full h-11 mt-5 bg-zinc-900 hover:bg-black disabled:opacity-30 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : paymentMethod === "cash" ? (
                        <>
                          <Banknote size={15} />
                          <span>Confirm Cash Ride</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Payment</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}

                {status === "confirmed" && (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col flex-1 items-center justify-center gap-4 text-center py-4"
                  >
                    <div className="relative w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                      {[0, 1].map((idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.4 }}
                          className="absolute inset-0 rounded-full border-2 border-zinc-900"
                        />
                      ))}
                      <CheckCircle size={32} className="text-zinc-900" />
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-zinc-900 mb-0.5">
                        Ride Confirmed!
                      </h3>
                      <p className="text-zinc-400 text-xs font-medium max-w-[200px] mx-auto">
                        Your driver is on the way. Track live from the ride screen.
                      </p>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => router.push(`/user/ride/${booking?._id}`)}
                      className="mt-2 flex items-center gap-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Track Your Ride</span>
                      <ArrowRight size={14} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-100" />}>
      <CheckoutContent />
    </Suspense>
  )
}
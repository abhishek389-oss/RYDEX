"use client"
import dynamic from 'next/dynamic'
import { ArrowLeft, Bike, Car, MapPin, Navigation, RefreshCcw, Search, Truck, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import axios from 'axios'
import { VehicleType } from '@/models/vehicle.model'
import VehicleCard from '@/components/VehicleCard'
import Nav from '@/components/Nav'

const SearchMap = dynamic(() => import('@/components/SearchMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-100 animate-pulse" />
})

const VEHICLE_META: any = {
  bike: { lable: "Bike", Icon: Bike },
  auto: { lable: "Auto", Icon: Car },
  car: { lable: "Car", Icon: Car },
  loading: { lable: "Loading", Icon: Truck },
  truck: { lable: "Truck", Icon: Truck }
}

interface IVehicle {
  _id: string
  owner: string
  type: VehicleType
  vehicleModel: string
  number: string
  imageUrl?: string
  baseFare?: number
  pricePerKM?: number
  waitingCharge?: number
  status: "approved" | "pending" | "rejected"
  rejectionReason?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

function SearchComponents() {
  const router = useRouter()
  const params = useSearchParams()

  const [kilometer, setKilometer] = useState<number>(0)
  const [pickUp, setPickUp] = useState(params.get("pickup") || params.get("pickUp") || "")
  const [drop, setDrop] = useState(params.get("drop") || "")
  const mobile = params.get("mobile") || ""

  const pickUpLat = Number(params.get("pickuplat") || params.get("pickUpLat") || 0)
  const pickUpLon = Number(params.get("pickuplon") || params.get("pickUpLon") || 0)
  const dropLat = Number(params.get("droplat") || params.get("dropLat") || 0)
  const dropLon = Number(params.get("droplon") || params.get("dropLon") || 0)
  const vehicle = params.get("vehicle") || ""

  const [vehicles, setVehicles] = useState<IVehicle[]>([])
  const [loading, setLoading] = useState(false)
  const meta = VEHICLE_META[vehicle]

  const getNearByVehicles = async (latitude: number, longitude: number, vehicleType: string | null) => {
    if (!latitude || !longitude) return
    setLoading(true)
    try {
      const { data } = await axios.post("/api/vehicles/near-by", {
        latitude,
        longitude,
        vehicleType
      })
      setVehicles(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pickUpLat && pickUpLon) {
      getNearByVehicles(pickUpLat, pickUpLon, vehicle)
    }
  }, [pickUpLat, pickUpLon, vehicle])

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden pt-16">
      <Nav />
      <div className="absolute top-20 left-4 z-50">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} className="text-zinc-900" />
        </motion.button>
      </div>

      <div className="relative w-full h-[46vh] z-0">
        <SearchMap
          pickUp={pickUp}
          drop={drop}
          onChange={(p, d) => {
            setPickUp(p)
            setDrop(d)
          }}
          onDistance={setKilometer}
        />
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="relative z-20 -mt-8 bg-white rounded-t-[24px] border-t border-zinc-200 shadow-[0_-6px_30px_rgba(0,0,0,0.05)] pt-4 pb-16 min-h-[56vh]"
      >
        <div className="px-4 lg:px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-50 border border-zinc-200/90 rounded-xl overflow-hidden mb-4"
          >
            <div className="flex gap-2.5 px-3 py-2 border-b border-zinc-100 items-center">
              <div className="w-2 h-2 rounded-full bg-zinc-900 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">PICKUP</p>
                <p className="text-xs text-zinc-900 font-semibold truncate leading-tight">
                  {pickUp || "No pickup location"}
                </p>
              </div>
              <MapPin size={12} className="text-zinc-400 shrink-0" />
            </div>

            <div className="flex gap-2.5 px-3 py-2 items-center">
              <div className="w-2 h-2 rounded-full border-2 border-zinc-900 bg-white shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">DROP</p>
                <p className="text-xs text-zinc-900 font-semibold truncate leading-tight">
                  {drop || "No drop location"}
                </p>
              </div>
              <Navigation size={12} className="text-zinc-400 shrink-0" />
            </div>
          </motion.div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-zinc-900 text-base font-black tracking-tight">
                {loading
                  ? "Finding Vehicles..."
                  : vehicles.length > 0
                    ? "Available Rides"
                    : "No nearby Vehicles"}
              </h2>
              {meta && (
                <p className="text-zinc-400 text-[11px]">
                  {meta.lable} rides near your pickup
                </p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full"
                >
                  <div className="w-3 h-3 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
                  <span className="text-zinc-500 text-[11px] font-semibold">Searching...</span>
                </motion.div>
              ) : vehicles.length > 0 ? (
                <motion.div
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                >
                  <Zap size={10} className="text-emerald-600 fill-emerald-600" />
                  <span className="text-emerald-700 text-[10px] font-bold">Live</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {!loading && vehicles.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-3">
                  <Search size={20} className="text-zinc-400" />
                </div>
                <p className="text-zinc-900 font-bold text-sm mb-0.5">Vehicles Not Found</p>
                <p className="text-zinc-400 text-xs max-w-xs leading-relaxed">
                  No {meta?.lable || "vehicle"} drivers available near your pickup right now.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => getNearByVehicles(pickUpLat, pickUpLon, vehicle)}
                  className="mt-4 flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RefreshCcw size={12} /> Retry Search
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vehicles.map((v, index) => {
              const fareAmount = Math.round((v.baseFare || 0) + (v.pricePerKM || 0) * kilometer)

              return (
                <motion.div
                  key={v._id || index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <VehicleCard
                    vehicle={v}
                    distance={kilometer}
                    onBook={() => {
                      const url = new URLSearchParams({
                        pickUp,
                        drop,
                        vehicle: v.type,
                        driverId: v.owner,
                        vehicleId: String(v._id),
                        fare: String(fareAmount),
                        pickUpLat: String(pickUpLat),
                        pickUpLon: String(pickUpLon),
                        dropLat: String(dropLat),
                        dropLon: String(dropLon),
                        mobile: String(mobile)
                      })
                      router.push(`/user/checkout?${url.toString()}`)
                    }}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-100" />}>
      <SearchComponents />
    </Suspense>
  )
}
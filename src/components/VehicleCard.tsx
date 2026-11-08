"use client"
import React from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Bike, Car, Clock, Gauge, IndianRupee, Star, Truck } from 'lucide-react'
import { VehicleType } from '@/models/vehicle.model'

interface IVehicle {
  _id?: string
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

type Props = {
  vehicle: IVehicle
  distance?: number
  onBook: () => void
}

const TYPE_CONFIG: any = {
  bike: { label: "Bike", icon: Bike },
  auto: { label: "Auto", icon: Car },
  car: { label: "Car", icon: Car },
  loading: { label: "Loading", icon: Truck },
  truck: { label: "Truck", icon: Truck }
}

function VehicleCard({ vehicle, distance = 0, onBook }: Props) {
  const { icon: Icon, label } = TYPE_CONFIG[vehicle.type] || { icon: Car, label: vehicle.type }
  
  const isDistanceReady = Boolean(distance && distance > 0)
  const calculatedFare = isDistanceReady 
    ? Math.round((vehicle.baseFare || 0) + (vehicle.pricePerKM || 0) * distance) 
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white border border-zinc-200/90 rounded-2xl overflow-hidden flex flex-col group cursor-default shadow-xs hover:shadow-md transition-shadow"
    >
      <div className="relative h-40 bg-zinc-50 flex items-center justify-center overflow-hidden border-b border-zinc-100">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)",
            backgroundSize: "16px 16px"
          }}
        />

        {vehicle.imageUrl ? (
          <motion.img
            src={vehicle.imageUrl}
            alt={vehicle.vehicleModel}
            className="relative z-10 h-28 w-full object-contain p-1"
            style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.12))" }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.25 }}
          />
        ) : (
          <Icon size={52} className="text-zinc-400 relative z-10" />
        )}

        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
          {Icon && <Icon size={10} />}
          <span>{label}</span>
        </div>

        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-white/95 border border-zinc-200 text-zinc-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
          <Star size={9} className="fill-amber-400 text-amber-400" />
          <span>4.8</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3.5 gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-zinc-900 text-sm font-bold tracking-tight leading-tight truncate">
              {vehicle.vehicleModel}
            </h3>
            <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold uppercase text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/80">
              {vehicle.number}
            </span>
          </div>
          <div className="shrink-0 w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
            {Icon && <Icon size={13} className="text-zinc-700" />}
          </div>
        </div>

        {/* Rate Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center gap-1 text-zinc-400 mb-0.5">
              <Gauge size={10} />
              <span className="text-[8px] uppercase tracking-wider font-bold">Per KM</span>
            </div>
            <p className="flex items-center text-zinc-900 text-xs font-bold">
              <IndianRupee size={10} />
              {vehicle.pricePerKM}
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center gap-1 text-zinc-400 mb-0.5">
              <Clock size={10} />
              <span className="text-[8px] uppercase tracking-wider font-bold">Waiting</span>
            </div>
            <p className="flex items-center text-zinc-900 text-xs font-bold">
              <IndianRupee size={9} />
              {vehicle.waitingCharge}
              <span className="text-[9px] font-normal text-zinc-400 ml-0.5">/min</span>
            </p>
          </div>
        </div>

        {/* Fare + Action Button */}
        <div className="flex items-end justify-between pt-2 border-t border-zinc-100 mt-auto">
          <div>
            <p className="text-[8px] uppercase tracking-wider font-bold text-zinc-400">
              Est. Fare
            </p>
            <div className="flex items-baseline gap-0.5">
              {isDistanceReady ? (
                <>
                  <IndianRupee size={13} className="text-zinc-900 stroke-[2.5]" />
                  <span className="text-zinc-900 text-lg font-black tracking-tight">
                    {calculatedFare}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1 py-1">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin" />
                  <span className="text-[10px] text-zinc-400 font-semibold">Calculating...</span>
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            disabled={!isDistanceReady}
            onClick={onBook}
            className="flex items-center gap-1 bg-zinc-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Book</span>
            <ArrowRight size={12} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default VehicleCard
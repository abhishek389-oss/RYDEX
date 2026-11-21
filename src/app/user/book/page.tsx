"use client"
import Nav from '@/components/Nav'
import { VehicleType } from '@/models/vehicle.model'
import axios from 'axios'
import { ArrowLeft, ArrowRight, Bike, Car, CheckCircle, ChevronRight, CircleDashed, Clock, LocateFixed, MapPin, Navigation, Phone, ShieldCheck, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

type Place = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  lat: number;
  lng: number;
}

const VEHICLE = [
  { id: "bike", label: "Bike", Icon: Bike, desc: "Quick & affordable" },
  { id: "auto", label: "Auto", Icon: Car, desc: "Everyday Rides" },
  { id: "car", label: "Car", Icon: Car, desc: "Comfort Rides" },
  { id: "loading", label: "Loading", Icon: Truck, desc: "Small Cargo" },
  { id: "truck", label: "Truck", Icon: Truck, desc: "Heavy Transport" },
]

function BookPage() {
  const router = useRouter()

  const [vehicle, setVehicle] = useState<VehicleType>();
  const [mobile, setMobile] = useState("");
  const [pickUp, setPickUp] = useState("");
  const [drop, setDrop] = useState("");
  const [pickUpCountry, setPickUpCountry] = useState("");
  const [pickUpLongitude, setPickUpLongitude] = useState<number>();
  const [pickUpLatitude, setPickUpLatitude] = useState<number>();
  const [dropCountry, setDropCountry] = useState("");
  const [dropLatitude, setDropLatitude] = useState<number>();
  const [dropLongitude, setDropLongitude] = useState<number>();
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pickUpSuggestions, setPickUpSuggestions] = useState<Place[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<Place[]>([]);

  const canContinue = Boolean(
    vehicle &&
    mobile.length >= 10 &&
    pickUp &&
    drop &&
    pickUpLatitude &&
    pickUpLongitude &&
    dropLatitude &&
    dropLongitude
  )

  const progress = [Boolean(vehicle), mobile.length >= 10, Boolean(pickUpLatitude), Boolean(dropLatitude)].filter(Boolean).length

  const selectedVehicleObj = VEHICLE.find((v) => v.id === vehicle)

  const searchAddress = async (q: string, setResults: (r: Place[]) => void, restrict?: string | null) => {
    if (!q || q.trim().length < 3) {
      setResults([])
      return;
    }

    try {
      const { data } = await axios.get(
        "https://api.geoapify.com/v1/geocode/autocomplete",
        {
          params: {
            text: q.trim(),
            apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
            filter: "countrycode:in",
            limit: 5,
          },
        }
      );
      let results: Place[] = (data.features ?? []).map((f: any) => ({
        id: String(f.properties.osm_id || Math.random()),
        name: f.properties.name,
        city: f.properties.city,
        state: f.properties.state,
        country: f.properties.country,
        countrycode: f.properties.countrycode,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1]
      }))

      if (restrict && restrict.trim()) {
        results = results.filter((r) =>
          r.country?.toLowerCase() === restrict.toLowerCase() ||
          r.countrycode?.toLowerCase() === restrict.toLowerCase()
        )
      }

      setResults(results)
    } catch (error) {
      console.log("Search Address Error:", error)
      setResults([])
    }
  }

  const suggestion = (p: Place) => [p.name, p.city, p.state, p.country].filter(Boolean).join(", ")

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (cordinates) => {
        try {
          const { data } = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
            params: {
              lat: cordinates.coords.latitude,
              lon: cordinates.coords.longitude,
              apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
              filter: "countrycode:in",
            }
          })
          if (data.features?.length) {
            const p = data.features[0].properties
            const address = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(", ")
            setPickUp(address)
            setPickUpCountry(p.country || "India")
            setPickUpLatitude(cordinates.coords.latitude)
            setPickUpLongitude(cordinates.coords.longitude)
            setPickUpSuggestions([])
          }
        } catch (error) {
          console.log(error)
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
      }
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-100 px-4 sm:px-6 pt-24 pb-12">
      <Nav />
      <div className="relative max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="w-9 h-9 mt-1 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft size={16} className="text-zinc-900" />
            </motion.button>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-0.5 w-6 bg-zinc-900" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  SMART MOBILITY
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
                Book a Ride
              </h1>
              <p className="text-zinc-400 text-xs mt-0.5 font-medium">
                Select your vehicle, contact & destination to find nearby drivers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-end bg-white border border-zinc-200/90 px-3 py-2 rounded-xl shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Step {progress}/4
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i < progress ? 18 : 6,
                    background: i < progress ? "#09090b" : "#d4d4d8"
                  }}
                  transition={{ duration: 0.25 }}
                  className="h-1.5 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-xs flex flex-col"
          >
            <div className="h-1 bg-zinc-900 w-full" />
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-5">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                      STEP 01
                    </p>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900">
                      Choose Vehicle
                    </h2>
                  </div>
                  <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center shadow-xs text-white">
                    {selectedVehicleObj ? <selectedVehicleObj.Icon size={18} /> : <Car size={18} />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {VEHICLE.map((v, i) => {
                    const active = vehicle === v.id
                    return (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 + i * 0.03 }}
                        onClick={() => setVehicle(v.id as VehicleType)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all duration-150 cursor-pointer select-none touch-manipulation ${
                          active
                            ? "bg-zinc-900 border-zinc-900 shadow-xs"
                            : "bg-zinc-50 border-zinc-200/90 hover:border-zinc-400 hover:bg-white"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            active ? "bg-white text-zinc-900" : "bg-zinc-200/80 text-zinc-700"
                          }`}
                        >
                          <v.Icon size={16} />
                        </div>

                        <div className="min-w-0 pr-3">
                          <p className={`text-xs font-bold truncate leading-tight ${active ? "text-white" : "text-zinc-900"}`}>
                            {v.label}
                          </p>
                          <p className={`text-[10px] truncate mt-0.5 ${active ? "text-zinc-300" : "text-zinc-500"}`}>
                            {v.desc}
                          </p>
                        </div>

                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-2.5 right-2.5"
                          >
                            <CheckCircle size={13} className="text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                  STEP 02
                </p>
                <h3 className="text-base font-black tracking-tight text-zinc-900 mb-2.5">
                  Passenger Contact
                </h3>

                <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus-within:border-zinc-900 focus-within:bg-white transition-all">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200/80 flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-zinc-700" />
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    className="flex-1 bg-transparent text-base sm:text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                  />
                  <AnimatePresence>
                    {mobile.length === 10 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-zinc-400 text-[11px] mt-1.5 font-medium">
                  Driver coordination & OTP updates will be shared on this number
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-zinc-200/90 overflow-visible shadow-xs flex flex-col"
          >
            <div className="h-1 bg-zinc-900 w-full rounded-t-2xl" />
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                      STEP 03
                    </p>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900">
                      Set Your Route
                    </h2>
                  </div>
                  <div className="w-9 h-9 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-900">
                    <Navigation size={16} />
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-visible">
                  <div className="relative z-30">
                    <div className="flex items-center gap-2.5 px-3.5 py-3 focus-within:bg-white rounded-t-xl transition-colors">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white ring-1 ring-zinc-300" />
                        <div className="w-px h-4 bg-zinc-300 mt-0.5" />
                      </div>
                      <input
                        value={pickUp}
                        onChange={(e) => {
                          setPickUp(e.target.value)
                          setPickUpLatitude(undefined)
                          setPickUpLongitude(undefined)
                          searchAddress(e.target.value, setPickUpSuggestions)
                        }}
                        placeholder="Enter pickup location"
                        className="flex-1 bg-transparent text-base sm:text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none min-w-0"
                      />
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={useCurrentLocation}
                        disabled={locating}
                        title="Use Current Location"
                        className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-black text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer touch-manipulation"
                      >
                        <LocateFixed size={14} className={locating ? "animate-spin" : ""} />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {pickUpSuggestions?.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-44 overflow-y-auto z-50 divide-y divide-zinc-100"
                        >
                          {pickUpSuggestions.map((p, i) => (
                            <motion.div
                              key={`${p.id}-${i}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              onClick={() => {
                                setPickUp(suggestion(p))
                                setPickUpCountry(p.country ?? "")
                                setPickUpLatitude(p.lat)
                                setPickUpLongitude(p.lng)
                                setPickUpSuggestions([])
                              }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <MapPin size={13} className="text-zinc-500 shrink-0" />
                              <span className="text-xs text-zinc-800 font-medium truncate">{suggestion(p)}</span>
                              <ChevronRight size={13} className="text-zinc-300 shrink-0 ml-auto" />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="h-px bg-zinc-200" />

                  <div className="relative z-20">
                    <div className="flex items-center gap-2.5 px-3.5 py-3 focus-within:bg-white rounded-b-xl transition-colors">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-900 bg-white ring-1 ring-zinc-300" />
                      </div>
                      <input
                        value={drop}
                        onChange={(e) => {
                          setDrop(e.target.value)
                          setDropLatitude(undefined)
                          setDropLongitude(undefined)
                          searchAddress(e.target.value, setDropSuggestions, pickUpCountry)
                        }}
                        disabled={!pickUpCountry}
                        placeholder={pickUpCountry ? "Enter drop destination" : "Select pickup location first"}
                        className="flex-1 bg-transparent text-base sm:text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none disabled:cursor-not-allowed min-w-0"
                      />
                      <Navigation size={13} className="text-zinc-400 shrink-0" />
                    </div>

                    <AnimatePresence>
                      {dropSuggestions?.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-44 overflow-y-auto z-50 divide-y divide-zinc-100"
                        >
                          {dropSuggestions.map((p, i) => (
                            <motion.div
                              key={`${p.id}-${i}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              onClick={() => {
                                setDrop(suggestion(p))
                                setDropCountry(p.country ?? "")
                                setDropLatitude(p.lat)
                                setDropLongitude(p.lng)
                                setDropSuggestions([])
                              }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <Navigation size={13} className="text-zinc-500 shrink-0" />
                              <span className="text-xs text-zinc-800 font-medium truncate">{suggestion(p)}</span>
                              <ChevronRight size={13} className="text-zinc-300 shrink-0 ml-auto" />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-4 bg-zinc-50 border border-zinc-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
                      <Clock size={12} />
                    </div>
                    <p className="text-[11px] font-medium text-zinc-500">
                      Instant fare estimate & live map distance on next step
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
                      <ShieldCheck size={12} />
                    </div>
                    <p className="text-[11px] font-medium text-zinc-500">
                      Choose from verified nearby drivers in real time
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  whileHover={canContinue && !loading ? { scale: 1.01 } : {}}
                  disabled={!canContinue || loading}
                  onClick={() => {
                    setLoading(true)
                    router.push(`/user/search?pickup=${encodeURIComponent(pickUp)}&drop=${encodeURIComponent(drop)}&vehicle=${vehicle}&mobile=${encodeURIComponent(mobile)}&pickuplat=${pickUpLatitude}&pickuplon=${pickUpLongitude}&droplat=${dropLatitude}&droplon=${dropLongitude}`)
                  }}
                  className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black active:bg-black disabled:opacity-40 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-xs disabled:shadow-none cursor-pointer disabled:cursor-not-allowed touch-manipulation"
                >
                  {loading ? (
                    <CircleDashed size={16} className="text-white animate-spin" />
                  ) : (
                    <>
                      <span>Find Available Rides</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default BookPage
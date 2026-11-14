"use client"
import Nav from '@/components/Nav'
import { VehicleType } from '@/models/vehicle.model'
import axios from 'axios'
import { ArrowLeft, Bike, Car, CheckCircle, ChevronRight, CircleDashed, LocateFixed, MapPin, Navigation, Phone, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const stepVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
}

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

let timer: any = null
function page() {
  const router = useRouter()

  const [vehicle, setVehicle] = useState<VehicleType>();
  const [mobile, setMobile] = useState("");
  const [pickUp, setPickUp] = useState("");
  const [drop, setDrop] = useState("");
  const [pickUpCountry, setPickUpCountry] = useState("");
  const [pickUpLongitude, setPickUpLongitude] = useState<Number>();
  const [pickUpLatitude, setPickUpLatitude] = useState<Number>();
  const [dropCountry, setDropCountry] = useState("");
  const [dropLatitude, setDropLatitude] = useState<Number>();
  const [dropLongitude, setDropLongitude] = useState<Number>();
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pickUpSuggestions, setPickUpSuggestions] = useState<Place[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<Place[]>([]);

  const canContinue = !!(vehicle && mobile && pickUp && drop && pickUpLatitude && pickUpLongitude && dropLatitude && dropLongitude)

  const progress = [!!vehicle, !!(mobile.length == 10), !!pickUp, !!drop].filter(Boolean).length

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

  const suggestion = (p: Place) => [p.name, p.city, p.state, p.country].filter(Boolean).join(",")

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(async (cordinates) => {
      try {
        const { data } = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
          params: {
            lat: cordinates.coords.latitude,
            lon: cordinates.coords.longitude,
            apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
            filter: "countrycode:in",
          }
        })
        if (data.features.length) {
          const p = data.features[0].properties
          const address = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(",")
          setPickUp(address)
          setPickUpCountry(p.country||"India")
          setPickUpLatitude(cordinates.coords.latitude)
          setPickUpLongitude(cordinates.coords.longitude)
          setPickUpSuggestions([])
          setLocating(false)
        }
      } catch (error) {
        console.log(error)
        setLocating(false)
      }
    })
  }

  return (
    <div className='min-h-screen bg-zinc-100 flex flex-col items-center justify-start px-4 pt-24 pb-12'>
      <Nav/>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className='w-full max-w-sm sm:max-w-md'
      >
        <div className='flex items-center gap-3 mb-3.5 px-1'>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className='w-8 h-8 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0 cursor-pointer'
          >
            <ArrowLeft size={15} className='text-zinc-900' />
          </motion.button>

          <div className='flex-1 min-w-0'>
            <h1 className='text-zinc-900 text-sm sm:text-base font-bold tracking-tight'>Book a Ride</h1>
            <p className='text-zinc-400 text-[11px]'>Fill in the details below</p>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            {[0, 1, 2, 3].map((d, i) => (
              <motion.div
                key={i}
                animate={{ width: i < progress ? 20 : 6, background: i < progress ? "#09090b" : "#d4d4d8" }}
                transition={{ duration: 0.25 }}
                className='h-1.5 rounded-full'
              />
            ))}
          </div>
        </div>

        <div className='bg-white rounded-2xl border border-zinc-200/90 shadow-sm overflow-visible'>
          <div className='h-1 bg-zinc-900 w-full' />
          <div className='p-3.5 sm:p-4 space-y-3.5'>
            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center shrink-0'>
                  <span className='text-white text-[9px] font-bold'>1</span>
                </div>
                <p className='text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider'>Choose Vehicle</p>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                {VEHICLE.map((v, i) => {
                  const active = vehicle == v.id
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 + i * 0.03 }}
                      onClick={() => setVehicle(v.id as VehicleType)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.96 }}
                      className={`relative p-2 rounded-xl border flex items-center gap-2.5 text-left transition-colors duration-150 cursor-pointer select-none
                        ${active
                          ? "bg-zinc-900 border-zinc-900 shadow-xs"
                          : "bg-zinc-50/70 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                        ${active ? "bg-white text-zinc-900" : "bg-zinc-200/80 text-zinc-600"}`}>
                        <v.Icon size={15} />
                      </div>

                      <div className='min-w-0 pr-3'>
                        <p className={`text-xs font-bold truncate leading-tight ${active ? "text-white" : "text-zinc-900"}`}>{v.label}</p>
                        <p className={`text-[9px] truncate mt-0.5 ${active ? "text-zinc-300" : "text-zinc-400"}`}>{v.desc}</p>
                      </div>

                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className='absolute top-2 right-2'
                        >
                          <CheckCircle size={11} className='text-white fill-white/20' />
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            <div className='h-px bg-zinc-100' />

            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center shrink-0'>
                  <span className='text-white text-[9px] font-bold'>2</span>
                </div>
                <p className='text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider'>Mobile</p>
              </div>

              <div className='flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 focus-within:border-zinc-900 focus-within:bg-white transition-all'>
                <div className='w-7 h-7 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0'>
                  <Phone size={13} className='text-zinc-600' />
                </div>
                <input
                  type='tel'
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder='Enter your mobile number'
                  inputMode='numeric'
                  maxLength={15}
                  className='flex-1 bg-transparent text-xs sm:text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none'
                />
                <AnimatePresence>
                  {mobile.length == 10 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle size={15} className='text-emerald-500 fill-emerald-50 shrink-0' />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className='text-zinc-400 text-[10px] mt-1 ml-1'>Ride updates will be sent to this number</p>
            </motion.div>

            <div className='h-px bg-zinc-100' />

            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center shrink-0'>
                  <span className='text-white text-[9px] font-bold'>3</span>
                </div>
                <p className='text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider'>Route</p>
              </div>

              <div className='bg-zinc-50 border border-zinc-200 rounded-xl overflow-visible'>
                <div className='relative z-30'>
                  <div className='flex items-center gap-2.5 px-3 py-2.5 focus-within:bg-white rounded-t-xl transition-colors'>
                    <div className='flex flex-col items-center shrink-0'>
                      <div className='w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white shadow-xs' />
                      <div className='w-px h-4 bg-zinc-300 mt-0.5' />
                    </div>
                    <input
                      value={pickUp}
                      onChange={(e) => {
                        setPickUp(e.target.value)
                        searchAddress(e.target.value, setPickUpSuggestions)
                      }}
                      placeholder='PickUp location'
                      className='flex-1 bg-transparent text-xs sm:text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none'
                    />
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={useCurrentLocation}
                      disabled={locating}
                      className='w-7 h-7 rounded-lg bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center shrink-0 cursor-pointer'
                    >
                      <LocateFixed size={13} className={`text-zinc-700 ${locating ? "animate-spin" : ""}`} />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {pickUpSuggestions?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className='absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 divide-y divide-zinc-100'
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
                            className='flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-zinc-50 transition-colors cursor-pointer'
                          >
                            <MapPin size={12} className='text-zinc-400 shrink-0' />
                            <span className='text-xs text-zinc-800 font-medium truncate'>{suggestion(p)}</span>
                            <ChevronRight size={12} className='text-zinc-300 shrink-0 ml-auto' />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className='h-px bg-zinc-200' />

                <div className='relative z-10'>
                  <div className='flex items-center gap-2.5 px-3 py-2.5 focus-within:bg-white rounded-b-xl transition-colors'>
                    <div className='flex flex-col items-center shrink-0'>
                      <div className='w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white shadow-xs' />
                    </div>
                    <input
                      value={drop}
                      onChange={(e) => {
                        setDrop(e.target.value)
                        searchAddress(e.target.value, setDropSuggestions, pickUpCountry)
                      }}
                      disabled={!pickUpCountry}
                      placeholder={pickUpCountry ? "Drop Location" : "Select Pick up Location First"}
                      className='flex-1 bg-transparent text-xs sm:text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none disabled:cursor-not-allowed'
                    />
                    <Navigation size={12} className='text-zinc-400 shrink-0' />
                  </div>

                  <AnimatePresence>
                    {dropSuggestions?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className='absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 divide-y divide-zinc-100'
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
                            className='flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-zinc-50 transition-colors cursor-pointer'
                          >
                            <Navigation size={12} className='text-zinc-400 shrink-0' />
                            <span className='text-xs text-zinc-800 font-medium truncate'>{suggestion(p)}</span>
                            <ChevronRight size={12} className='text-zinc-300 shrink-0 ml-auto' />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className='pt-1'
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={canContinue && !loading ? { scale: 1.01 } : {}}
                disabled={!canContinue || loading}
                onClick={() => {
                  setLoading(true)
                  router.push(`/user/search?pickup=${encodeURIComponent(pickUp)}&drop=${encodeURIComponent(drop)}&vehicle=${vehicle}&mobile=${encodeURIComponent(mobile)}&pickuplat=${pickUpLatitude}&pickuplon=${pickUpLongitude}&droplat=${dropLatitude}&droplon=${dropLongitude}`)
                }}
                className='w-full h-11 rounded-xl bg-zinc-900 hover:bg-black disabled:opacity-40 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-xs disabled:shadow-none cursor-pointer disabled:cursor-not-allowed'
              >
                {loading ? (
                  <CircleDashed size={16} className='text-white animate-spin' />
                ) : (
                  <span>Continue</span>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default page
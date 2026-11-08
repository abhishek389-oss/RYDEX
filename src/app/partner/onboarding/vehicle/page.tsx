"use client"
import Nav from "@/components/Nav"
import axios from "axios"
import { ArrowLeft, Bike, Car, CircleDashed, Package, Truck } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const VEHICLES = [
  { id: "bike", label: "Bike", icon: Bike, desc: "2 wheeler" },
  { id: "auto", label: "Auto", icon: Car, desc: "3 wheeler ride" },
  { id: "car", label: "Car", icon: Car, desc: "4 wheeler ride" },
  { id: "loading", label: "Loading", icon: Package, desc: "Small goods" },
  { id: "truck", label: "Truck", icon: Truck, desc: "Heavy transport" }
]

function page() {
  const router = useRouter()
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVehicle = async () => {
    setError("")
    try {
      setLoading(true)
      const { data } = await axios.post("/api/partner/onboarding/vehicle", {
        type: vehicleType,
        number: vehicleNumber,
        vehicleModel
      })
      console.log(data)
      setLoading(false)
      router.push("/")
    } catch (error: any) {
      setError(error?.response?.data?.message ?? "something went wrong")
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleGetVehicle = async () => {
      try {
        const { data } = await axios.get("/api/partner/onboarding/vehicle")
        setVehicleType(data.type)
        setVehicleNumber(data.number)
        setVehicleModel(data.vehicleModel)
        console.log(data)
      } catch (error) {
        console.log(error)
      }
    }

    handleGetVehicle()
  }, [])

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 pt-24 pb-12'>
      <Nav/>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-5 sm:p-6"
      >
        <div className="relative text-center">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 w-7 h-7 rounded-full border border-gray-300
              flex items-center justify-center hover:bg-gray-100 transition"
          ><ArrowLeft size={15} /></button>

          <p className="text-[11px] text-gray-500 font-medium">
            Step 1 of 3
          </p>
          <h1 className="text-lg font-bold mt-0.5 text-gray-900">
            Vehicle Details
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Add your vehicle information
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-2">Vehicle Type</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VEHICLES.map((v, i) => {
                const Icon = v.icon
                const active = vehicleType == v.id
                return (
                  <motion.div
                    key={v.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setVehicleType(v.id)}
                    className={`rounded-xl border p-2.5 flex flex-col items-center gap-1 transition cursor-pointer
                    ${active
                        ? "bg-black text-white border-black"
                        : "border-gray-200 hover:border-black"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${active
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        }`}>
                      <Icon size={16} />
                    </div>

                    <div className="text-xs font-semibold">
                      {v.label}
                    </div>

                    <p className={`text-[10px] 
                      ${active
                          ? "text-gray-300"
                          : "text-gray-500"
                        }`}>
                      {v.desc}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="vn"
              className="text-[11px] font-semibold text-gray-500"
            >Vehicle Number</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="UP70AB3422"
              id="vn"
              className="mt-1 w-full border-b border-gray-300 pb-1.5 text-xs sm:text-sm focus:outline-none focus:border-black transition" />
          </div>

          <div>
            <label htmlFor="vm"
              className="text-[11px] font-semibold text-gray-500"
            >Vehicle Model</label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="Scorpio"
              id="vm"
              className="mt-1 w-full border-b border-gray-300 pb-1.5 text-xs sm:text-sm focus:outline-none focus:border-black transition" />
          </div>
        </div>

        {error &&
          <p className="text-red-500 text-xs mt-3">*{error}</p>
        }

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVehicle()}
          disabled={loading}
          className="mt-6 w-full h-11 rounded-xl bg-black text-white text-xs sm:text-sm font-semibold flex
        items-center justify-center gap-2 disabled:opacity-40 transition cursor-pointer"
        >
          {loading ? <CircleDashed size={16} className="text-white animate-spin" /> : "Continue"}
        </motion.button>
      </motion.div>
    </div>
  )
}

export default page
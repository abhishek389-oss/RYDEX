"use client"
import axios from 'axios'
import { CheckCircle2, Clock, Loader2, LogOut, Truck, User2Icon, Users, Video, XCircle } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import KeyPerformance from './KeyPerformance'
import TabButton from './TabButton'
import { AnimatePresence, motion } from 'motion/react'
import ContentList from './ContentList'
import { signOut } from 'next-auth/react'
import AdminEarning from './AdminEarning'
import { getSocket } from '@/lib/socket'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/redux/hooks'
import { setUser } from '@/redux/userSlice'

type Stats = {
  totalApprovedPartners: number
  totalPartners: number
  totalPendingPartners: number
  totalRejectedPartners: number
}

type Tab = "partner" | "kyc" | "vehicle"

function AdminDashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("partner")
  const [partnerReviews, setPartnerReviews] = useState<any>()
  const [pendingKyc, setPendingKyc] = useState<any>()
  const [vehicleReviews, setVehicleReviews] = useState<any>()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard")
      setStats(data.stats)
      setPartnerReviews(data.pendingPartnerReviews)
      setVehicleReviews(data.pendingVehicle)
    } catch (error) {
      console.log(error)
    }
  }

  const handleGetPendingKYC = async () => {
    try {
      const { data } = await axios.get("/api/admin/video-kyc/pending")
      setPendingKyc(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleGetData()
    handleGetPendingKYC()
  }, [])

  useEffect(() => {
    const socket = getSocket()

    const joinAdminRoom = () => {
      socket.emit("join_admin")
    }

    if (socket.connected) {
      joinAdminRoom()
    }
    socket.on("connect", joinAdminRoom)

    const handleNewPartnerReview = (newPartner: any) => {
      setPartnerReviews((prev: any[] = []) => {
        const exists = prev.some((p) => String(p._id) === String(newPartner._id))
        if (exists) return prev
        return [newPartner, ...prev]
      })
      handleGetData()
    }

    const handleAdminRefresh = () => {
      handleGetData()
      handleGetPendingKYC()
    }

    socket.on("new_partner_review", handleNewPartnerReview)
    socket.on("admin_dashboard_refresh", handleAdminRefresh)

    return () => {
      socket.off("connect", joinAdminRoom)
      socket.off("new_partner_review", handleNewPartnerReview)
      socket.off("admin_dashboard_refresh", handleAdminRefresh)
    }
  }, [])

  const handleAdminLogout = async () => {
    if (logoutLoading) return
    setLogoutLoading(true)
    try {
      await signOut({ redirect: false })
      dispatch(setUser(null))
      router.push("/")
      router.refresh()
      await new Promise((resolve) => setTimeout(resolve, 400))
    } catch (error) {
      console.error("Admin logout error:", error)
    } finally {
      setLogoutLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200'>
      <AnimatePresence>
        {logoutLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white text-black px-6 py-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3"
            >
              <Loader2 size={20} className="animate-spin text-black shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Logging out...</p>
                <p className="text-[11px] text-gray-500">Please wait a moment</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40'>
        <div className='max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <Image src={"/logo.png"} alt='logo' width={28} height={28} priority />
            <span className='font-bold text-base tracking-wide'>Admin</span>
          </div>

          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-black text-white'>
              <User2Icon size={13} />
              Admin Dashboard
            </div>

            <button 
              type="button"
              disabled={logoutLoading}
              onClick={handleAdminLogout}
              className='flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-60 text-red-700 transition cursor-pointer'
            >
              {logoutLoading ? (
                <>
                  <Loader2 size={13} className='text-red-600 animate-spin'/>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut size={13} className='text-red-600'/>
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5'>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4'>
          <KeyPerformance label="Total Partners" value={stats?.totalPartners} icon={<Users size={18} />} variant={"totalPartners"} />
          <KeyPerformance label="Approved Partners" value={stats?.totalApprovedPartners} icon={<CheckCircle2 size={18} />} variant={"approved"} />
          <KeyPerformance label="Pending Partners" value={stats?.totalPendingPartners} icon={<Clock size={18} />} variant={"pending"} />
          <KeyPerformance label="Rejected Partners" value={stats?.totalRejectedPartners} icon={<XCircle size={18} />} variant={"rejected"} />
        </div>

        <div className='bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
          <TabButton
            active={activeTab == "partner"}
            count={partnerReviews?.length ?? 0}
            icon={<Users size={15} />}
            onClick={() => setActiveTab("partner")}
          >
            Partner Review
          </TabButton>

          <TabButton
            active={activeTab == "kyc"}
            count={pendingKyc?.length ?? 0}
            icon={<Video size={15} />}
            onClick={() => setActiveTab("kyc")}
          >
            Pending Video KYC
          </TabButton>

          <TabButton
            active={activeTab == "vehicle"}
            count={vehicleReviews?.length ?? 0}
            icon={<Truck size={15} />}
            onClick={() => setActiveTab("vehicle")}
          >
            Pending Vehicle Reviews
          </TabButton>
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className='space-y-2.5'
          >
            {activeTab == "partner" && <ContentList data={partnerReviews ?? []} type={"partner"} onRefresh={handleGetData} />}
            {activeTab == "kyc" && <ContentList data={pendingKyc ?? []} type={"kyc"} onRefresh={handleGetPendingKYC} />}
            {activeTab == "vehicle" && <ContentList data={vehicleReviews ?? []} type={"vehicle"} onRefresh={handleGetData} />}
          </motion.div>
        </AnimatePresence>

        <AdminEarning />

      </main>
    </div>
  )
}

export default AdminDashboard
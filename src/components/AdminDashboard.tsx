"use client"
import axios from 'axios'
import { CheckCircle2, Clock, LogOut, Truck, User2Icon, Users, Video, XCircle } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import KeyPerformance from './KeyPerformance'
import TabButton from './TabButton'
import { AnimatePresence, motion } from 'motion/react'
import ContentList from './ContentList'
import { signOut } from 'next-auth/react'
import AdminEarning from './AdminEarning'

type Stats = {
  totalApprovedPartners: number
  totalPartners: number
  totalPendingPartners: number
  totalRejectedPartners: number
}

type Tab = "partner" | "kyc" | "vehicle"

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("partner")
  const [partnerReviews, setPartnerReviews] = useState<any>()
  const [pendingKyc, setPendingKyc] = useState<any>()
  const [vehicleReviews, setVehicleReviews] = useState<any>()

  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard")
      setStats(data.stats)
      setPartnerReviews(data.pendingPartnerReviews)
      setVehicleReviews(data.pendingVehicle)
      console.log(data)
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

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200'>
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
              onClick={() => signOut({ callbackUrl: "/login" })}
              className='flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-red-700 transition cursor-pointer'
            >
              <LogOut size={13} className='text-red-600'/>
              Logout
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
            {activeTab == "partner" && <ContentList data={partnerReviews ?? []} type={"partner"} />}
            {activeTab == "kyc" && <ContentList data={pendingKyc ?? []} type={"kyc"} />}
            {activeTab == "vehicle" && <ContentList data={vehicleReviews ?? []} type={"vehicle"} />}
          </motion.div>
        </AnimatePresence>

        <AdminEarning />

      </main>
    </div>
  )
}

export default AdminDashboard
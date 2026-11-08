"use client"
import AnimatedCard from '@/components/AnimatedCard'
import DocPriview from '@/components/DocPriview'
import { IPartnerBank } from '@/models/partnerBank.model'
import { IPartnerDocs } from '@/models/partnerDocs.model'
import { Iuser } from '@/models/user.model'
import { IVehicle } from '@/models/vehicle.model'
import axios from 'axios'
import { ArrowLeft, Car, CheckCircle, CircleDashed, Clock, FileText, Hash, Landmark, ShieldCheck, Tag, User, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useParams, useRouter } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

const PartnerReviewContent = () => {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [data, setData] = useState<Iuser | null>(null)
  const [loading, setLoading] = useState(true)
  const [vehicleDetail, setVehicleDetail] = useState<IVehicle | null>(null)
  const [partnerDocs, setPartnerDocs] = useState<IPartnerDocs | null>(null)
  const [partnerBank, setPartnerBank] = useState<IPartnerBank | null>(null)
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)

  const handleGetPartner = async () => {
    if (!id || id === "[id]") return
    try {
      const { data } = await axios.get(`/api/admin/reviews/partner/${id}`)
      console.log(data)
      setData(data.partner)
      setPartnerDocs(data.documents)
      setVehicleDetail(data.vehicle)
      setPartnerBank(data.bank)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && id !== "[id]") {
      handleGetPartner()
    }
  }, [id])

  if (loading) {
    return (
      <div className='min-h-screen grid place-items-center text-gray-500 text-sm'>
        Loading Partner...
      </div>
    )
  }

  const handleApprove = async () => {
    setApproveLoading(true)
    try {
      const { data } = await axios.get(`/api/admin/reviews/partner/${id}/approve`)
      console.log(data)
      setApproveLoading(false)
      router.push("/")
    } catch (error) {
      console.log(error)
      setApproveLoading(false)
    }
  }

  const handleReject = async () => {
    setRejectLoading(true)
    try {
      const { data } = await axios.post(`/api/admin/reviews/partner/${id}/reject`, {
        rejectionReason
      })
      console.log(data)
      setRejectLoading(false)
      router.push("/")
    } catch (error) {
      console.log(error)
      setRejectLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200'>
      {/* Sticky Header */}
      <div className='sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3 min-w-0'>
            <button
              onClick={() => router.back()}
              className='w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition shadow-xs cursor-pointer shrink-0'
            >
              <ArrowLeft size={16} />
            </button>

            <div className='min-w-0'>
              <div className='font-bold text-sm sm:text-base text-gray-900 truncate'>{data?.name}</div>
              <div className='text-[11px] text-gray-500 truncate'>{data?.email}</div>
            </div>
          </div>

          <div className='shrink-0'>
            {
              data?.partnerStatus === "approved" ? (
                <div className='px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200'>
                  <CheckCircle size={14} />
                  Approved
                </div>
              ) : data?.partnerStatus === "rejected" ? (
                <div className='px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-200'>
                  <XCircle size={13} />
                  Rejected
                </div>
              ) : (
                <div className='px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200'>
                  <Clock size={13} />
                  Pending Review
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-7 grid lg:grid-cols-3 gap-5 lg:gap-6'>
        
        {/* Left Column (Vehicle & Documents) */}
        <div className='lg:col-span-2 space-y-5'>
          
          {/* Vehicle Card */}
          <AnimatedCard title="Vehicle Information" icon={<Car size={16} />}>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
              <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                <span className='text-[11px] text-gray-500 flex items-center gap-1.5 font-medium'>
                  <Tag size={13} className='text-gray-400' /> Vehicle Type
                </span>
                <span className='font-bold text-sm text-gray-900 capitalize mt-1.5'>{vehicleDetail?.type || "-"}</span>
              </div>

              <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                <span className='text-[11px] text-gray-500 flex items-center gap-1.5 font-medium'>
                  <Hash size={13} className='text-gray-400' /> Registration No.
                </span>
                <span className='font-bold text-sm tracking-wide text-gray-900 uppercase mt-1.5'>{vehicleDetail?.number || "-"}</span>
              </div>

              <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                <span className='text-[11px] text-gray-500 flex items-center gap-1.5 font-medium'>
                  <Car size={13} className='text-gray-400' /> Model
                </span>
                <span className='font-bold text-sm text-gray-900 mt-1.5 truncate'>{vehicleDetail?.vehicleModel || "-"}</span>
              </div>
            </div>
          </AnimatedCard>

          {/* Documents Card */}
          <AnimatedCard title="Uploaded Documents" icon={<FileText size={16} />}>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1'>
              <DocPriview label={"Aadhaar Card"} url={partnerDocs?.aadharUrl} />
              <DocPriview label={"Registration (RC)"} url={partnerDocs?.rcUrl} />
              <DocPriview label={"Driving License"} url={partnerDocs?.licenseUrl} />
            </div>
          </AnimatedCard>
        </div>

        {/* Right Column (Bank Details & Action Bar) */}
        <div className='space-y-5'>
          
          {/* Bank Details Card */}
          <AnimatedCard title="Bank Account Details" icon={<Landmark size={16} />}>
            <div className='divide-y divide-gray-100 text-xs sm:text-sm pt-1'>
              <div className='py-2.5 flex justify-between items-center'>
                <span className='text-gray-500 flex items-center gap-1.5 font-medium'>
                  <User size={13} className='text-gray-400' /> Account Holder
                </span>
                <span className='font-semibold text-gray-900 truncate max-w-[55%] text-right'>
                  {partnerBank?.accountHolder || "-"}
                </span>
              </div>

              <div className='py-2.5 flex justify-between items-center'>
                <span className='text-gray-500 font-medium'>Account Number</span>
                <span className='font-semibold text-gray-900 font-mono tracking-wider'>
                  {partnerBank?.accountNumber || "-"}
                </span>
              </div>

              <div className='py-2.5 flex justify-between items-center'>
                <span className='text-gray-500 font-medium'>IFSC Code</span>
                <span className='font-semibold text-gray-900 font-mono uppercase'>
                  {partnerBank?.ifsc || "-"}
                </span>
              </div>

              <div className='py-2.5 flex justify-between items-center'>
                <span className='text-gray-500 font-medium'>UPI ID</span>
                <span className='font-semibold text-gray-900 truncate max-w-[55%] text-right text-purple-700'>
                  {partnerBank?.upi || "-"}
                </span>
              </div>
            </div>
          </AnimatedCard>

          {/* Admin Action Card */}
          {data?.partnerStatus === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4'
            >
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700'>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className='font-bold text-sm text-gray-900'>Admin Verification</h3>
                  <p className='text-[11px] text-gray-500'>Verify documents carefully before approving.</p>
                </div>
              </div>

              <div className='flex flex-col gap-2.5 pt-1'>
                <button
                  className='w-full py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5'
                  onClick={() => setShowApprove(true)}
                >
                  <CheckCircle size={15} /> Approve Partner
                </button>
                <button
                  className='w-full py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50/40 hover:bg-red-50 text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5'
                  onClick={() => setShowReject(true)}
                >
                  <XCircle size={15} /> Reject Partner
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* Approve Modal */}
        <AnimatePresence>
          {showApprove && (
            <motion.div
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApprove(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className='bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl border border-gray-100'
              >
                <h2 className='text-base font-bold text-gray-900'>Approve Partner</h2>
                <p className='text-xs text-gray-500 mt-1.5'>
                  Confirm all details, vehicle information, and KYC documents have been verified.
                </p>
                <div className='flex gap-2.5 mt-5'>
                  <button
                    className='flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer'
                    onClick={() => setShowApprove(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className='flex-1 flex items-center justify-center py-2 text-xs sm:text-sm font-semibold rounded-lg bg-black hover:bg-neutral-800 text-white transition cursor-pointer shadow-xs'
                    onClick={handleApprove}
                    disabled={approveLoading}
                  >
                    {approveLoading ? <CircleDashed size={16} className='text-white animate-spin' /> : "Yes, Approve"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reject Modal */}
        <AnimatePresence>
          {showReject && (
            <motion.div
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReject(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className='bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl border border-gray-100'
              >
                <h2 className='text-base font-bold text-gray-900'>Reject Partner</h2>
                <p className='text-xs text-gray-500 mt-1'>Please state the reason for rejecting this application:</p>
                <div className='mt-3'>
                  <textarea
                    placeholder='Enter clear rejection reason (required)'
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className='w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:border-black transition'
                    rows={3}
                  />
                </div>
                <div className='flex gap-2.5 mt-4'>
                  <button
                    className='flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer'
                    onClick={() => setShowReject(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className='flex-1 flex items-center justify-center py-2 text-xs sm:text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow-xs'
                    onClick={handleReject}
                    disabled={rejectLoading}
                  >
                    {rejectLoading ? <CircleDashed size={16} className='text-white animate-spin' /> : "Reject"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}

function Page() {
  return (
    <Suspense fallback={<div className='min-h-screen grid place-items-center text-gray-500 text-sm'>Loading...</div>}>
      <PartnerReviewContent />
    </Suspense>
  )
}

export default Page
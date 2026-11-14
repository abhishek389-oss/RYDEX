"use client"
import AnimatedCard from '@/components/AnimatedCard';
import { Iuser } from '@/models/user.model';
import { VehicleType } from '@/models/vehicle.model';
import axios from 'axios';
import { AlertCircle, ArrowLeft, CheckCircle, CircleDashed, Clock, ImageIcon, IndianRupee, ShieldCheck, Truck, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useParams, useRouter } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

interface IVehicle {
    owner: Iuser
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

function VehicleReviewContent() {
    const router = useRouter()
    const { id } = useParams()
    const [data, setData] = useState<IVehicle>();
    const [showApprove, setShowApprove] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approveLoading, setApproveLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setShowApprove(false)
        setShowReject(false)
        setRejectionReason("")
        if (!id) return
        const load = async () => {
            try {
                const result = await axios.get(`/api/admin/reviews/vehicle/${id}`)
                setData(result.data)
                console.log(result)
            } catch (error: any) {
                console.log(error.response?.data?.message ?? error)
            }
        }
        load()
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
            const { data } = await axios.get(`/api/admin/reviews/vehicle/${id}/approve`)
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
            const { data } = await axios.post(`/api/admin/reviews/vehicle/${id}/reject`, {
                reason: rejectionReason
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
                            <div className='font-bold text-sm sm:text-base text-gray-900 truncate'>{data?.owner?.name}</div>
                            <div className='text-[11px] text-gray-500 truncate'>{data?.owner?.email}</div>
                        </div>
                    </div>

                    <div className='shrink-0'>
                        {
                            data?.status === "approved" ? (
                                <div className='px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200'>
                                    <CheckCircle size={14} />
                                    Approved
                                </div>
                            ) : data?.status === "rejected" ? (
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

            <main className='max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-7 grid lg:grid-cols-3 gap-5 lg:gap-6'>
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white flex items-center justify-center'
                >
                    {data?.imageUrl ? (
                        <img src={data.imageUrl} alt='Vehicle' className='w-full h-72 sm:h-84 object-cover' />
                    ) : (
                        <div className='h-72 sm:h-84 w-full grid place-items-center text-gray-400 bg-gray-50'>
                            <div className='flex flex-col items-center gap-2'>
                                <ImageIcon size={28} />
                                <span className='text-xs'>No Image Uploaded</span>
                            </div>
                        </div>
                    )}
                </motion.div>

                <div className='lg:col-span-2 space-y-4 sm:space-y-5'>
                    <AnimatedCard title="Vehicle Details" icon={<Truck size={16} />}>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
                            <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                                <span className='text-[11px] text-gray-500 font-medium'>Vehicle Type</span>
                                <span className='font-bold text-sm text-gray-900 capitalize mt-1.5'>{data?.type || "-"}</span>
                            </div>

                            <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                                <span className='text-[11px] text-gray-500 font-medium'>Registration Number</span>
                                <span className='font-bold text-sm tracking-wide text-gray-900 uppercase mt-1.5'>{data?.number || "-"}</span>
                            </div>

                            <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                                <span className='text-[11px] text-gray-500 font-medium'>Model</span>
                                <span className='font-bold text-sm text-gray-900 mt-1.5 truncate'>{data?.vehicleModel || "-"}</span>
                            </div>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard title="Pricing Configuration" icon={<IndianRupee size={16} />}>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
                            <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                                <span className='text-[11px] text-gray-500 font-medium'>Base Fare</span>
                                <span className='font-bold text-sm text-gray-900 flex items-center mt-1.5'>
                                    <IndianRupee size={14} className='mr-0.5' />{data?.baseFare ?? 0}
                                </span>
                            </div>

                            <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                                <span className='text-[11px] text-gray-500 font-medium'>Price per KM</span>
                                <span className='font-bold text-sm text-gray-900 flex items-center mt-1.5'>
                                    <IndianRupee size={14} className='mr-0.5' />{data?.pricePerKM ?? 0}
                                </span>
                            </div>

                            <div className='bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 flex flex-col justify-between'>
                                <span className='text-[11px] text-gray-500 font-medium'>Waiting Charge</span>
                                <span className='font-bold text-sm text-gray-900 flex items-center mt-1.5'>
                                    <IndianRupee size={14} className='mr-0.5' />{data?.waitingCharge ?? "-"}
                                </span>
                            </div>
                        </div>
                    </AnimatedCard>

                    {data?.status === "pending" && (
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
                                    <p className='text-[11px] text-gray-500'>Verify pricing and vehicle image carefully before approving.</p>
                                </div>
                            </div>

                            {data?.rejectionReason && (
                                <div className='bg-red-50 border border-red-200 rounded-xl p-3 space-y-1'>
                                    <div className='flex items-center gap-1.5 text-red-700 font-semibold text-xs'>
                                        <AlertCircle size={14} />
                                        Last Rejection Reason
                                    </div>
                                    <p className='text-xs text-red-600 leading-relaxed'>
                                        {data.rejectionReason}
                                    </p>
                                </div>
                            )}

                            <div className='flex flex-col sm:flex-row gap-2.5 pt-1'>
                                <button
                                    className='flex-1 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5'
                                    onClick={() => setShowApprove(true)}
                                >
                                    <CheckCircle size={15} /> Approve Vehicle
                                </button>
                                <button
                                    className='flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50/40 hover:bg-red-50 text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5'
                                    onClick={() => setShowReject(true)}
                                >
                                    <XCircle size={15} /> Reject Vehicle
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {showApprove && (
                    <motion.div
                        onClick={() => setShowApprove(false)}
                        className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className='bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl border border-gray-100'
                        >
                            <h2 className='text-base font-bold text-gray-900'>Approve Vehicle</h2>
                            <p className='text-xs text-gray-500 mt-1.5'>Confirm all vehicle pricing and image details have been verified.</p>
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

            <AnimatePresence>
                {showReject && (
                    <motion.div
                        onClick={() => setShowReject(false)}
                        className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className='bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl border border-gray-100'
                        >
                            <h2 className='text-base font-bold text-gray-900'>Reject Vehicle</h2>
                            <div className='mt-2'>
                                <textarea
                                    placeholder='Enter rejection reason (required)'
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
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center text-gray-500 text-sm">Loading...</div>}>
            <VehicleReviewContent />
        </Suspense>
    )
}
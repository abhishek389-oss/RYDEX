"use client"
import { useAppSelector } from '@/redux/hooks'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Clock, Lock, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RejectionCard from './RejectionCard'
import StatusCard from './StatusCard'
import ActionCard from './ActionCard'
import axios from 'axios'
import PricingModal from './PricingModal'
import { IVehicle } from '@/models/vehicle.model'
import PartnerEarning from './PartnerEarning'

type Step = {
    id: number,
    title: string
    route?: string
}

const STEPS: Step[] = [
    { id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
    { id: 2, title: "Documents", route: "/partner/onboarding/documents" },
    { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
    { id: 4, title: "Review" },
    { id: 5, title: "Video KYC" },
    { id: 6, title: "Pricing" },
    { id: 7, title: "Final Review" },
    { id: 8, title: "Live" }
]

const TOTAL_STEPS = STEPS.length

function PartnerDashboard() {
    const router = useRouter()
    const { userData } = useAppSelector((state) => state.user)
    const [activeStep, setActiveStep] = useState(0)
    const [requestLoading, setRequestLoading] = useState(false)
    const [showPricing, setShowPricing] = useState(false);
    const [vehicleData, setVehicleData] = useState<IVehicle | null>(null);

    useEffect(() => {
        if (userData) {
            setActiveStep((userData.partnerOnBoardingSteps ?? 0) + 1)
        }
    }, [userData])

    const handleGetPricing = async () => {
        try {
            const { data } = await axios.get("/api/partner/onboarding/pricing")
            console.log(data)
            setVehicleData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        handleGetPricing()
    }, [])

    const goToStep = (step: Step) => {

        if (step.id == 6 && userData?.partnerStatus === "approved" && userData.videoKycStatus === "approved") {
            setShowPricing(true)
            return
        }

        if (step.route && step.id <= activeStep) {
            router.push(step.route)
        }
    }

    const progressPercentage = Math.max(0, Math.min(100, ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100))

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-20 pb-10'>
            <div className='max-w-4xl mx-auto space-y-5 sm:space-y-6'>
                <div>
                    <h1 className='text-lg sm:text-xl font-bold text-gray-900'>Partner Onboarding</h1>
                    <p className='text-gray-500 text-xs mt-0.5'>Complete all steps to activate your account</p>
                </div>

                <div className='bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
                    <div className='relative w-full min-w-115 px-4'>
                        <div className='absolute top-4 -translate-y-1/2 left-7 right-7 h-0.5 bg-gray-200 rounded-full z-0' />

                        <div className='absolute top-4 -translate-y-1/2 left-7 right-7 h-0.5 overflow-hidden z-0'>
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.6 }}
                                className='h-full bg-black rounded-full'
                            />
                        </div>

                        <div className='relative flex justify-between items-start z-10'>
                            {STEPS.map((s) => {
                                const completed = s.id < activeStep
                                const active = s.id == activeStep
                                const locked = s.id > activeStep

                                return (
                                    <motion.div
                                        key={s.id}
                                        whileHover={!locked ? { scale: 1.05 } : {}}
                                        onClick={() => goToStep(s)}
                                        className='flex flex-col items-center cursor-pointer w-14'
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs font-semibold
                                            ${completed ? "bg-black text-white border-black"
                                                : active
                                                    ? "border-black bg-white text-black font-bold shadow-xs"
                                                    : "border-gray-300 text-gray-400 bg-white"
                                            }`}>

                                            {
                                                completed ? (
                                                    <Check size={14} />
                                                ) : locked ? (
                                                    <Lock size={12} />
                                                ) : (
                                                    s.id
                                                )
                                            }

                                        </div>

                                        <span className={`text-[10px] mt-1.5 font-medium text-center whitespace-nowrap ${active ? "text-black font-semibold" : completed ? "text-gray-700" : "text-gray-400"
                                            }`}>
                                            {s.title}
                                        </span>

                                    </motion.div>
                                )
                            })}
                        </div>

                    </div>
                </div>

                {
                    activeStep == 4 && userData?.partnerStatus === "rejected" && (
                        <RejectionCard
                            title="Partner Rejected"
                            reason={userData.rejectionReason}
                            actionLabel={`Review and Update`}
                            onAction={() => router.push("/partner/onboarding/vehicle")}
                        />
                    )
                }
                {
                    activeStep == 4 && userData?.partnerStatus === "pending" && (
                        <StatusCard
                            icon={<Clock size={16} />}
                            title={"Documents under Review"}
                            desc={"Admin is Verifying your Documents."}
                        />
                    )
                }

                {
                    activeStep == 5 && (
                        userData?.videoKycStatus === "approved" ? (
                            <StatusCard
                                icon={<Check size={16} />}
                                title="Video kyc approved"
                                desc="You can now proceed to Pricing."
                            />
                        ) : userData?.videoKycStatus === "rejected" ? (
                            <RejectionCard
                                title="Video kyc rejected"
                                reason={userData?.videoKycRejectionReason}
                                actionLabel={requestLoading ? "Requesting..." : "Request Again"}
                                onAction={async () => {
                                    try {
                                        setRequestLoading(true)
                                        await axios.get("/api/partner/video-kyc/request")
                                    } catch (error) {
                                        console.log(error)
                                    } finally {
                                        setRequestLoading(false)
                                    }
                                }}
                            />
                        ) : userData?.videoKycStatus === "in_progress" && userData?.videoKycRoomId ? (
                            <ActionCard
                                icon={<Video size={16} />}
                                title="Admin Started Video KYC"
                                button={
                                    <span className="flex items-center gap-1.5">
                                        Join Call <ArrowRight size={14} />
                                    </span>
                                }
                                onclick={
                                    () => router.push(`/video-kyc/${userData.videoKycRoomId}`)
                                }
                            />
                        ) : (
                            <StatusCard
                                icon={<Clock size={16} />}
                                title="Waiting for Admin"
                                desc="Admin will initiate Video KYC shortly."
                            />
                        )
                    )
                }

                {activeStep == 7 && ((vehicleData as any)?.vehicle?.status === "pending" || vehicleData?.status == "pending") && (
                    <StatusCard
                        icon={<Clock size={16} />}
                        title="Pricing Under Review"
                        desc="Admin is reviewing your pricing."
                    />

                )}

                {activeStep == 7 && ((vehicleData as any)?.vehicle?.status === "rejected" || vehicleData?.status == "pending") && (
                    <RejectionCard
                        title="Pricing Rejected"
                        reason={(vehicleData as any)?.vehicle?.rejectionReason}
                        actionLabel="Edit & Resubmit"
                        onAction={() => setShowPricing(true)}
                    />

                )}
                {activeStep == 8 && ((vehicleData as any)?.vehicle?.status === "approved" || vehicleData?.status === "approved") && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-black text-white rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'
                    >
                        <div className='space-y-1'>
                            <h2 className='text-base sm:text-lg font-bold flex items-center gap-2'>
                                🚀 You're Live
                            </h2>
                            <p className='text-xs text-gray-400'>
                                Your onboarding is complete. You can now start accepting ride requests.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/partner/bookings")}
                            className='w-full sm:w-auto bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0'
                        >
                            Go to Bookings <ArrowRight size={14} />
                        </button>
                    </motion.div>
                )}

                <PartnerEarning />

            </div>

            <PricingModal
                open={showPricing}
                onClose={() => setShowPricing(false)}
                data={vehicleData}
            />

        </div>
    )
}

export default PartnerDashboard
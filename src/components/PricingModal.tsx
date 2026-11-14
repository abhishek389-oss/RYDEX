"use client"
import { IVehicle } from '@/models/vehicle.model'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setUser } from '@/redux/userSlice'
import axios from 'axios'
import { ImagePlus, IndianRupee, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type PropsType = {
    open: boolean,
    onClose: () => void,
    data: IVehicle | null,
    onSuccess?: (vehicle: any) => void
}

function PricingModal({ open, onClose, data, onSuccess }: PropsType) {

    const router = useRouter()
    const dispatch = useAppDispatch()
    const { userData } = useAppSelector((state) => state.user)

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [baseFare, setBaseFare] = useState("");
    const [pricePerKM, setPricePerKM] = useState("");
    const [waitingCharge, setWaitingCharge] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data) {
            const v: any = (data as any)?.vehicle || data

            setPreview(v?.imageUrl || null)
            setBaseFare(v?.baseFare !== undefined && v?.baseFare !== null ? v.baseFare.toString() : "")
            setPricePerKM(v?.pricePerKM !== undefined && v?.pricePerKM !== null ? v.pricePerKM.toString() : "")
            setWaitingCharge(v?.waitingCharge !== undefined && v?.waitingCharge !== null ? v.waitingCharge.toString() : "")
        }
    }, [data])

    const hasImage = Boolean(image || preview)
    const isBaseFareValid = baseFare.trim() !== "" && !isNaN(Number(baseFare)) && Number(baseFare) >= 0
    const isPricePerKMValid = pricePerKM.trim() !== "" && !isNaN(Number(pricePerKM)) && Number(pricePerKM) > 0
    const isWaitingChargeValid = waitingCharge.trim() !== "" && !isNaN(Number(waitingCharge)) && Number(waitingCharge) >= 0

    const canSubmit = hasImage && isBaseFareValid && isPricePerKMValid && isWaitingChargeValid

    const handleSubmit = async () => {
        if (!canSubmit || loading) return

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("baseFare", baseFare)
            formData.append("waitingCharge", waitingCharge)
            formData.append("pricePerKM", pricePerKM)
            if (image) {
                formData.append("image", image)
            }

            const res = await axios.post("/api/partner/onboarding/pricing", formData)
            if (res.data?.user) {
                dispatch(setUser(res.data.user))
            } else if (userData) {
                dispatch(setUser({
                    ...userData,
                    partnerOnBoardingSteps: 6
                }))
            }
            if (onSuccess && res.data?.vehicle) {
                onSuccess(res.data.vehicle)
            }
            setLoading(false)
            onClose()
        } catch (error: any) {
            console.log(error.response?.data?.message ?? error)
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className='bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]'
                    >
                        <div className='px-5 py-3.5 border-b flex items-center justify-between bg-white shrink-0'>
                            <div>
                                <h2 className='text-sm sm:text-base font-bold text-gray-900'>Pricing & Vehicle Image</h2>
                                <p className='text-[11px] text-gray-500'>Update vehicle photo and tariff rates</p>
                            </div>
                            <button
                                onClick={onClose}
                                className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer'
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className='p-4 sm:p-5 space-y-3.5 overflow-y-auto'>
                            <div>
                                <label
                                    htmlFor='imageLabel'
                                    className='relative h-40 sm:h-44 w-full border-2 border-dashed border-gray-300 hover:border-gray-900 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 transition group'
                                >
                                    {!preview ? (
                                        <div className='flex flex-col items-center gap-1.5 text-gray-400 group-hover:text-gray-600 transition p-4 text-center'>
                                            <div className='w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs'>
                                                <ImagePlus size={20} className='text-gray-600' />
                                            </div>
                                            <span className='text-xs font-semibold text-gray-700'>Upload Vehicle Image</span>
                                            <span className='text-[10px] text-gray-400'>PNG, JPG or WEBP (Clear front/side view)</span>
                                        </div>
                                    ) : (
                                        <div className='relative w-full h-full bg-neutral-900/95 flex items-center justify-center'>
                                            <img
                                                src={preview}
                                                alt="Vehicle preview"
                                                className='w-full h-full object-contain p-1.5'
                                            />
                                            <div className='absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black text-white text-[10px] font-medium px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-sm transition'>
                                                <ImagePlus size={12} /> Change Photo
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        id='imageLabel'
                                        type="file"
                                        accept='image/*'
                                        hidden
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setImage(e.target.files[0])
                                                setPreview(URL.createObjectURL(e.target.files[0]))
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div>
                                <p className='text-xs font-semibold text-gray-700 mb-1'>Base Fare</p>
                                <div className='flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition shadow-2xs'>
                                    <IndianRupee size={15} className='text-gray-500 shrink-0' />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder='Base Fare'
                                        value={baseFare}
                                        onChange={(e) => setBaseFare(e.target.value)}
                                        className='w-full outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 font-medium'
                                    />
                                </div>
                            </div>

                            <div>
                                <p className='text-xs font-semibold text-gray-700 mb-1'>Price per KM</p>
                                <div className='flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition shadow-2xs'>
                                    <IndianRupee size={15} className='text-gray-500 shrink-0' />
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder='Price Per Km'
                                        value={pricePerKM}
                                        onChange={(e) => setPricePerKM(e.target.value)}
                                        className='w-full outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 font-medium'
                                    />
                                </div>
                            </div>

                            <div>
                                <p className='text-xs font-semibold text-gray-700 mb-1'>Waiting Charge</p>
                                <div className='flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition shadow-2xs'>
                                    <IndianRupee size={15} className='text-gray-500 shrink-0' />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder='Waiting Charge'
                                        value={waitingCharge}
                                        onChange={(e) => setWaitingCharge(e.target.value)}
                                        className='w-full outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 font-medium'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='px-5 py-3 border-t bg-gray-50/80 flex gap-2.5 shrink-0'>
                            <button
                                className='flex-1 border border-gray-200 rounded-xl py-2 text-xs sm:text-sm font-medium hover:bg-gray-100 transition cursor-pointer text-gray-700'
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit || loading}
                                className='flex-1 bg-black hover:bg-neutral-800 text-white rounded-xl py-2 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed'
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default PricingModal
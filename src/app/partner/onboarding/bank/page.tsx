"use client"
import Nav from "@/components/Nav"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setUser } from "@/redux/userSlice"
import axios from "axios"
import { ArrowLeft, BadgeCheck, CheckCircle, CircleDashed, CreditCard, Landmark, Phone } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/

function page() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { userData } = useAppSelector((state) => state.user)
    const [accountHolder, setAccountHolder] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [upi, setUpi] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sanitizedIfsc = ifsc.trim().toUpperCase()

    const isNameValid = accountHolder.trim().length >= 3
    const isAccountValid = accountNumber.trim().length >= 9
    const isIfscValid = IFSC_REGEX.test(sanitizedIfsc)
    const isMobileValid = mobileNumber.trim().length == 10

    const canSubmit = isNameValid && isAccountValid && isIfscValid && isMobileValid

    const handleBank = async () => {
        setLoading(true)
        setError("")
        try {
            const { data } = await axios.post("/api/partner/onboarding/bank", {
                accountHolder,
                accountNumber,
                ifsc: sanitizedIfsc,
                upi,
                mobileNumber
            })
            if (userData && data?.user) {
                dispatch(setUser({
                    ...userData,
                    partnerOnBoardingSteps: data.user.partnerOnBoardingSteps,
                    partnerStatus: data.user.partnerStatus || userData.partnerStatus
                }))
            }
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
        const handleGetBank = async () => {
            try {
                const { data } = await axios.get("/api/partner/onboarding/bank")
                console.log(data)
                setAccountHolder(data.partnerBank.accountHolder)
                setAccountNumber(data.partnerBank.accountNumber)
                setIfsc(data.partnerBank.ifsc)
                setMobileNumber(data.mobileNumber)
                setUpi(data.partnerBank.upi)
            } catch (error: any) {
                console.log(error)
            }
        }
        handleGetBank()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-start px-4 pt-24 pb-12">
            <Nav/>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full sm:max-w-110 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-4 sm:p-6"
            >
                <div className="relative text-center">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-0 top-0 w-7 h-7 rounded-full border border-gray-200
                           flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
                    ><ArrowLeft size={14} /></button>

                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        Step 3 of 3
                    </p>
                    <h1 className="text-lg sm:text-xl font-bold mt-0.5 text-gray-900">
                        Bank & Payout Setup
                    </h1>
                    <p className="text-[11px] text-gray-500">
                        Used for partner payouts
                    </p>
                </div>

                <div className="mt-4 space-y-5.5">
                    <div>
                        <label htmlFor="ahn" className="text-[11px] font-semibold text-gray-500">Account holder name</label>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-gray-400 shrink-0"><BadgeCheck size={15} /></div>
                            <input
                                type="text"
                                placeholder="As per bank records" id="ahn"
                                className={`flex-1 border-b pb-1 text-xs focus:outline-none transition
                                    ${!isNameValid && accountHolder.length > 0 ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}
                            />
                        </div>
                        {!isNameValid && accountHolder.length > 0 && <p className="mt-0.5 text-[10px] text-red-500">Minimum 3 characters required</p>}
                    </div>

                    <div>
                        <label htmlFor="ban" className="text-[11px] font-semibold text-gray-500">Bank account number</label>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-gray-400 shrink-0"><CreditCard size={15} /></div>
                            <input type="text" placeholder="Enter account number" id="ban"
                                className={`flex-1 border-b pb-1 text-xs focus:outline-none transition
                                    ${!isAccountValid && accountNumber.length > 0 ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>
                        {!isAccountValid && accountNumber.length > 0 && <p className="mt-0.5 text-[10px] text-red-500">Account number must be at least 9 digits</p>}
                    </div>

                    <div>
                        <label htmlFor="ifc" className="text-[11px] font-semibold text-gray-500">IFSC code</label>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-gray-400 shrink-0"><Landmark size={15} /></div>
                            <input type="text" placeholder="HDFC0001234" id="ifc"
                                className={`flex-1 border-b pb-1 text-xs focus:outline-none transition
                                    ${!isIfscValid && ifsc.length > 0 ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                                value={ifsc.toUpperCase()}
                                onChange={(e) => setIfsc(e.target.value)}
                            />
                        </div>
                        {!isIfscValid && ifsc.length > 0 && <p className="mt-0.5 text-[10px] text-red-500">Invalid IFSC code</p>}
                    </div>

                    <div>
                        <label htmlFor="mn" className="text-[11px] font-semibold text-gray-500">Mobile number</label>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-gray-400 shrink-0"><Phone size={15} /></div>
                            <input type="text" placeholder="10 digit mobile number" id="mn"
                                className={`flex-1 border-b pb-1 text-xs focus:outline-none transition
                                    ${!isMobileValid && mobileNumber.length > 0 ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                            />
                        </div>
                        {!isMobileValid && mobileNumber.length > 0 && <p className="mt-0.5 text-[10px] text-red-500">Enter 10-digits mobile number</p>}
                    </div>

                    <div>
                        <label htmlFor="uid" className="text-[11px] font-semibold text-gray-500">UPI ID (optional)</label>
                        <div className="flex items-center gap-2 mt-0.5">
                            <input type="text" placeholder="name@upi" id="uid"
                                className="flex-1 border-b pb-1 text-xs focus:outline-none border-gray-300 focus:border-black transition"
                                value={upi}
                                onChange={(e) => setUpi(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {error &&
                    <p className="text-red-500 text-xs mt-2.5">*{error}</p>
                }

                <div className="mt-3.5 flex items-start gap-2 text-[11px] text-gray-500">
                    <CheckCircle size={14} className="mt-0.5 text-gray-400 shrink-0" />
                    <p className="leading-tight">Bank details are verified before first payout (takes 24-48 hours).</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBank}
                    disabled={!canSubmit || loading}
                    className="mt-4 w-full h-10 sm:h-10.5 rounded-xl flex items-center justify-center bg-black text-white text-xs font-semibold disabled:opacity-40 transition cursor-pointer shadow-xs"
                >
                    {loading ? <CircleDashed size={15} className="text-white animate-spin" /> : "Continue"}
                </motion.button>
            </motion.div>
        </div>
    )
}

export default page
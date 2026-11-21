"use client"
import Nav from "@/components/Nav"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setUser } from "@/redux/userSlice"
import axios from "axios"
import { ArrowLeft, AtSign, BadgeCheck, Building2, CheckCircle2, CircleDashed, CreditCard, Eye, EyeOff, Landmark, Loader2, Phone, ShieldCheck } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/

function page() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { userData } = useAppSelector((state) => state.user)
    const [accountHolder, setAccountHolder] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [confirmAccountNumber, setConfirmAccountNumber] = useState("")
    const [showAccount, setShowAccount] = useState(false)
    const [ifsc, setIfsc] = useState("")
    const [bankInfo, setBankInfo] = useState<{ bank: string; branch: string } | null>(null)
    const [ifscChecking, setIfscChecking] = useState(false)
    const [ifscNotFound, setIfscNotFound] = useState(false)
    const [upi, setUpi] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const sanitizedIfsc = ifsc.trim().toUpperCase()
    const sanitizedUpi = upi.trim()

    const isNameValid = accountHolder.trim().length >= 3
    const isAccountValid = accountNumber.trim().length >= 9 && accountNumber.trim().length <= 18
    const isAccountMatched = isAccountValid && accountNumber === confirmAccountNumber
    const isIfscValid = IFSC_REGEX.test(sanitizedIfsc)
    const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber.trim())
    const isUpiValid = sanitizedUpi.length === 0 || UPI_REGEX.test(sanitizedUpi)

    const canSubmit = isNameValid && isAccountMatched && isIfscValid && !ifscNotFound && isMobileValid && isUpiValid

    useEffect(() => {
        if (!isIfscValid) {
            setBankInfo(null)
            setIfscNotFound(false)
            return
        }

        let cancelled = false
        const fetchIfscDetails = async () => {
            setIfscChecking(true)
            setIfscNotFound(false)
            try {
                const { data } = await axios.get(`https://ifsc.razorpay.com/${sanitizedIfsc}`)
                if (!cancelled && data?.BANK) {
                    setBankInfo({
                        bank: data.BANK,
                        branch: data.BRANCH || data.CITY || ""
                    })
                }
            } catch {
                if (!cancelled) {
                    setBankInfo(null)
                    setIfscNotFound(true)
                }
            } finally {
                if (!cancelled) setIfscChecking(false)
            }
        }

        fetchIfscDetails()
        return () => {
            cancelled = true
        }
    }, [sanitizedIfsc, isIfscValid])

    const handleBank = async () => {
        if (!canSubmit || loading) return
        setLoading(true)
        setError("")
        try {
            const { data } = await axios.post("/api/partner/onboarding/bank", {
                accountHolder: accountHolder.trim(),
                accountNumber: accountNumber.trim(),
                ifsc: sanitizedIfsc,
                upi: sanitizedUpi,
                mobileNumber: mobileNumber.trim()
            })
            if (userData && data?.user) {
                dispatch(setUser({
                    ...userData,
                    partnerOnBoardingSteps: data.user.partnerOnBoardingSteps,
                    partnerStatus: data.user.partnerStatus || userData.partnerStatus
                }))
            }
            setLoading(false)
            router.push("/")
        } catch (error: any) {
            setError(error?.response?.data?.message ?? "Something went wrong")
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleGetBank = async () => {
            try {
                const { data } = await axios.get("/api/partner/onboarding/bank")
                if (data?.partnerBank) {
                    setAccountHolder(data.partnerBank.accountHolder || "")
                    const savedAcc = data.partnerBank.accountNumber || ""
                    setAccountNumber(savedAcc)
                    setConfirmAccountNumber(savedAcc)
                    setIfsc(data.partnerBank.ifsc || "")
                    setUpi(data.partnerBank.upi || "")
                }
                if (data?.mobileNumber) {
                    setMobileNumber(data.mobileNumber)
                }
            } catch (error: any) {
                console.log(error)
            }
        }
        handleGetBank()
    }, [])

    return (
        <div className="min-h-dvh bg-zinc-100 flex flex-col items-center justify-start px-4 pt-24 pb-12 text-zinc-900">
            <Nav />
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full sm:max-w-md bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden"
            >
                <div className="h-1 bg-zinc-900 w-full" />

                <div className="p-5 sm:p-6">
                    <div className="relative text-center">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="absolute left-0 top-0 w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition cursor-pointer"
                        >
                            <ArrowLeft size={14} />
                        </button>

                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                            Step 3 of 3
                        </p>
                        <h1 className="text-xl font-black mt-0.5 text-zinc-900 tracking-tight">
                            Bank & Payout Setup
                        </h1>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Used directly for your ride earnings settlement
                        </p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="ahn" className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                                Account Holder Name
                            </label>
                            <div className={`flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-xl border bg-zinc-50/70 focus-within:bg-white transition ${
                                !isNameValid && accountHolder.length > 0
                                    ? "border-rose-300 focus-within:border-rose-500"
                                    : "border-zinc-200 focus-within:border-zinc-900"
                            }`}>
                                <BadgeCheck size={16} className="text-zinc-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="As per bank passbook"
                                    id="ahn"
                                    className="flex-1 bg-transparent text-base sm:text-xs font-medium text-zinc-900 focus:outline-none"
                                    value={accountHolder}
                                    onChange={(e) => setAccountHolder(e.target.value)}
                                />
                            </div>
                            {!isNameValid && accountHolder.length > 0 && (
                                <p className="mt-1 text-[10px] font-medium text-rose-500">Minimum 3 characters required</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="ban" className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                                Bank Account Number
                            </label>
                            <div className={`flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-xl border bg-zinc-50/70 focus-within:bg-white transition ${
                                !isAccountValid && accountNumber.length > 0
                                    ? "border-rose-300 focus-within:border-rose-500"
                                    : "border-zinc-200 focus-within:border-zinc-900"
                            }`}>
                                <CreditCard size={16} className="text-zinc-400 shrink-0" />
                                <input
                                    type={showAccount ? "text" : "password"}
                                    inputMode="numeric"
                                    maxLength={18}
                                    placeholder="Enter 9-18 digit account number"
                                    id="ban"
                                    className="flex-1 bg-transparent text-base sm:text-xs font-mono font-medium text-zinc-900 focus:outline-none"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAccount(!showAccount)}
                                    className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                >
                                    {showAccount ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {!isAccountValid && accountNumber.length > 0 && (
                                <p className="mt-1 text-[10px] font-medium text-rose-500">Account number must be 9 to 18 digits</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="cban" className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                                Confirm Account Number
                            </label>
                            <div className={`flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-xl border bg-zinc-50/70 focus-within:bg-white transition ${
                                confirmAccountNumber.length > 0 && !isAccountMatched
                                    ? "border-rose-300 focus-within:border-rose-500"
                                    : isAccountMatched
                                        ? "border-emerald-300 bg-emerald-50/20"
                                        : "border-zinc-200 focus-within:border-zinc-900"
                            }`}>
                                <CreditCard size={16} className="text-zinc-400 shrink-0" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={18}
                                    onPaste={(e) => e.preventDefault()}
                                    placeholder="Re-enter account number"
                                    id="cban"
                                    className="flex-1 bg-transparent text-base sm:text-xs font-mono font-medium text-zinc-900 focus:outline-none"
                                    value={confirmAccountNumber}
                                    onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ""))}
                                />
                                {isAccountMatched && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
                            </div>
                            {confirmAccountNumber.length > 0 && !isAccountMatched && (
                                <p className="mt-1 text-[10px] font-medium text-rose-500">Account numbers do not match</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="ifc" className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                                IFSC Code
                            </label>
                            <div className={`flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-xl border bg-zinc-50/70 focus-within:bg-white transition ${
                                (!isIfscValid && ifsc.length > 0) || ifscNotFound
                                    ? "border-rose-300 focus-within:border-rose-500"
                                    : bankInfo
                                        ? "border-emerald-300 bg-emerald-50/20"
                                        : "border-zinc-200 focus-within:border-zinc-900"
                            }`}>
                                <Landmark size={16} className="text-zinc-400 shrink-0" />
                                <input
                                    type="text"
                                    maxLength={11}
                                    placeholder="e.g. SBIN0001234"
                                    id="ifc"
                                    className="flex-1 bg-transparent text-base sm:text-xs font-mono uppercase font-semibold text-zinc-900 focus:outline-none"
                                    value={sanitizedIfsc}
                                    onChange={(e) => setIfsc(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                                />
                                {ifscChecking && <Loader2 size={14} className="animate-spin text-zinc-400 shrink-0" />}
                                {bankInfo && !ifscChecking && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
                            </div>

                            {!isIfscValid && ifsc.length > 0 && (
                                <p className="mt-1 text-[10px] font-medium text-rose-500">Enter valid 11-character IFSC (5th character must be 0)</p>
                            )}
                            {ifscNotFound && (
                                <p className="mt-1 text-[10px] font-medium text-rose-500">IFSC code not found in bank directory</p>
                            )}
                            {bankInfo && (
                                <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800">
                                    <Building2 size={12} className="shrink-0 text-emerald-600" />
                                    <span className="text-[11px] font-semibold truncate">
                                        {bankInfo.bank}{bankInfo.branch ? ` • ${bankInfo.branch}` : ""}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="mn" className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                                Registered Mobile Number
                            </label>
                            <div className={`flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-xl border bg-zinc-50/70 focus-within:bg-white transition ${
                                !isMobileValid && mobileNumber.length > 0
                                    ? "border-rose-300 focus-within:border-rose-500"
                                    : "border-zinc-200 focus-within:border-zinc-900"
                            }`}>
                                <Phone size={16} className="text-zinc-400 shrink-0" />
                                <span className="text-xs font-bold text-zinc-400">+91</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="10 digit mobile number"
                                    id="mn"
                                    className="flex-1 bg-transparent text-base sm:text-xs font-medium text-zinc-900 focus:outline-none"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                                />
                            </div>
                            {!isMobileValid && mobileNumber.length > 0 && (
                                <p className="mt-1 text-[10px] font-medium text-rose-500">Enter valid 10-digit Indian mobile number</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="uid" className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                                UPI ID <span className="text-zinc-400 font-medium normal-case">(Optional)</span>
                            </label>
                            <div className={`flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-xl border bg-zinc-50/70 focus-within:bg-white transition ${
                                !isUpiValid
                                    ? "border-rose-300 focus-within:border-rose-500"
                                    : "border-zinc-200 focus-within:border-zinc-900"
                            }`}>
                                <AtSign size={16} className="text-zinc-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="yourname@upi"
                                    id="uid"
                                    className="flex-1 bg-transparent text-base sm:text-xs font-medium text-zinc-900 focus:outline-none"
                                    value={upi}
                                    onChange={(e) => setUpi(e.target.value)}
                                />
                            </div>
                            {!isUpiValid && (
                                <p className="mt-1 text-[10px] font-medium text-rose-500">Enter valid UPI ID (e.g. name@okaxis)</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <p className="text-rose-600 text-xs font-semibold mt-3 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                            {error}
                        </p>
                    )}

                    <div className="mt-4 flex items-start gap-2 bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-[11px] text-zinc-600">
                        <ShieldCheck size={15} className="mt-0.5 text-zinc-900 shrink-0" />
                        <p className="leading-snug">
                            Your bank details are encrypted and verified within 24–48 hours before your first payout.
                        </p>
                    </div>

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBank}
                        disabled={!canSubmit || loading}
                        className="mt-5 w-full h-11 rounded-xl flex items-center justify-center bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-bold disabled:opacity-40 transition cursor-pointer shadow-xs"
                    >
                        {loading ? <CircleDashed size={16} className="text-white animate-spin" /> : "Save & Continue"}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}

export default page
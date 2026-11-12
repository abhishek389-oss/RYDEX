"use client"
import Nav from "@/components/Nav"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setUser } from "@/redux/userSlice"
import axios from "axios"
import { ArrowLeft, CircleDashed, FileCheck, UploadCloud } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type docsType = "aadhar" | "license" | "rc"

function page() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter()
    const dispatch = useAppDispatch()
    const { userData } = useAppSelector((state) => state.user)
    const [docs, setDocs] = useState<Record<docsType, File | null>>({
        aadhar: null,
        license: null,
        rc: null
    });

    const handleImage = (doc: docsType, file: File | null) => {
        if (!file) {
            return
        }
        setDocs((prev) => ({
            ...prev,
            [doc]: file
        }))
    }

    const handledocs = async () => {
        setError("")
        setLoading(true)
        try {
            const formData = new FormData()
            if (!docs.aadhar || !docs.license || !docs.rc) {
                setError("All documents are required")
                setLoading(false)
                return null
            }
            formData.append("aadhar", docs.aadhar)
            formData.append("license", docs.license)
            formData.append("rc", docs.rc)

            const { data } = await axios.post("/api/partner/onboarding/documents", formData)
            if (userData && data?.user) {
                dispatch(setUser({
                    ...userData,
                    partnerOnBoardingSteps: data.user.partnerOnBoardingSteps,
                    partnerStatus: data.user.partnerStatus || userData.partnerStatus
                }))
            }
            console.log(data)
            setLoading(false)
            if ((userData?.partnerOnBoardingSteps ?? 0) >= 3) {
                router.push("/")
            } else {
                router.push("/")
            }
        } catch (error: any) {
            console.log(error)
            setError(error?.response?.data?.message ?? "Something went wrong")
            setLoading(false)
        }
    }

    const canSubmit = docs.aadhar && docs.license && docs.rc

    return (
        <div className='min-h-screen bg-gray-50/50 flex flex-col items-center justify-start px-4 pt-24 pb-12'>
            <Nav/>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full sm:max-w-115 bg-white rounded-3xl border border-gray-200/80 shadow-[0_12px_35px_rgba(0,0,0,0.05)] p-6 sm:p-7"
            >
                <div className="relative text-center">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-0 top-0 w-8 h-8 rounded-full border border-gray-200
                           flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
                    ><ArrowLeft size={15} /></button>

                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                        Step 2 of 3
                    </p>
                    <h1 className="text-xl font-bold mt-1 text-gray-900">
                        Upload Documents
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Required for verification
                    </p>
                </div>

                <div className="mt-6 space-y-3">
                    <motion.label
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-gray-200
                                   cursor-pointer hover:border-black transition bg-white"
                    >
                        <div className="pr-2">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">ID Proof / Document</p>
                            <p className="text-[11px] text-gray-500 truncate max-w-42.5 sm:max-w-55">
                                {docs.aadhar ? docs.aadhar.name : "Government issued id"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs ${docs.aadhar ? "text-green-600 font-semibold" : "text-gray-400 font-medium"}`}>
                                {docs.aadhar ? "Change" : "Upload"}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                                <UploadCloud size={15} />
                            </div>
                        </div>

                        <input
                            type="file"
                            hidden
                            accept="image/*,.pdf"
                            onChange={(e) => handleImage("aadhar", e.target?.files?.[0] || null)}
                        />
                    </motion.label>

                    <motion.label
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-gray-200
                                   cursor-pointer hover:border-black transition bg-white"
                    >
                        <div className="pr-2">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">Driving License</p>
                            <p className="text-[11px] text-gray-500 truncate max-w-42.5 sm:max-w-55">
                                {docs.license ? docs.license.name : "Valid driving license"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs ${docs.license ? "text-green-600 font-semibold" : "text-gray-400 font-medium"}`}>
                                {docs.license ? "Change" : "Upload"}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                                <UploadCloud size={15} />
                            </div>
                        </div>

                        <input
                            type="file"
                            hidden
                            accept="image/*,.pdf"
                            onChange={(e) => handleImage("license", e.target?.files?.[0] || null)}
                        />
                    </motion.label>

                    <motion.label
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-gray-200
                                   cursor-pointer hover:border-black transition bg-white"
                    >
                        <div className="pr-2">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">Vehicle RC</p>
                            <p className="text-[11px] text-gray-500 truncate max-w-42.5 sm:max-w-55">
                                {docs.rc ? docs.rc.name : "Registration Certificate"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs ${docs.rc ? "text-green-600 font-semibold" : "text-gray-400 font-medium"}`}>
                                {docs.rc ? "Change" : "Upload"}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                                <UploadCloud size={15} />
                            </div>
                        </div>

                        <input
                            type="file"
                            hidden
                            accept="image/*,.pdf"
                            onChange={(e) => handleImage("rc", e.target?.files?.[0] || null)}
                        />
                    </motion.label>
                </div>

                <div className="mt-5 flex items-start gap-2.5 text-xs text-gray-500">
                    <FileCheck size={15} className="mt-0.5 text-gray-400 shrink-0" />
                    <p>Documents are securely stored and manually verified by our team.</p>
                </div>
                {error &&
                    <p className="text-red-500 text-xs mt-3">*{error}</p>
                }

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handledocs}
                    disabled={!canSubmit || loading}
                    className="mt-6 w-full h-11 rounded-xl bg-black text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition cursor-pointer shadow-xs"
                >
                    {loading ? <CircleDashed size={16} className="text-white animate-spin" /> : "Continue"}
                </motion.button>
            </motion.div>
        </div>
    )
}

export default page
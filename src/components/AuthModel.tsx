"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/userSlice";
import axios from "axios";
import { CircleDashed, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image"
import { useRouter } from "next/navigation";
import React, { useState } from "react"

type AuthModelProps = {
  children: React.ReactNode
}

const DEMO_ACCOUNTS = [
  { role: "User", email: "rydex.user@gmail.com", password: "rydex.user" },
  { role: "Partner", email: "rydex.partner@gmail.com", password: "rydex.partner" },
  { role: "Admin", email: "rydex.admin@gmail.com", password: "rydex.admin07" },
]

export default function AuthModel({ children }: AuthModelProps) {

  const router = useRouter()
  const dispatch = useAppDispatch()
  const { update: updateSession } = useSession()

  const [step, setStep] = useState<"login" | "signup" | "otp">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFillDemo = (email: string, password: string) => {
    setError("")
    setFormData((prev) => ({
      ...prev,
      email,
      password
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await axios.post("/api/auth/register", {
        ...formData,
        email: formData.email.trim().toLowerCase()
      })
      setStep("otp")
    } catch (error: any) {
      setError(error?.response?.data?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await axios.post("/api/auth/verify-email", {
        email: formData.email.trim().toLowerCase(),
        otp: otp.join("")
      })
      setOtp(["", "", "", "", "", ""])
      setStep("login")
    } catch (error: any) {
      setError(error?.response?.data?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })

      if (!res || res.error) {
        setError("Invalid Email or Password Or Account may be created using Countinue with Google")
        setLoading(false)
        return
      }

      const meRes = await axios.get("/api/auth/user/me")
      if (meRes?.data) {
        dispatch(setUser(meRes.data))
      }
      await updateSession()
      setOpen(false)
      router.refresh()
    } catch (error) {
      setError("Something went wrong while logging in")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    if (googleLoading) return
    setGoogleLoading(true)
    signIn("google", { callbackUrl: "/" })
  }

  const handleChangeOtp = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^[0-9]?$/.test(e.target.value)) return

    const fillOtp = [...otp]
    fillOtp[index] = e.target.value
    setOtp(fillOtp)

    if (e.target.value) {
      const nextOtpBox = e.target.nextElementSibling as HTMLInputElement | null
      if (nextOtpBox && nextOtpBox.tagName === "INPUT") {
        nextOtpBox.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index]) {
      const prevBox = e.currentTarget.previousElementSibling as HTMLInputElement | null
      if (prevBox && prevBox.tagName === "INPUT") {
        prevBox.focus()
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) setShowPassword(false)
      }}
    >
      <DialogTrigger>
        {children}
      </DialogTrigger>

      <DialogContent className="w-[92%] sm:max-w-97.5 bg-white border border-black/10 text-black rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-h-[92dvh] overflow-y-auto">
        <DialogHeader className="text-center space-y-0.5">
          <DialogTitle className="text-2xl font-extrabold tracking-widest text-center text-black">
            RYDEX
          </DialogTitle>

          <DialogDescription className="text-[11px] text-gray-500 text-center">
            Premium Vehicle Booking
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          disabled={googleLoading || loading}
          onClick={handleGoogleLogin}
          className="mt-3.5 w-full h-10 rounded-xl border border-black/15 bg-white text-black flex items-center justify-center gap-2.5 text-xs font-semibold hover:bg-black hover:text-white disabled:opacity-60 transition cursor-pointer"
        >
          {googleLoading ? (
            <>
              <CircleDashed size={16} className="animate-spin" />
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <Image src="/google.png" alt="google" width={20} height={20} />
              Continue with Google
            </>
          )}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-[11px] text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        <AnimatePresence mode="wait">
          {step === "login" && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onSubmit={handleLogin}
            >
              <h2 className="text-base font-bold text-black">Welcome back</h2>

              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2.5 border border-black/15 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-black transition">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full bg-transparent outline-none text-base sm:text-sm text-black placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex items-center gap-2.5 border border-black/15 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-black transition">
                  <Lock size={16} className="text-gray-400 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full bg-transparent outline-none text-base sm:text-sm text-black placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-gray-400 hover:text-black transition cursor-pointer shrink-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <p className="text-red-500 text-xs mt-1">*{error}</p>}

                <button
                  type="submit"
                  className="w-full h-10 rounded-xl flex items-center justify-center bg-black text-white text-xs sm:text-sm font-semibold hover:bg-gray-900 transition cursor-pointer"
                  disabled={loading}
                >
                  {!loading ? "Login" : <CircleDashed size={16} color="white" className="animate-spin" />}
                </button>
              </div>

              <div className="mt-3.5 p-2.5 rounded-xl bg-gray-50 border border-black/10">
                <p className="text-[11px] font-semibold text-gray-600 mb-2">
                  Demo Credentials (Click to auto-fill)
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleFillDemo(acc.email, acc.password)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                        formData.email === acc.email
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-black/15 hover:border-black"
                      }`}
                    >
                      {acc.role}
                    </button>
                  ))}
                </div>
                {formData.email && DEMO_ACCOUNTS.some((a) => a.email === formData.email) && (
                  <p className="mt-1.5 text-[10px] text-gray-500 truncate">
                    {formData.email} • {formData.password}
                  </p>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-gray-500">
                Dont't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(false)
                    setError("")
                    setStep("signup")
                  }}
                  className="text-black font-semibold hover:underline cursor-pointer ml-1"
                >
                  SignUp
                </button>
              </p>
            </motion.form>
          )}

          {step === "signup" && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onSubmit={handleSubmit}
            >
              <h2 className="text-base font-bold text-black">Create Account</h2>

              <div className="space-y-2.5 mt-3">
                <div className="flex items-center gap-2.5 border border-black/15 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-black transition">
                  <User size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full bg-transparent outline-none text-base sm:text-sm text-black placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex items-center gap-2.5 border border-black/15 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-black transition">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full bg-transparent outline-none text-base sm:text-sm text-black placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex items-center gap-2.5 border border-black/15 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-black transition">
                  <Lock size={16} className="text-gray-400 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full bg-transparent outline-none text-base sm:text-sm text-black placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-gray-400 hover:text-black transition cursor-pointer shrink-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <p className="text-red-500 text-xs mt-1">*{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-xl bg-black text-white text-xs sm:text-sm flex justify-center items-center font-semibold hover:bg-gray-900 transition cursor-pointer"
                >
                  {!loading ? "Send OTP" : <CircleDashed size={16} color="white" className="animate-spin" />}
                </button>
              </div>

              <p className="mt-3.5 text-center text-xs text-gray-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(false)
                    setError("")
                    setStep("login")
                  }}
                  className="text-black font-semibold hover:underline cursor-pointer ml-1"
                >
                  Login
                </button>
              </p>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-base sm:text-lg font-semibold text-black">Verify Email</h2>

              <div className="mt-4 flex justify-between gap-1.5 sm:gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    id={`otp-${i}`}
                    value={digit}
                    maxLength={1}
                    inputMode="numeric"
                    onChange={(e) => handleChangeOtp(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-semibold rounded-xl bg-white border border-black/20 outline-none focus:border-black transition"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-xs mt-2">*{error}</p>}

              <button
                onClick={handleVerifyEmail}
                className="mt-5 w-full h-10 rounded-xl flex items-center justify-center bg-black text-white text-xs sm:text-sm font-semibold hover:bg-gray-900 transition cursor-pointer"
                disabled={loading}
              >
                {!loading ? "Verify OTP & Create Account" : <CircleDashed size={16} color="white" className="animate-spin" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
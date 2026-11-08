"use client"
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import AuthModel from './AuthModel'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setUser } from '@/redux/userSlice'
import { signOut } from 'next-auth/react'
import { ChevronRight, LogOut, Menu, UserPlus, X } from 'lucide-react'
import axios from 'axios'
import { getSocket } from '@/lib/socket'

const Nav_items = ["Home", "Bookings", "About Us", "Contact"]

function Nav() {
  const router = useRouter()
  const pathName = usePathname()
  const dispatch = useAppDispatch()
  const userData = useAppSelector(state => state.user.userData)

  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState<number>(0)

  const fetchPendingCount = async () => {
    try {
      const { data } = await axios.get('/api/partner/bookings/pending-request-count')
      setPendingCount(typeof data === "number" ? data : (data?.count ?? 0))
    } catch (error) {
      console.log("Fetch pending count error:", error)
    }
  }

  useEffect(() => {
    if (userData?.role === "partner") {
      fetchPendingCount()

      const socket = getSocket()

      if (userData?._id) {
        socket.emit("identity", userData._id)
      }

      socket.on("new_booking", () => {
        setPendingCount((prev) => prev + 1)
      })

      return () => {
        socket.off("new_booking")
      }
    }
  }, [userData])

  const handleLogOut = async () => {
    dispatch(setUser(null))
    await signOut({ callbackUrl: "/" })
    setProfileOpen(false)
  }

  const hideNavbar = 
    pathName?.startsWith('/user/ride/') || 
    pathName === '/partner/active-ride'

  if (hideNavbar) {
    return null
  }

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] max-w-6xl z-50 rounded-full bg-[#0b0b0b] text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-2 md:py-2.5'
      >
        <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>
          <Link href="/" className="flex items-center">
            <Image src={"/logo.png"} alt='logo' width={34} height={34} priority />
          </Link>

          <div className='hidden md:flex items-center gap-7'>
            {userData?.role === "partner" ? (
              <>
                <Link
                  href="/"
                  className={`text-[13px] font-medium transition ${
                    pathName === "/" ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Home
                </Link>

                <Link
                  href="/partner/pending-requests"
                  className={`relative text-[13px] font-medium transition ${
                    pathName === "/partner/pending-requests" ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Pending Requests</span>
                  <span className='absolute -top-2.5 -right-5 w-4.5 h-4.5 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center shadow-xs'>
                    {pendingCount}
                  </span>
                </Link>

                <Link
                  href="/partner/bookings"
                  className={`text-[13px] font-medium transition ${
                    pathName === "/partner/bookings" ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Bookings
                </Link>

                <Link
                  href="/partner/active-ride"
                  className={`text-[13px] font-medium transition ${
                    pathName === "/partner/active-ride" ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Active Ride
                </Link>
              </>
            ) : (
              Nav_items.map((i, index) => {
                let href = "/"
                if (i === "Bookings") {
                  href = "/user/bookings"
                } else if (i !== "Home") {
                  href = `/${i.toLowerCase().replace(/\s+/g, "-")}`
                }
                const Active = href === pathName
                return (
                  <Link
                    key={index}
                    href={href}
                    className={`text-[13px] font-medium transition ${
                      Active ? "text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {i}
                  </Link>
                )
              })
            )}
          </div>

          <div className='flex items-center gap-3 relative'>
            <div className='hidden md:block relative'>
              {!userData ? (
                <AuthModel>
                  <span className="rounded-full bg-white text-black hover:bg-gray-200 px-4 py-1.5 text-xs font-semibold transition cursor-pointer">
                    Sign In
                  </span>
                </AuthModel>
              ) : (
                <>
                  <button
                    className='w-9 h-9 rounded-full bg-white text-black font-bold text-sm cursor-pointer'
                    onClick={() => setProfileOpen((prev) => !prev)}
                  >
                    {userData.name?.toUpperCase().charAt(0) || "U"}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className='absolute top-11 right-0 w-60 bg-white text-black rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50'
                      >
                        <div className='p-3.5 border-b border-gray-100'>
                          <p className='font-semibold text-xs text-gray-900 truncate'>{userData.name?.toUpperCase()}</p>
                          <p className='text-[11px] text-gray-500 truncate mt-0.5'>{userData.email}</p>

                          {userData.role && userData.role !== "user" && (
                            <span className='inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-black text-white'>
                              {userData.role}
                            </span>
                          )}
                        </div>

                        <div className='p-1.5 space-y-0.5'>
                          {userData.role !== "partner" && (
                            <button
                              onClick={() => {
                                setProfileOpen(false)
                                router.push("/partner/onboarding/vehicle")
                              }}
                              className='w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition flex items-center gap-2.5 cursor-pointer'
                            >
                              <UserPlus size={15} className='text-gray-500' />
                              <span>Become a Partner</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setProfileOpen(false)
                              handleLogOut()
                            }}
                            className='w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2.5 cursor-pointer'
                          >
                            <LogOut size={15} className='text-red-500' />
                            <span>LogOut</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <div className='md:hidden'>
              {!userData ? (
                <AuthModel>
                  <span className="rounded-full bg-white text-black hover:bg-gray-200 px-3.5 py-1 text-xs font-semibold transition cursor-pointer">
                    Sign In
                  </span>
                </AuthModel>
              ) : (
                <button
                  className='w-7.5 h-7.5 rounded-full bg-white text-black font-bold text-xs cursor-pointer'
                  onClick={() => setProfileOpen((prev) => !prev)}
                >
                  {userData.name?.toUpperCase().charAt(0) || "U"}
                </button>
              )}
            </div>

            <button
              className='md:hidden text-white cursor-pointer'
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className='fixed inset-0 bg-black z-30 md:hidden'
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className='fixed top-16 left-1/2 -translate-x-1/2 w-[92%] bg-[#0B0B0B] rounded-2xl shadow-2xl z-40 md:hidden overflow-hidden'
            >
              <div className='flex flex-col divide-y divide-white/10'>
                {userData?.role === "partner" ? (
                  <>
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className={`px-5 py-3 text-sm font-medium transition flex items-center justify-between ${
                        pathName === "/" ? "text-white bg-white/10 font-semibold" : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <span>Home</span>
                      {pathName === "/" && <span className='w-1.5 h-1.5 rounded-full bg-white' />}
                    </Link>

                    <Link
                      href="/partner/pending-requests"
                      onClick={() => setMenuOpen(false)}
                      className={`px-5 py-3 text-sm font-medium transition flex items-center justify-between ${
                        pathName === "/partner/pending-requests" ? "text-white bg-white/10 font-semibold" : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <span>Pending Requests</span>
                        <span className='px-1.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black'>
                          {pendingCount}
                        </span>
                      </div>
                      {pathName === "/partner/pending-requests" && <span className='w-1.5 h-1.5 rounded-full bg-white' />}
                    </Link>

                    <Link
                      href="/partner/bookings"
                      onClick={() => setMenuOpen(false)}
                      className={`px-5 py-3 text-sm font-medium transition flex items-center justify-between ${
                        pathName === "/partner/bookings" ? "text-white bg-white/10 font-semibold" : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <span>Bookings</span>
                      {pathName === "/partner/bookings" && <span className='w-1.5 h-1.5 rounded-full bg-white' />}
                    </Link>

                    <Link
                      href="/partner/active-ride"
                      onClick={() => setMenuOpen(false)}
                      className={`px-5 py-3 text-sm font-medium transition flex items-center justify-between ${
                        pathName === "/partner/active-ride" ? "text-white bg-white/10 font-semibold" : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <span>Active Ride</span>
                      {pathName === "/partner/active-ride" && <span className='w-1.5 h-1.5 rounded-full bg-white' />}
                    </Link>
                  </>
                ) : (
                  Nav_items.map((i, index) => {
                    let href = "/"
                    if (i === "Bookings") {
                      href = "/user/bookings"
                    } else if (i !== "Home") {
                      href = `/${i.toLowerCase().replace(/\s+/g, "-")}`
                    }
                    const Active = href === pathName

                    return (
                      <Link
                        key={index}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className={`px-5 py-3 text-sm font-medium transition flex items-center justify-between ${
                          Active ? "text-white bg-white/10 font-semibold" : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <span>{i}</span>
                        {Active && <span className='w-1.5 h-1.5 rounded-full bg-white' />}
                      </Link>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && userData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className='fixed inset-0 bg-black z-30 md:hidden'
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className='fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 md:hidden p-4 pb-5 border-t border-gray-100'
            >
              <div className='w-9 h-1 bg-gray-200 rounded-full mx-auto mb-2.5' />

              <div className='px-1 pb-2.5 border-b border-gray-100'>
                <p className='font-semibold text-sm text-gray-900 truncate'>{userData.name?.toUpperCase()}</p>
                {userData.role && userData.role !== "user" ? (
                  <span className='inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md bg-black text-white'>
                    {userData.role}
                  </span>
                ) : null}
              </div>

              <div className='mt-2 space-y-1'>
                {userData.role !== "partner" && (
                  <div
                    onClick={() => {
                      setProfileOpen(false)
                      router.push("/partner/onboarding/vehicle")
                    }}
                    className='w-full flex items-center gap-2.5 px-2 py-2 text-xs hover:bg-gray-100 font-medium text-gray-800 active:bg-gray-100 rounded-xl cursor-pointer transition'
                  >
                    <UserPlus size={15} />
                    <span>Become a Partner</span>
                    <ChevronRight size={14} className='ml-auto text-gray-400' />
                  </div>
                )}

                <button
                  className='w-full flex items-center gap-2.5 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-100 active:bg-red-50 rounded-xl cursor-pointer transition'
                  onClick={() => handleLogOut()}
                >
                  <LogOut size={15} />
                  <span>LogOut</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Nav
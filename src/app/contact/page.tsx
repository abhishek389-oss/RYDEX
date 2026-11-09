"use client"
import React, { useState } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { motion } from 'motion/react'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Headphones 
} from 'lucide-react'

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Email Support",
    details: "support@rydex.com",
    subtext: "Expected response within 2-4 hours",
    action: "mailto:support@rydex.com"
  },
  {
    icon: Phone,
    title: "Phone & WhatsApp",
    details: "+91 98493-43244",
    subtext: "Mon-Sat from 8:00 AM to 10:00 PM",
    action: "tel:+918001234567"
  },
  {
    icon: MapPin,
    title: "Operations Hub",
    details: "Prayagraj, Uttar Pradesh",
    subtext: "Civil Lines / Phulpur Corridor",
    action: null
  },
  {
    icon: Clock,
    title: "Live Ride Help",
    details: "24/7 In-App Desk",
    subtext: "Instant help during running rides",
    action: null
  }
]

const FAQ_SNIPPETS = [
  {
    q: "How can I report a driver or rider issue?",
    a: "You can reach out through the active ride screen directly or submit your booking ID using the form below."
  },
  {
    q: "How do partner payouts work?",
    a: "Payouts are processed directly to your verified bank account or UPI ID every 24-48 hours once Admin approval is complete."
  },
  {
    q: "Can I update vehicle details after registration?",
    a: "Yes, you can edit your vehicle model, photos, and tariff rates from your Partner Dashboard whenever your ride status is idle."
  }
]

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("general")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isFormValid = name.trim().length >= 2 && email.includes("@") && message.trim().length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || loading) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setName("")
      setEmail("")
      setMessage("")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-between selection:bg-zinc-900 selection:text-white">
      <Nav />

      <main className="flex-1 px-4 pt-24 pb-16 max-w-5xl mx-auto w-full space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3 max-w-xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold shadow-xs">
            <Headphones size={13} className="text-zinc-700" />
            <span>Customer & Partner Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            We're Here to Help
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Have questions about a recent booking, vehicle verification, or driver payouts? Reach out to our team anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CONTACT_INFO.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="group bg-white hover:bg-zinc-950 rounded-2xl border border-zinc-200/90 hover:border-zinc-950 p-4 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-3 select-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-white text-zinc-900 group-hover:text-zinc-950 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 group-hover:text-white transition-colors duration-200">{item.title}</h3>
                  {item.action ? (
                    <a 
                      href={item.action} 
                      className="text-xs font-semibold text-zinc-950 group-hover:text-zinc-200 hover:underline block truncate mt-0.5 transition-colors duration-200"
                    >
                      {item.details}
                    </a>
                  ) : (
                    <p className="text-xs font-semibold text-zinc-950 group-hover:text-zinc-200 truncate mt-0.5 transition-colors duration-200">{item.details}</p>
                  )}
                  <p className="text-[10px] text-zinc-400 group-hover:text-zinc-400 mt-1 leading-snug transition-colors duration-200">{item.subtext}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-950">Send Us a Direct Message</h2>
                <p className="text-[11px] text-zinc-400">Fill in the fields below and our team will get in touch</p>
              </div>
            </div>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-2.5"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Message Delivered!</h3>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Thank you for reaching out. We have received your note and will review it shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-xs font-semibold text-zinc-900 underline cursor-pointer"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Topic / Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition cursor-pointer"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="ride_issue">Issue with a Ride / Booking</option>
                    <option value="partner_onboarding">Partner Onboarding / KYC</option>
                    <option value="payout">Bank & Payout Queries</option>
                    <option value="feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Your Message</label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about your query or ride experience..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white resize-none transition"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Please include booking IDs or vehicle numbers if relevant.</p>
                </div>

                <motion.button
                  type="submit"
                  whileHover={isFormValid && !loading ? { scale: 1.01 } : {}}
                  whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
                  disabled={!isFormValid || loading}
                  className="w-full h-11 bg-zinc-950 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-white" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Message</span>
                      <Send size={13} />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-5 space-y-3"
          >
            <motion.div 
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="group bg-white hover:bg-zinc-950 rounded-3xl border border-zinc-200/90 hover:border-zinc-950 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-200 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-zinc-700 group-hover:text-zinc-300 transition-colors duration-200" />
                <h3 className="text-sm font-bold text-zinc-950 group-hover:text-white transition-colors duration-200">Quick Answers</h3>
              </div>

              <div className="space-y-3">
                {FAQ_SNIPPETS.map((faq, i) => (
                  <div key={i} className="border-b border-zinc-100 group-hover:border-zinc-800 pb-3 last:border-b-0 last:pb-0 space-y-1 transition-colors duration-200">
                    <p className="text-xs font-bold text-zinc-900 group-hover:text-white transition-colors duration-200">{faq.q}</p>
                    <p className="text-[11px] text-zinc-500 group-hover:text-zinc-400 leading-relaxed transition-colors duration-200">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-950 text-white rounded-3xl p-5 shadow-sm space-y-2 cursor-default select-none border border-transparent hover:border-zinc-800 transition-colors"
            >
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Priority Safety Desk</p>
              <h4 className="text-sm font-bold">In-Transit Emergency?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If you are currently on an active ride and require urgent assistance, use the direct SOS button within your active ride map interface.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
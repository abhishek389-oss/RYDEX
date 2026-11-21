"use client"
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Send, Loader2, X } from 'lucide-react'
import { getSocket } from '@/lib/socket'

interface Message {
  _id?: string
  sender: "driver" | "user"
  text: string
  createdAt?: string
}

interface RideChatProps {
  bookingId: string
  currentRole: "driver" | "user"
  otherName: string
  onClose?: () => void
}

export default function RideChat({ bookingId, currentRole, otherName, onClose }: RideChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!bookingId) return

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/chat/get-all?bookingId=${String(bookingId)}`)
        const list: Message[] = Array.isArray(data) ? data : data?.messages || []
        setMessages(list)
      } catch (err) {
        console.error("Fetch chat error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [bookingId])

  useEffect(() => {
    if (!bookingId) return

    const strBookingId = String(bookingId)
    const socket = getSocket()

    const joinRoom = () => {
      socket.emit("join_ride", strBookingId)
    }

    joinRoom()
    socket.on("connect", joinRoom)

    const handleNewMessage = (msg: any) => {
      if (msg?.bookingId && String(msg.bookingId) !== strBookingId) return
      const normalizedMsg: Message = {
        _id: msg._id,
        sender: msg.sender || msg.senderRole,
        text: msg.text,
        createdAt: msg.createdAt,
      }
      setMessages((prev) => {
        if (normalizedMsg._id && prev.some((m) => m._id === normalizedMsg._id)) return prev
        return [...prev, normalizedMsg]
      })
    }

    socket.on("chat_message", handleNewMessage)

    return () => {
      socket.off("connect", joinRoom)
      socket.off("chat_message", handleNewMessage)
    }
  }, [bookingId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputMessage.trim()
    if (!text || sending || !bookingId) return

    const strBookingId = String(bookingId)
    setSending(true)
    const socket = getSocket()

    try {
      const { data } = await axios.post("/api/chat/send", {
        bookingId: strBookingId,
        sender: currentRole,
        text,
      })

      const saved = data?.message || data
      const newMsg: Message = {
        _id: saved?._id,
        sender: saved?.sender || currentRole,
        text: saved?.text || text,
        createdAt: saved?.createdAt || new Date().toISOString(),
      }

      setMessages((prev) => {
        if (newMsg._id && prev.some((m) => m._id === newMsg._id)) return prev
        return [...prev, newMsg]
      })
      setInputMessage("")

      socket.emit("join_ride", strBookingId)
      socket.emit("chat_message", {
        bookingId: strBookingId,
        ...newMsg,
      })
    } catch (err) {
      console.error("Send message error:", err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 bg-zinc-950 text-white flex items-center justify-between shrink-0">
        <div>
          <p className="text-sm font-bold leading-tight">{otherName}</p>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Chat
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-zinc-50/70 overscroll-contain">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-zinc-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs font-semibold text-zinc-500">No messages yet.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Start the conversation with {otherName}.</p>
          </div>
        ) : (
          messages.map((m, index) => {
            const isMe = m.sender === currentRole
            return (
              <div
                key={m._id || index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed break-words ${
                    isMe
                      ? "bg-zinc-950 text-white rounded-br-xs"
                      : "bg-white text-zinc-900 border border-zinc-200 shadow-2xs rounded-bl-xs"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-100 flex gap-2 bg-white shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${otherName}...`}
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || sending}
          className="w-10 h-10 rounded-xl bg-zinc-950 hover:bg-black text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shrink-0"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  )
}
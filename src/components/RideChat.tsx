"use client"
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Send, Loader2 } from 'lucide-react'
import { getSocket } from '@/lib/socket'

interface Message {
  _id?: string
  senderRole: "driver" | "user"
  text: string
  createdAt?: string
}

interface RideChatProps {
  bookingId: string
  currentRole: "driver" | "user"
  otherName: string
}

export default function RideChat({ bookingId, currentRole, otherName }: RideChatProps) {
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
        const { data } = await axios.get(`/api/chat/get-all?bookingId=${bookingId}`)
        if (data?.messages) {
          setMessages(data.messages)
        }
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

    const socket = getSocket()

    socket.emit("join_ride", bookingId)

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => {
        if (msg._id && prev.some((m) => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    }

    socket.on("chat_message", handleNewMessage)

    return () => {
      socket.off("chat_message", handleNewMessage)
    }
  }, [bookingId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputMessage.trim()
    if (!text || sending) return

    setSending(true)
    const socket = getSocket()

    try {
      const { data } = await axios.post("/api/chat/send", {
        bookingId,
        senderRole: currentRole,
        text,
      })

      const newMsg: Message = data?.message || {
        senderRole: currentRole,
        text,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newMsg])
      setInputMessage("")

      socket.emit("chat_message", {
        bookingId,
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
      {/* Header */}
      <div className="px-4 py-2.5 bg-zinc-950 text-white flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs font-bold leading-tight">{otherName}</p>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Chat
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-zinc-50/50">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-zinc-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs font-medium text-zinc-400">No messages yet.</p>
            <p className="text-[10px] text-zinc-400">Start the conversation with {otherName}.</p>
          </div>
        ) : (
          messages.map((m, index) => {
            const isMe = m.senderRole === currentRole
            return (
              <div
                key={m._id || index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
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

      <form onSubmit={handleSendMessage} className="p-2 border-t border-zinc-100 flex gap-1.5 bg-white shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${otherName}...`}
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || sending}
          className="w-9 h-9 rounded-xl bg-zinc-950 hover:bg-black text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shrink-0"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
    </div>
  )
}
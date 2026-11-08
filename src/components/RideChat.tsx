"use client"
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { getSocket } from '@/lib/socket'
import { Loader2, Send, Sparkles } from 'lucide-react'

interface ChatProps {
  bookingId: string
  currentRole: "driver" | "user"
  otherName: string
}

export default function RideChat({ bookingId, currentRole, otherName }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showAi, setShowAi] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    try {
      const { data } = await axios.post("/api/chat/get-all", { bookingId })
      setMessages(data || [])
    } catch (err) {
      console.log(err)
    }
  }

  const fetchAiSuggestions = async () => {
    setAiLoading(true)
    setShowAi(true)
    try {
      const { data } = await axios.post("/api/chat/ai-suggestions", {
        lastMessage: messages[messages.length - 1]?.text || "",
        role: currentRole,
      })
      setSuggestions(data.suggestions || [])
    } catch (err) {
      console.log(err)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    const socket = getSocket()
    socket.on("chat_message", (newMsg: any) => {
      setMessages((prev) => [...prev, newMsg])
    })

    return () => {
      socket.off("chat_message")
    }
  }, [bookingId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (msgText?: string) => {
    const messageToSend = msgText || text
    if (!messageToSend.trim()) return

    setText("")
    setShowAi(false)

    try {
      const { data } = await axios.post("/api/chat/send", {
        bookingId,
        sender: currentRole,
        text: messageToSend,
      })

      const socket = getSocket()
      socket.emit("chat_message", data)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900">
      <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
            {otherName[0]?.toUpperCase() || "C"}
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">{otherName}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Active Now</p>
          </div>
        </div>

        <button
          onClick={() => fetchAiSuggestions()}
          className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
        >
          <Sparkles size={12} />
          <span>Quick AI</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.sender === currentRole
            return (
              <div
                key={m._id || i}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-1.5 rounded-2xl ${
                    isMine
                      ? "bg-zinc-900 text-white rounded-br-xs"
                      : "bg-zinc-100 text-zinc-800 rounded-bl-xs"
                  }`}
                >
                  <p className="wrap-break-words leading-relaxed">{m.text}</p>
                </div>
                <span className="text-[8px] text-zinc-400 mt-0.5 px-1 font-medium">
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {showAi && (
        <div className="p-2 bg-purple-50/50 border-t border-purple-100 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 px-1">
            <span>AI Suggestions</span>
            <button onClick={() => setShowAi(false)} className="cursor-pointer text-zinc-400 hover:text-zinc-600">✕</button>
          </div>
          {aiLoading ? (
            <div className="flex items-center justify-center py-1.5">
              <Loader2 size={13} className="animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="bg-white hover:bg-purple-100 text-zinc-800 text-[10px] font-medium px-2 py-1 rounded-lg border border-purple-200/60 shadow-2xs transition-colors cursor-pointer text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="p-2 border-t border-zinc-100 flex items-center gap-1.5 bg-white"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-zinc-100 rounded-xl px-3 py-1.5 text-xs text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-800"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-7 h-7 rounded-xl bg-zinc-900 hover:bg-black disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  )
}
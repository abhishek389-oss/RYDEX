"use client"
import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Star, BarChart2, Zap } from "lucide-react"

type Earning = {
  date: string
  earnings: number
}

const fmt = (val: number) => `₹${val.toLocaleString("en-IN")}`

export default function PartnerEarning() {
  const [data, setData] = useState<Earning[]>([])

  const fetchEarning = async () => {
    try {
      const res = await axios.get("/api/partner/earning")
      setData(res.data || [])
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchEarning()
  }, [])

  const total = data.reduce((acc, curr) => acc + (curr.earnings || 0), 0)
  const avg = data.length ? Math.round(total / data.length) : 0
  const maxVal = data.length ? Math.max(...data.map((d) => d.earnings)) : 0
  const bestDay = data.find((d) => d.earnings === maxVal)

  const today = data[data.length - 1]
  const yest = data[data.length - 2]
  const delta = today && yest ? today.earnings - yest.earnings : 0
  const isPositive = delta >= 0
  const deltaPct = yest?.earnings
    ? Math.round((Math.abs(delta) / yest.earnings) * 100)
    : 0

  const metrics = [
    {
      label: "Best Day",
      val: fmt(maxVal),
      sub: bestDay?.date || "N/A",
      Icon: Star,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Daily Average",
      val: fmt(avg),
      sub: "per day",
      Icon: BarChart2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Today",
      val: fmt(today?.earnings || 0),
      sub: `${isPositive ? "+" : "-"}${fmt(Math.abs(delta))} vs yesterday`,
      Icon: Zap,
      color: "text-emerald-600 bg-emerald-50",
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-5 w-full text-zinc-900 mt-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Partner
            </span>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Ride Earnings
            </h2>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Last 7 days payouts</p>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Weekly Total
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-gray-900 font-mono tracking-tight leading-none">
              {fmt(total)}
            </span>
            <span className={`text-[10px] font-semibold flex items-center px-1.5 py-0.5 rounded ${
              isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            }`}>
              {isPositive ? <TrendingUp size={11} className="mr-0.5" /> : <TrendingDown size={11} className="mr-0.5" />}
              {deltaPct}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mb-1">
              <span className={`p-1 rounded-md ${m.color}`}>
                <m.Icon size={12} />
              </span>
              <span className="text-gray-500 truncate">{m.label}</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900 font-mono leading-tight">
              {m.val}
            </p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="h-40 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={35}
              tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
            />
            <Bar dataKey="earnings" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => {
                const isBest = entry.earnings === maxVal && maxVal > 0
                const isCurr = index === data.length - 1
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isBest ? "#10b981" : isCurr ? "#3b82f6" : "#18181b"}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
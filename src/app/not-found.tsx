"use client";

import Link from "next/link";
import { ArrowLeft, Compass, MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white text-black px-6 select-none overflow-hidden">
      {/* Top Radar + Off-Route Badge */}
      <div className="relative flex items-center justify-center mb-6">
        <span className="absolute w-24 h-24 rounded-full bg-black/5 animate-ping" />
        <span className="absolute w-16 h-16 rounded-full border border-dashed border-black/25 animate-[spin_10s_linear_infinite]" />
        <div className="relative w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
          <MapPinOff size={24} className="animate-pulse" />
        </div>
      </div>

      {/* Giant 404 Typography */}
      <div className="relative flex items-center justify-center">
        <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-black leading-none">
          4<span className="inline-block animate-[rydexFloat_2.6s_ease-in-out_infinite]">0</span>4
        </h1>
      </div>

      {/* Broken Route Track Animation */}
      <div className="mt-4 w-56 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
        <div className="relative flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-black rounded-full animate-[rydexDetour_1.8s_ease-in-out_infinite_alternate]" />
        </div>
        <span className="px-1.5 py-0.5 rounded-md bg-black text-white text-[9px] font-bold tracking-wider uppercase">
          OFF ROUTE
        </span>
      </div>

      {/* Heading & Subtext */}
      <h2 className="mt-6 text-lg sm:text-xl font-extrabold tracking-tight text-center text-gray-900">
        Looks like this route doesn&apos;t exist
      </h2>
      <p className="mt-2 max-w-sm text-center text-xs sm:text-sm text-gray-500 leading-relaxed">
        The destination you&apos;re trying to reach may have moved, expired, or taken a wrong turn.
      </p>

      {/* Action Buttons */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="h-10 px-5 rounded-full bg-black text-white text-xs sm:text-sm font-semibold flex items-center gap-2 hover:bg-gray-900 active:scale-95 transition shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/contact"
          className="h-10 px-5 rounded-full border border-black/15 bg-white text-black text-xs sm:text-sm font-semibold flex items-center gap-2 hover:bg-black hover:text-white active:scale-95 transition"
        >
          <Compass size={16} />
          <span>Get Support</span>
        </Link>
      </div>

      <style>{`
        @keyframes rydexDetour {
          0% {
            transform: translateX(-20%);
          }
          100% {
            transform: translateX(220%);
          }
        }
        @keyframes rydexFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
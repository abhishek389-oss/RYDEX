export default function Loading() {
  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white px-6 select-none">
      <div className="relative flex items-center justify-center mb-6">
        <span className="absolute w-16 h-16 rounded-full bg-black/5 animate-ping" />
        <div className="relative w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
          <span className="text-lg font-black tracking-tighter">R</span>
        </div>
      </div>

      <h2 className="text-sm font-extrabold tracking-[0.35em] text-black uppercase">
        RYDEX
      </h2>

      <div className="mt-4 w-44 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-black shrink-0" />

        <div className="relative flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-black rounded-full animate-[rydexSlide_1.1s_ease-in-out_infinite]" />
        </div>

        <span className="w-2 h-2 rounded-xs border-2 border-black shrink-0" />
      </div>

      <p className="mt-3 text-[11px] font-medium text-gray-400 tracking-wide">
        Preparing your route...
      </p>

      <style>{`
        @keyframes rydexSlide {
          0% {
            transform: translateX(-0%);
          }
          50% {
            transform: translateX(220%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}
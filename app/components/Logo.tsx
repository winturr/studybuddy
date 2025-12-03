export default function Logo() {
  return (
    <div className="relative font-extralight p-3 border border-green-600 text-green-500 text-2xl sm:text-3xl md:text-4xl tracking-[-2px] overflow-hidden">
      {/* Main text with glow */}
      <span className="relative z-10 animate-crt-flicker drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
        STUDY_BUDDY
      </span>

      {/* Scan line overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 animate-crt-scanline bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px]" />

      {/* Subtle RGB shift / chromatic aberration */}
      <span className="absolute inset-0 p-3 text-red-500/20 animate-crt-shift-left z-0">
        STUDY_BUDDY
      </span>
      <span className="absolute inset-0 p-3 text-blue-500/20 animate-crt-shift-right z-0">
        STUDY_BUDDY
      </span>
    </div>
  );
}

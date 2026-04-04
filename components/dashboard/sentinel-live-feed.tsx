export function SentinelLiveFeed() {
  return (
    <section className="relative h-full w-full overflow-hidden bg-[#000000]">
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-1">
        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#02c953]" />
          <span className="text-[10px] font-black tracking-[0.2em] text-[#e7e5e4]">
            LIVE FEED
          </span>
        </div>
        <div className="font-mono text-[10px] font-medium uppercase text-[#acabaa]">
          CAM_01 // SEC_NORTH
        </div>
      </div>

      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7OX_1kcLZMyD8ZULMNqQCghP-EbEBvP5O8Ow0Iwqb_-lR4IY2XGE9GTtkYXGWRm5IJpzCHJAvWKKsM7DrreRx2NIgYM8F0Y8J3JPCGdT7xG2nuAYcL8RWTDyG5Ygr_hnmAzWTtILVAXJ4pmUvzD5BJjZD53QPlbogO0mM8KAX5mADJfUIngrzkxphkCLpSPL-wsyKWl_07jZRvir1H8JxsrOrbh2TOuJRgm2X2k8wx3CTzFtFtIBiu97nGg85_moQvECcTp16mq0G"
        alt="High-angle surveillance camera feed"
        className="h-full w-full object-cover opacity-60 grayscale"
      />

      <div className="absolute left-[40%] top-[25%] h-64 w-32 border-2 border-[#02c953]/60">
        <div className="absolute -top-6 left-0 bg-[#02c953] px-1 text-[10px] font-black text-[#003711]">
          P-01 // CONF 0.98
        </div>
      </div>

      <div className="absolute left-[65%] top-[45%] h-56 w-28 border-2 border-[#02c953]/60">
        <div className="absolute -top-6 left-0 bg-[#02c953] px-1 text-[10px] font-black text-[#003711]">
          P-02 // CONF 0.94
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 border border-[#484848]/10" />
      <div className="absolute left-4 top-1/2 h-px w-4 bg-[#484848]/30" />
      <div className="absolute right-4 top-1/2 h-px w-4 bg-[#484848]/30" />
      <div className="absolute left-1/2 top-4 h-4 w-px bg-[#484848]/30" />
      <div className="absolute bottom-4 left-1/2 h-4 w-px bg-[#484848]/30" />
    </section>
  );
}

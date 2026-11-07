export default function MedizoneLogo() {
  return (
    <div
      role="img"
      aria-label="medizone.lk"
      className="inline-flex shrink-0 items-center rounded-[12px] bg-[#193c69] px-3 py-2 text-[29px] font-bold leading-none tracking-[-1px] text-white"
      style={{ fontFamily: '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif' }}
    >
      <span aria-hidden="true" className="inline-flex items-center">
        mediz
        <svg aria-hidden="true" viewBox="0 0 30 30" className="mx-[1px] mt-[5px] size-[18px] shrink-0">
          <circle cx="15" cy="15" r="15" fill="white" />
          <path d="M12 3h6v8h8v6H12Z" fill="#ed3543" />
          <path d="M4 13h7v6h8v8h-7v-7H4Z" fill="#78b94e" />
          <path d="m5 6 19 19" stroke="white" strokeWidth="1.5" />
          <rect x="14" y="17" width="7" height="8" rx="1.5" fill="white" />
          <path d="M16 19h3m-3 2h3m-3 2h3" stroke="#78b94e" strokeWidth="1" />
        </svg>
        ne.lk
      </span>
    </div>
  );
}

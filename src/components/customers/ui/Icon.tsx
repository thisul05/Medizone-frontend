// Outline icons on a 24px grid, 1.75 stroke (Medizone design system; Lucide-compatible geometry).

const ICONS = {
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18|M6 6l12 12",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 16v-4|M12 8h.01",
  alert: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z|M12 9v4|M12 17h.01",
  alertCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 8v4|M12 16h.01",
  checkCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M8 12l3 3 5-6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 6v6l4 2",
  truck: "M1 4h14v12H1z|M15 8h4l4 4v4h-8z|M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z|M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z|M21 21l-4.35-4.35",
  plus: "M12 5v14|M5 12h14",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 6l6 6-6 6",
  chevronLeft: "M15 6l-6 6 6 6",
  arrowRight: "M5 12h14|M12 5l7 7-7 7",
  image: "M3 3h18v18H3z|M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z|M21 15l-5-5L5 21",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M7 10l5 5 5-5|M12 15V3",
  dollarFile: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z|M14 3v6h6|M12 11v7|M14.5 12.5h-3.25a1.25 1.25 0 0 0 0 2.5h1.5a1.25 1.25 0 0 1 0 2.5H9.5",
  arrowUp: "M12 19V5|M5 12l7-7 7 7",
  arrowDown: "M12 5v14|M19 12l-7 7-7-7",
  arrowLeft: "M19 12H5|M12 19l-7-7 7-7",
  package: "M21 8 12 3 3 8v8l9 5 9-5z|M3 8l9 5 9-5|M12 13v8",
  pill: "M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z|M8.5 8.5l7 7",
  home: "M3 10.5 12 3l9 7.5V21H3z|M9 21v-6h6v6",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M22 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75",
  receipt: "M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z|M9 8h6|M9 12h6|M9 16h3",
  file: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z|M14 3v6h6|M9 13h6|M9 17h4",
  chart: "M3 3v18h18|M7 15l4-4 3 3 5-6",
  wallet: "M3 7h18v13H3z|M3 7l2-3h12l2 3|M16 14h2",
  store: "M3 9l1.5-5h15L21 9|M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z|M5 13v8h14v-8",
  calendar: "M4 5h16v16H4z|M4 10h16|M8 3v4|M16 3v4",
  refresh: "M21 12a9 9 0 1 1-3-6.7L21 8|M21 3v5h-5",
  tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z|M7.5 7.5h.01",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9|M13.7 21a2 2 0 0 1-3.4 0",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  star: "M12 2.5l2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-1z",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z|M22 6l-10 7L2 6",
  mapPin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z|M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eye: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  send: "M22 2 11 13|M22 2l-7 20-4-9-9-4z",
  menu: "M4 6h16|M4 12h16|M4 18h16",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  edit: "M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  gift: "M20 12v10H4V12|M2 7h20v5H2z|M12 22V7|M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z|M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  percent: "M19 5 5 19|M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z|M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M12 2v2|M12 20v2|M4.9 4.9l1.4 1.4|M17.7 17.7l1.4 1.4|M2 12h2|M20 12h2|M6.3 17.7l-1.4 1.4|M19.1 4.9l-1.4 1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  monitor: "M3 4h18v12H3z|M8 20h8|M12 16v4",
  calculator: "M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z|M8 6h8v4H8z|M8 14h.01|M12 14h.01|M16 14h.01|M8 18h.01|M12 18h.01|M16 18h.01",
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Set when the icon carries meaning on its own; otherwise it is hidden from screen readers. */
  label?: string;
  filled?: boolean;
  className?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.75, label, filled, className }: IconProps) {
  return (
    <svg
      className={`block flex-none ${className ?? ""}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {ICONS[name].split("|").map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

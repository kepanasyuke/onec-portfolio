const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconGrid = () => (
  <svg {...base}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconCart = () => (
  <svg {...base}>
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
    <circle cx="9.5" cy="20" r="1.2" />
    <circle cx="17.5" cy="20" r="1.2" />
  </svg>
);

export const IconScales = () => (
  <svg {...base}>
    <path d="M12 3v18" />
    <path d="M6 7h12" />
    <path d="M6 7 3 14h6L6 7Z" />
    <path d="M18 7l-3 7h6l-3-7Z" />
    <path d="M8 21h8" />
  </svg>
);

export const IconUsers = () => (
  <svg {...base}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.5a3 3 0 0 1 0 5.6" />
    <path d="M18 20a5.2 5.2 0 0 0-1.6-3.6" />
  </svg>
);

export const IconDocument = () => (
  <svg {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M8.5 13.5l2 2 4-4.5" />
  </svg>
);

export const IconExchange = () => (
  <svg {...base}>
    <path d="M4 8h13l-3-3" />
    <path d="M20 16H7l3 3" />
  </svg>
);

export const IconPlug = () => (
  <svg {...base}>
    <path d="M9 3v5" />
    <path d="M15 3v5" />
    <path d="M7 8h10v3a5 5 0 0 1-10 0V8Z" />
    <path d="M12 16v5" />
  </svg>
);

export const IconPuzzle = () => (
  <svg {...base}>
    <path d="M9 4a2 2 0 1 1 4 0h2a2 2 0 0 1 2 2v2a2 2 0 1 1 0 4v4a2 2 0 0 1-2 2h-4a2 2 0 1 0-4 0H5a2 2 0 0 1-2-2v-4a2 2 0 1 0 0-4V6a2 2 0 0 1 2-2h4Z" />
  </svg>
);

export const IconDatabase = () => (
  <svg {...base}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
    <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
  </svg>
);

export const IconCheck = () => (
  <svg {...base}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const IconAlert = () => (
  <svg {...base}>
    <path d="M12 4 2.5 20h19L12 4Z" />
    <path d="M12 10v4" />
    <path d="M12 17.5h.01" />
  </svg>
);

export const IconArrow = () => (
  <svg {...base}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

export const IconSearch = () => (
  <svg {...base} width={16} height={16}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21" />
  </svg>
);

export const IconRefresh = () => (
  <svg {...base} width={15} height={15}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </svg>
);

export const IconDownload = () => (
  <svg {...base} width={15} height={15}>
    <path d="M12 3v12" />
    <path d="M7 11l5 5 5-5" />
    <path d="M4 20h16" />
  </svg>
);

export const IconPrint = () => (
  <svg {...base} width={15} height={15}>
    <path d="M7 8V3h10v5" />
    <rect x="3" y="8" width="18" height="8" rx="1.5" />
    <path d="M7 16h10v5H7z" />
  </svg>
);

export const IconLink = () => (
  <svg {...base} width={15} height={15}>
    <path d="M10 13a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
    <path d="M14 11a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 19.7l1.2-1.2" />
  </svg>
);

export const IconReset = () => (
  <svg {...base} width={15} height={15}>
    <path d="M4 6h16" />
    <path d="M7 6V4h10v2" />
    <path d="M6 6l1 14h10l1-14" />
    <path d="M10 10v6M14 10v6" />
  </svg>
);

export const IconChevron = () => (
  <svg {...base} width={14} height={14}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

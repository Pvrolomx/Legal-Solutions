'use client';

type Props = {
  width?: number;
  className?: string;
};

export default function LegalLogo({ 
  width = 300, 
  className,
}: Props) {
  const height = width * 0.55;
  const mainColor = "#E7D3A3"; // Dorado/beige para fondo oscuro
  const subtitleColor = "#94a3b8"; // Slate-400
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Legal Solutions Logo"
    >
      {/* L */}
      <path d="M0 18 H10 V82 H42 V92 H0 V18 Z" fill={mainColor} />
      
      {/* E */}
      <path d="M52 18 H95 V28 H62 V50 H90 V60 H62 V82 H95 V92 H52 V18 Z" fill={mainColor} />
      
      {/* G */}
      <path d="M105 18 H148 V28 H115 V82 H138 V60 H125 V50 H148 V92 H105 V18 Z" fill={mainColor} />
      
      {/* A - Triangle with dot on TOP */}
      <g>
        {/* Closed Triangle */}
        <path 
          d="M185 92 L210 22 L235 92 Z" 
          stroke={mainColor}
          strokeWidth="10"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Dot on TOP of triangle (above the peak) */}
        <circle cx="210" cy="10" r="5" fill={mainColor} />
      </g>
      
      {/* L */}
      <path d="M255 18 H265 V82 H300 V92 H255 V18 Z" fill={mainColor} />
      
      {/* solutions - lowercase */}
      <text
        x="150"
        y="140"
        textAnchor="middle"
        fill={subtitleColor}
        fontSize="30"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="400"
        letterSpacing="3"
      >
        solutions
      </text>
    </svg>
  );
}

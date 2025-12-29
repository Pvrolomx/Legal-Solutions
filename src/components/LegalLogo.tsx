'use client';

type Props = {
  width?: number;
  className?: string;
  darkMode?: boolean;
};

export default function LegalLogo({ 
  width = 300, 
  className,
  darkMode = true
}: Props) {
  const height = width * 0.55;
  const mainColor = darkMode ? "#E7D3A3" : "#1e3a5f"; // Dorado en dark, azul en light
  const triangleColor = darkMode ? "#E7D3A3" : "#d4c4a8"; // Triángulo beige/dorado
  const subtitleColor = darkMode ? "#64748b" : "#1e3a5f";
  
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
      <path d="M0 15 H12 V85 H45 V97 H0 V15 Z" fill={mainColor} />
      
      {/* E */}
      <path d="M55 15 H100 V27 H67 V50 H95 V62 H67 V85 H100 V97 H55 V15 Z" fill={mainColor} />
      
      {/* G */}
      <path d="M110 15 H155 V27 H122 V85 H143 V62 H130 V50 H155 V97 H110 V15 Z" fill={mainColor} />
      
      {/* A - Closed Triangle with dot */}
      <g>
        {/* Triangle outline - CLOSED */}
        <path 
          d="M190 97 L215 20 L240 97 Z" 
          stroke={triangleColor}
          strokeWidth="10"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Dot in center */}
        <circle cx="215" cy="65" r="5" fill={triangleColor} />
      </g>
      
      {/* L */}
      <path d="M255 15 H267 V85 H300 V97 H255 V15 Z" fill={mainColor} />
      
      {/* solutions - lowercase */}
      <text
        x="150"
        y="145"
        textAnchor="middle"
        fill={subtitleColor}
        fontSize="32"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="400"
        letterSpacing="2"
      >
        solutions
      </text>
    </svg>
  );
}

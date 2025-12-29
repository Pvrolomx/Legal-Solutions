'use client';

type Props = {
  width?: number;
  className?: string;
  color?: string;
  subtitleColor?: string;
};

export default function LegalLogo({ 
  width = 300, 
  className,
  color = "#E7D3A3",
  subtitleColor = "#64748b"
}: Props) {
  const height = width * 0.45;
  const scale = width / 300;
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Legal Solutions Logo"
    >
      {/* Main text: LEG + pyramid + L */}
      <text
        x="0"
        y="60"
        fill={color}
        fontSize="56"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="700"
        letterSpacing="2"
      >
        LEG
      </text>
      
      {/* Pyramid as the A */}
      <g transform="translate(138, 10)">
        <path
          d="M28 0 L56 50 L0 50 Z"
          stroke={color}
          strokeWidth="5"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="28" cy="32" r="4" fill={color} />
      </g>
      
      {/* Final L */}
      <text
        x="200"
        y="60"
        fill={color}
        fontSize="56"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="700"
        letterSpacing="2"
      >
        L
      </text>
      
      {/* SOLUTIONS subtitle */}
      <text
        x="150"
        y="105"
        textAnchor="middle"
        fill={subtitleColor}
        fontSize="24"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="300"
        letterSpacing="12"
      >
        SOLUTIONS
      </text>
    </svg>
  );
}

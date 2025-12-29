'use client';

type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  dotRadius?: number;
  className?: string;
};

export default function LegalAIcon({
  size = 180,
  color = "#E7D3A3",
  strokeWidth = 10,
  dotRadius = 8,
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Legal Solutions Logo"
    >
      {/* Pyramid / closed triangle */}
      <path
        d="M100 18 L182 182 H18 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Subtle dot */}
      <circle cx="100" cy="104" r={dotRadius} fill={color} />
    </svg>
  );
}

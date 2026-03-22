import React from "react";

export function CloudSmile({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cloud shape */}
      <path
        d="M 25 50 Q 20 50 20 45 Q 20 35 30 35 Q 30 25 45 25 Q 55 20 65 25 Q 80 25 85 35 Q 100 35 100 45 Q 100 55 85 55 L 25 55 Q 20 55 20 50 Z"
        fill="#FFE1AF"
        stroke="#B77466"
        strokeWidth="2"
      />
      {/* Eyes */}
      <circle cx="45" cy="40" r="3" fill="#4A4A4A" />
      <circle cx="65" cy="40" r="3" fill="#4A4A4A" />
      {/* Smile */}
      <path
        d="M 45 48 Q 55 53 65 48"
        fill="none"
        stroke="#4A4A4A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Cheeks */}
      <circle cx="38" cy="45" r="4" fill="#E2B59A" opacity="0.6" />
      <circle cx="72" cy="45" r="4" fill="#E2B59A" opacity="0.6" />
    </svg>
  );
}

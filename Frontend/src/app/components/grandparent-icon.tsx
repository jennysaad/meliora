import React from 'react';

interface GrandparentIconProps {
  variant?: 'waving' | 'holding-file' | 'happy' | 'neutral' | 'reading';
  className?: string;
}

export function GrandparentIcon({ variant = 'waving', className = '' }: GrandparentIconProps) {
  if (variant === 'waving') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="35" r="18" fill="#E2B59A" />
        {/* Hair */}
        <path d="M 32 30 Q 32 20 42 20 Q 50 18 58 20 Q 68 20 68 30" fill="#E5E5E5" strokeWidth="0" />
        {/* Glasses */}
        <circle cx="43" cy="35" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <circle cx="57" cy="35" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <line x1="48" y1="35" x2="52" y2="35" stroke="#4A4A4A" strokeWidth="1.5" />
        {/* Smile */}
        <path d="M 43 40 Q 50 43 57 40" fill="none" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
        {/* Body */}
        <ellipse cx="50" cy="70" rx="20" ry="25" fill="#B77466" />
        {/* Arms - waving */}
        <path d="M 30 60 Q 20 50 15 40" fill="none" stroke="#E2B59A" strokeWidth="4" strokeLinecap="round" />
        <circle cx="15" cy="40" r="3" fill="#E2B59A" />
        <path d="M 70 60 L 75 70" fill="none" stroke="#E2B59A" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'holding-file') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="35" r="18" fill="#E2B59A" />
        {/* Hair */}
        <path d="M 32 30 Q 32 20 42 20 Q 50 18 58 20 Q 68 20 68 30" fill="#E5E5E5" strokeWidth="0" />
        {/* Glasses */}
        <circle cx="43" cy="35" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <circle cx="57" cy="35" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <line x1="48" y1="35" x2="52" y2="35" stroke="#4A4A4A" strokeWidth="1.5" />
        {/* Smile */}
        <path d="M 43 40 Q 50 43 57 40" fill="none" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
        {/* Body */}
        <ellipse cx="50" cy="70" rx="20" ry="25" fill="#957C62" />
        {/* Arms */}
        <path d="M 30 60 L 35 75" fill="none" stroke="#E2B59A" strokeWidth="4" strokeLinecap="round" />
        <path d="M 70 60 L 65 75" fill="none" stroke="#E2B59A" strokeWidth="4" strokeLinecap="round" />
        {/* File/Document */}
        <rect x="40" y="75" width="20" height="15" fill="#fff" stroke="#4A4A4A" strokeWidth="1" rx="2" />
        <line x1="43" y1="80" x2="57" y2="80" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="43" y1="85" x2="52" y2="85" stroke="#4A4A4A" strokeWidth="1" />
      </svg>
    );
  }

  if (variant === 'happy') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="45" r="20" fill="#E2B59A" />
        {/* Hair */}
        <path d="M 30 40 Q 30 28 42 28 Q 50 26 58 28 Q 70 28 70 40" fill="#E5E5E5" strokeWidth="0" />
        {/* Glasses */}
        <circle cx="42" cy="43" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <circle cx="58" cy="43" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <line x1="47" y1="43" x2="53" y2="43" stroke="#4A4A4A" strokeWidth="1.5" />
        {/* Big Smile */}
        <path d="M 40 50 Q 50 56 60 50" fill="none" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
        {/* Cheeks */}
        <circle cx="35" cy="48" r="3" fill="#FFE1AF" opacity="0.8" />
        <circle cx="65" cy="48" r="3" fill="#FFE1AF" opacity="0.8" />
        {/* Body */}
        <ellipse cx="50" cy="80" rx="18" ry="20" fill="#957C62" />
      </svg>
    );
  }

  if (variant === 'neutral') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="45" r="20" fill="#E2B59A" />
        {/* Hair */}
        <path d="M 30 40 Q 30 28 42 28 Q 50 26 58 28 Q 70 28 70 40" fill="#E5E5E5" strokeWidth="0" />
        {/* Glasses */}
        <circle cx="42" cy="43" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <circle cx="58" cy="43" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <line x1="47" y1="43" x2="53" y2="43" stroke="#4A4A4A" strokeWidth="1.5" />
        {/* Neutral mouth */}
        <line x1="42" y1="52" x2="58" y2="52" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
        {/* Body */}
        <ellipse cx="50" cy="80" rx="18" ry="20" fill="#B77466" />
      </svg>
    );
  }

  if (variant === 'reading') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="45" cy="40" r="18" fill="#E2B59A" />
        {/* Hair */}
        <path d="M 27 35 Q 27 23 39 23 Q 47 21 53 23 Q 63 23 63 35" fill="#E5E5E5" strokeWidth="0" />
        {/* Glasses */}
        <circle cx="38" cy="38" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <circle cx="52" cy="38" r="5" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
        <line x1="43" y1="38" x2="47" y2="38" stroke="#4A4A4A" strokeWidth="1.5" />
        {/* Smile */}
        <path d="M 38 45 Q 45 47 52 45" fill="none" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
        {/* Body */}
        <ellipse cx="45" cy="70" rx="18" ry="23" fill="#957C62" />
        {/* Book */}
        <rect x="50" y="60" width="35" height="25" fill="#fff" stroke="#4A4A4A" strokeWidth="1.5" rx="2" />
        <line x1="67.5" y1="60" x2="67.5" y2="85" stroke="#4A4A4A" strokeWidth="1.5" />
        <line x1="55" y1="67" x2="63" y2="67" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="55" y1="72" x2="63" y2="72" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="55" y1="77" x2="60" y2="77" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="72" y1="67" x2="80" y2="67" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="72" y1="72" x2="80" y2="72" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="72" y1="77" x2="77" y2="77" stroke="#4A4A4A" strokeWidth="1" />
      </svg>
    );
  }

  return null;
}
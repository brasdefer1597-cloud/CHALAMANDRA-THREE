
import React from 'react';

// Security Configuration
export const SECURITY_CONFIG = {
  PROXY_URL: "https://chalamandra-backend.vercel.app/api/analyze",
  EXTENSION_SECRET_TOKEN: "chalamandra-elite-protocol-token-v1"
};

// Magistral Assets (Conceptual representations of the provided images)
export const ASSETS = {
  LOGO: (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse" style={{ background: 'linear-gradient(to top right, #f97316, #d946ef, #3b82f6)' }}></div>
      <svg className="w-10 h-10 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="url(#chameleon_grad)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" fill="#E6C275" className="animate-pulse"/>
        <defs>
          <linearGradient id="chameleon_grad" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF8A00" />
            <stop offset="0.5" stopColor="#FF00CC" />
            <stop offset="1" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  ),
  CORE_ROBOT: (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 h-1 rounded-full" style={{ left: '25%', right: '25%', backgroundColor: 'var(--champagne-gold-40)' }}></div>
      <div className="absolute -top-1 w-2 h-2 bg-champagne-gold rotate-45" style={{ left: '25%' }}></div>
      <div className="absolute -top-1 w-2 h-2 bg-champagne-gold rotate-45" style={{ right: '25%' }}></div>
      <svg className="w-12 h-12 text-platinum-cyan filter" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.6))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22M5.636 5.636L7.757 7.757M16.243 16.243L18.364 18.364M5.636 18.364L7.757 16.243M16.243 7.757L18.364 5.636" strokeLinecap="round" />
        <circle cx="9" cy="12" r="0.5" fill="currentColor" />
        <circle cx="15" cy="12" r="0.5" fill="currentColor" />
      </svg>
    </div>
  ),
  PRIVACY_LOCK: (
    <div className="flex items-center gap-1">
      <svg className="w-6 h-6 text-champagne-gold" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      </svg>
      <svg className="w-8 h-8 text-blue-500 filter" style={{ filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.5))' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
    </div>
  )
};

export const PERSONAS = {
  CHOLA: {
    name: "CHOLA (Tesis)",
    color: "text-champagne-gold",
    border: "border-champagne-gold-20",
    bg: "bg-champagne-gold-5",
    accent: "bg-champagne-gold",
    desc: "Sabiduría establecida y patrones históricos.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  MALANDRA: {
    name: "MALANDRA (Antítesis)",
    color: "text-electric-fuchsia",
    border: "border-electric-fuchsia-20",
    bg: "bg-electric-fuchsia-5",
    accent: "bg-electric-fuchsia",
    desc: "Disrupción, crítica y pragmatismo despiadado.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  FRESA: {
    name: "FRESA (Síntesis)",
    color: "text-platinum-cyan",
    border: "border-platinum-cyan-20",
    bg: "bg-platinum-cyan-5",
    accent: "bg-platinum-cyan",
    desc: "Orquestación óptima y evolución armónica.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.143-7.714L1 12l7.714-2.143L11 3z" />
      </svg>
    )
  }
};

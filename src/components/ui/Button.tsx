'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'relative inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-[0_0_20px_rgba(0,245,255,0.5)] hover:shadow-[0_0_30px_rgba(0,245,255,0.8)] focus:ring-cyan-400 border border-cyan-300',
    secondary:
      'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:shadow-[0_0_30px_rgba(255,0,255,0.7)] focus:ring-fuchsia-400 border border-fuchsia-400',
    ghost:
      'bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 hover:text-white focus:ring-white/30 backdrop-blur-sm',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-10 py-4 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

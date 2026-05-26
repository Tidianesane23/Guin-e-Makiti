'use client';

import { ButtonHTMLAttributes, ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/src/lib/utils';

type Variant = 'primary' | 'secondary' | 'whatsapp' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  fullWidth?: boolean;
  iconLeft?:  ReactNode;
  iconRight?: ReactNode;
}

interface Ripple { id: number; x: number; y: number; size: number }

const variantStyles: Record<Variant, string> = {
  primary:   'bg-or text-white hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(200,134,10,0.4)] focus-visible:ring-or/60',
  secondary: 'bg-or text-white hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(200,134,10,0.4)] focus-visible:ring-or/60',
  whatsapp:  'bg-[#25D366] text-white hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(37,211,102,0.35)] focus-visible:ring-[#25D366]/60',
  ghost:     'text-brun hover:bg-dark/10 transition-colors duration-200 focus-visible:ring-dark/20',
};

const ghostStyle = { background: 'rgba(44,26,26,0.06)', border: '1px solid rgba(44,26,26,0.12)' };

const sizeStyles: Record<Size, string> = {
  sm: 'px-[18px] py-[8px]  text-[10px] gap-1.5',
  md: 'px-[24px] py-[13px] text-[11px] gap-2',
  lg: 'px-[32px] py-[15px] text-[13px] gap-2.5',
};

export default function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  className,
  disabled,
  children,
  style,
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    const id   = nextId.current++;
    setRipples(prev => [...prev, { id, x, y, size }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 520);
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={!isDisabled ? { scale: 0.96 } : undefined}
      disabled={isDisabled}
      onClick={!isDisabled ? handleClick : undefined}
      style={variant === 'ghost' ? { ...ghostStyle, ...style } : style}
      className={cn(
        'btn-shimmer inline-flex items-center justify-center font-bold uppercase tracking-[0.8px] rounded-full transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...(props as object)}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="ripple-el"
          style={{
            width:  r.size,
            height: r.size,
            left:   r.x - r.size / 2,
            top:    r.y - r.size / 2,
          }}
        />
      ))}

      {loading ? (
        <svg aria-hidden="true" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          {iconLeft  && <span className="shrink-0">{iconLeft}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
}

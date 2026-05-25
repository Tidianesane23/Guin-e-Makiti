import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

type Variant = 'primary' | 'secondary' | 'whatsapp' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:   'bg-rouge text-white hover:opacity-90 focus-visible:ring-rouge/60',
  secondary: 'border-2 border-rouge text-rouge hover:bg-rouge hover:text-white focus-visible:ring-rouge/60',
  whatsapp:  'bg-[#25D366] text-white hover:opacity-90 focus-visible:ring-[#25D366]/60',
  ghost:     'text-noir hover:bg-gray-100 focus-visible:ring-gray-300',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-base gap-2 rounded-xl',
  lg: 'px-6 py-3 text-lg gap-2.5 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg
          aria-hidden="true"
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <>
          {iconLeft && <span className="shrink-0">{iconLeft}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
}

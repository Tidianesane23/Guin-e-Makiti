import { cn } from '@/src/lib/utils';

type Variant = 'promo' | 'rupture' | 'nouveau' | 'featured';

interface BadgeProps {
  variant:   Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  promo:    'bg-or text-white',
  rupture:  'bg-dark/10 text-brun',
  nouveau:  'bg-bordeaux text-white',
  featured: 'bg-or text-white',
};

const labels: Record<Variant, string> = {
  promo:    'PROMO',
  rupture:  'RUPTURE',
  nouveau:  'NOUVEAU',
  featured: 'VEDETTE',
};

export default function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide',
        variants[variant],
        className,
      )}
    >
      {labels[variant]}
    </span>
  );
}

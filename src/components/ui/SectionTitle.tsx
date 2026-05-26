import { ReactNode } from 'react';

interface SectionTitleProps {
  eyebrow: ReactNode;
  title:   string;
  light?:  boolean;
}

export default function SectionTitle({ eyebrow, title, light }: SectionTitleProps) {
  const eyebrowColor = light ? '#C8860A' : '#C0392B';
  const titleColor   = light ? 'rgba(255,255,255,0.9)' : '#2C1A1A';
  const lineGradient = light
    ? 'linear-gradient(90deg, rgba(200,134,10,0.6) 0%, transparent 100%)'
    : 'linear-gradient(90deg, rgba(200,134,10,0.45) 0%, transparent 100%)';

  return (
    <div className="mb-8 md:mb-12">
      <p
        style={{
          fontSize:      '9px',
          letterSpacing: '2.5px',
          color:         eyebrowColor,
          textTransform: 'uppercase',
          fontWeight:    700,
          marginBottom:  6,
        }}
      >
        {eyebrow}
      </p>
      <div className="flex items-center gap-4">
        <h2
          className="shrink-0 text-base font-extrabold md:text-lg"
          style={{ color: titleColor }}
        >
          {title}
        </h2>
        <div
          className="flex-1 h-px"
          style={{ background: lineGradient }}
        />
      </div>
    </div>
  );
}

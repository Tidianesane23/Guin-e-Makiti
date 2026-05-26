const sizeMap = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };

interface LogoTextProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function LogoText({ size = 'md' }: LogoTextProps) {
  return (
    <span
      className={`font-logo ${sizeMap[size]} leading-none`}
      style={{ fontWeight: 400, letterSpacing: '1px' }}
    >
      <span style={{ color: '#E8001C' }}>GUIN</span>
      <span style={{ color: '#FFB800' }}>ÉE</span>
      <span> </span>
      <span style={{ color: '#FFB800' }}>MA</span>
      <span style={{ color: '#009944' }}>KI</span>
      <span style={{ color: '#009944' }}>TI</span>
    </span>
  );
}

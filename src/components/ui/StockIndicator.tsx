import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faExclamationTriangle } from '@/src/lib/icons';

interface StockIndicatorProps {
  stock:     number;
  maxStock?: number;
  compact?:  boolean;
}

export default function StockIndicator({ stock, maxStock = 20, compact = false }: StockIndicatorProps) {
  if (stock > 10) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
        style={{ background: 'rgba(0,153,68,0.1)', color: '#009944' }}
      >
        <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9, width: 9, height: 9 }} />
        En stock
      </span>
    );
  }

  if (stock === 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
        style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#C0392B' }}
      >
        <FontAwesomeIcon icon={faTimes} style={{ fontSize: 9, width: 9, height: 9 }} />
        Rupture de stock
      </span>
    );
  }

  const isCritical = stock <= 3;
  const barColor   = isCritical ? '#C0392B' : '#C8860A';

  return (
    <div className="flex flex-col gap-1">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
        style={
          isCritical
            ? { background: 'rgba(192,57,43,0.12)', border: '1px solid #C0392B', color: '#C0392B' }
            : { background: 'rgba(200,134,10,0.12)', border: '1px solid rgba(200,134,10,0.4)', color: '#C8860A' }
        }
      >
        {isCritical ? (
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse-dot"
            style={{ background: '#C0392B', flexShrink: 0 }}
          />
        ) : (
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: 9, width: 9, height: 9 }} />
        )}
        {isCritical ? `Plus que ${stock} en stock !` : 'Stock limité'}
      </span>

      {!compact && (
        <>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(44,26,26,0.1)', marginTop: 4 }}>
            <div
              style={{
                height: '100%', borderRadius: 2,
                width:  `${Math.min(100, (stock / maxStock) * 100)}%`,
                background: barColor,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <p style={{ fontSize: 10, color: '#7A4A3A', marginTop: 2 }}>
            {`Plus que ${stock} article${stock > 1 ? 's' : ''} disponible${stock > 1 ? 's' : ''}`}
          </p>
        </>
      )}
    </div>
  );
}

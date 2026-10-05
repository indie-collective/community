// PROTOTYPE: a floating bar to flip between ?variant= designs. Throwaway,
// and hidden in production builds.
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const PrototypeSwitcher = ({ variants, current }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const index = Math.max(0, variants.findIndex(([key]) => key === current));

  const go = (step) => {
    const [key] = variants[(index + step + variants.length) % variants.length];
    const next = new URLSearchParams(searchParams);
    next.set('variant', key);
    navigate(`?${next}`, { replace: true, preventScrollReset: true });
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.target.closest?.('input, textarea, [contenteditable]')) return;
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (import.meta.env.PROD) return null;

  const [key, label] = variants[index];
  const button = { background: 'none', border: 0, color: 'inherit', font: 'inherit', fontSize: 18, padding: '0 8px', cursor: 'pointer' };
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        background: '#111',
        color: '#fff',
        font: '600 14px/1.2 system-ui, sans-serif',
        boxShadow: '0 4px 16px rgba(0,0,0,.35)',
      }}
    >
      <button type="button" style={button} onClick={() => go(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        PROTOTYPE · {key} — {label}
      </span>
      <button type="button" style={button} onClick={() => go(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
};

export default PrototypeSwitcher;

import { useIsFetching } from '@tanstack/react-query';

export function GlobalLoadingBar() {
  const isFetching = useIsFetching();

  if (isFetching === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        overflow: 'hidden',
        background: 'rgba(20, 184, 166, 0.15)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '40%',
          background: 'linear-gradient(90deg, #14b8a6, #06b6d4, #8b5cf6)',
          borderRadius: '0 2px 2px 0',
          animation: 'loading-bar-slide 1.2s ease-in-out infinite',
        }}
      />
    </div>
  );
}

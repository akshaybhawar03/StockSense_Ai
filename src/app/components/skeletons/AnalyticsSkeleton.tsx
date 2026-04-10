export function AnalyticsSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Title placeholder */}
      <div
        className="h-7 w-32 rounded mb-6"
        style={{
          background: 'var(--skeleton-bg, #e5e7eb)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }}
      />

      {/* 4 chart card placeholders in a 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5"
          >
            <div
              className="h-4 w-36 rounded mb-4"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              className="h-56 rounded-lg"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

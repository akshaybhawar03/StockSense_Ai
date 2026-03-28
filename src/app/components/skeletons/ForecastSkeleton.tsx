export function ForecastSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header placeholder */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl"
          style={{
            background: 'var(--skeleton-bg, #e5e7eb)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div>
          <div
            className="h-6 w-56 rounded mb-2"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            className="h-4 w-96 rounded"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.1s',
            }}
          />
        </div>
      </div>

      {/* Chart area placeholder */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className="h-4 w-64 rounded"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            className="h-6 w-40 rounded-full"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
        <div
          className="h-[280px] rounded-lg"
          style={{
            background: 'var(--skeleton-bg, #e5e7eb)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            animationDelay: '0.2s',
          }}
        />
      </div>

      {/* Order window placeholder */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <div
          className="h-6 w-52 rounded mb-3"
          style={{
            background: 'var(--skeleton-bg, #e5e7eb)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          className="h-4 w-full rounded mb-4"
          style={{
            background: 'var(--skeleton-bg, #e5e7eb)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div className="grid grid-cols-2 gap-4">
          <div
            className="h-20 rounded-xl"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            className="h-20 rounded-xl"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.1s',
            }}
          />
        </div>
      </div>
    </div>
  );
}

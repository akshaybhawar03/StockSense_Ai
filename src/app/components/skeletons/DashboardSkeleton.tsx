export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* 8 stat card placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div
                  className="h-3 w-24 rounded mb-3"
                  style={{
                    background: 'var(--skeleton-bg, #e5e7eb)',
                    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  className="h-7 w-20 rounded"
                  style={{
                    background: 'var(--skeleton-bg, #e5e7eb)',
                    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              </div>
              <div
                className="w-10 h-10 rounded-lg"
                style={{
                  background: 'var(--skeleton-bg, #e5e7eb)',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Health bar placeholder */}
      <div
        className="h-20 rounded-xl"
        style={{
          background: 'var(--skeleton-bg, #e5e7eb)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }}
      />

      {/* 2 chart placeholders */}
      <div className="grid md:grid-cols-2 gap-6">
        <div
          className="h-72 rounded-xl"
          style={{
            background: 'var(--skeleton-bg, #e5e7eb)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          className="h-72 rounded-xl"
          style={{
            background: 'var(--skeleton-bg, #e5e7eb)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            animationDelay: '0.2s',
          }}
        />
      </div>

      {/* Module placeholders */}
      <div className="space-y-6">
        <div
          className="h-64 rounded-xl"
          style={{
            background: 'var(--skeleton-bg, #e5e7eb)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          className="h-64 rounded-xl"
          style={{
            background: 'var(--skeleton-bg, #e5e7eb)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            animationDelay: '0.15s',
          }}
        />
      </div>
    </div>
  );
}

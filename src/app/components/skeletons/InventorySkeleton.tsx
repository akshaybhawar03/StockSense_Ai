export function InventorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header placeholder */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div
            className="h-7 w-64 rounded mb-2"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            className="h-4 w-80 rounded"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.1s',
            }}
          />
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl overflow-hidden">
        {/* Filter bar placeholder */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <div
            className="h-10 w-96 rounded-lg"
            style={{
              background: 'var(--skeleton-bg, #e5e7eb)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div className="flex gap-2">
            <div
              className="h-10 w-36 rounded-lg"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              className="h-10 w-28 rounded-lg"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Table header placeholder */}
        <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 flex gap-4">
          {[300, 120, 80, 100, 120, 80].map((w, i) => (
            <div
              key={i}
              className="h-4 rounded"
              style={{
                width: `${w}px`,
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>

        {/* 8 table rows */}
        {Array.from({ length: 8 }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="px-4 py-4 flex gap-4 items-center border-b border-gray-100 dark:border-gray-800 last:border-0"
          >
            <div className="flex-1">
              <div
                className="h-4 w-48 rounded mb-2"
                style={{
                  background: 'var(--skeleton-bg, #e5e7eb)',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                  animationDelay: `${rowIdx * 0.05}s`,
                }}
              />
              <div
                className="h-3 w-24 rounded"
                style={{
                  background: 'var(--skeleton-bg, #e5e7eb)',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                  animationDelay: `${rowIdx * 0.05 + 0.05}s`,
                }}
              />
            </div>
            <div
              className="h-4 w-24 rounded"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              className="h-4 w-16 rounded"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              className="h-4 w-20 rounded"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              className="h-6 w-16 rounded-full"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              className="h-4 w-16 rounded"
              style={{
                background: 'var(--skeleton-bg, #e5e7eb)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

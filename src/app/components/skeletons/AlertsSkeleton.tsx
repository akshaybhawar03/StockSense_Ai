export function AlertsSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header placeholder */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="h-7 w-32 rounded"
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

      {/* 5 alert group placeholders */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, groupIdx) => (
          <div
            key={groupIdx}
            className="border border-gray-700/50 rounded-xl overflow-hidden"
          >
            {/* Group header */}
            <div className="px-4 py-3 flex items-center justify-between bg-gray-800/30">
              <div
                className="h-4 w-48 rounded"
                style={{
                  background: 'var(--skeleton-bg, #e5e7eb)',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                  animationDelay: `${groupIdx * 0.08}s`,
                }}
              />
              <div
                className="h-4 w-20 rounded"
                style={{
                  background: 'var(--skeleton-bg, #e5e7eb)',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>

            {/* 2 alert items per group */}
            {groupIdx === 0 &&
              Array.from({ length: 2 }).map((_, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-center justify-between px-4 py-3 border-t border-gray-700/30"
                >
                  <div>
                    <div
                      className="h-4 w-40 rounded mb-1"
                      style={{
                        background: 'var(--skeleton-bg, #e5e7eb)',
                        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                      }}
                    />
                    <div
                      className="h-3 w-32 rounded"
                      style={{
                        background: 'var(--skeleton-bg, #e5e7eb)',
                        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
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
        ))}
      </div>
    </div>
  );
}

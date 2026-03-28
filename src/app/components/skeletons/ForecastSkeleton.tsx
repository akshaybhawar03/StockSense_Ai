export function ForecastSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto opacity-70">
      {/* Header placeholder */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl bg-gray-700 animate-pulse"
        />
        <div>
          <div
            className="h-6 w-56 rounded mb-2 bg-gray-700 animate-pulse"
          />
          <div
            className="h-4 w-96 rounded bg-gray-700 animate-pulse"
            style={{ animationDelay: '0.1s' }}
          />
        </div>
      </div>

      {/* Filter placeholder */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
        <div className="h-8 w-48 bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-8 w-48 bg-gray-700 rounded-lg animate-pulse delay-75" />
        <div className="h-8 w-32 bg-gray-700 rounded-lg animate-pulse delay-150 ml-auto" />
      </div>

      {/* Chart area placeholder */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className="h-4 w-64 rounded bg-gray-700 animate-pulse"
          />
          <div
            className="h-6 w-40 rounded-full bg-gray-700 animate-pulse"
          />
        </div>
        {/* Pulsing rectangle height 320px */}
        <div
          className="h-[320px] rounded-lg bg-gray-700 animate-pulse"
          style={{ animationDelay: '0.2s' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Table placeholder */}
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 overflow-hidden">
             <div className="h-4 w-40 rounded bg-gray-700 animate-pulse mb-6" />
             <div className="space-y-4">
                 <div className="h-8 w-full rounded bg-gray-700/50 animate-pulse" />
                 <div className="h-12 w-full rounded bg-gray-700/30 animate-pulse delay-75" />
                 <div className="h-12 w-full rounded bg-gray-700/30 animate-pulse delay-100" />
                 <div className="h-12 w-full rounded bg-gray-700/30 animate-pulse delay-150" />
             </div>
        </div>

        {/* Order window placeholder */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <div
            className="h-6 w-52 rounded mb-3 bg-gray-700 animate-pulse"
          />
          <div
            className="h-4 w-full rounded mb-6 bg-gray-700 animate-pulse"
          />
          <div className="space-y-4">
            <div
              className="h-20 rounded-xl bg-gray-700 animate-pulse"
            />
            <div
              className="h-20 rounded-xl bg-gray-700 animate-pulse"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="h-12 rounded-xl bg-gray-700 animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

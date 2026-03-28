export function ChartSkeleton({ height = 280 }: { height?: number }) {
    return (
        <div 
            className="w-full bg-gray-800/20 rounded-xl animate-pulse"
            style={{ height }}
        />
    );
}

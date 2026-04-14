import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface DataPoint {
    date: string;
    sales: number;
    purchases: number;
}

interface Props {
    data: DataPoint[];
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatINR(val: number) {
    if (val >= 100_000) return '₹' + (val / 100_000).toFixed(1) + 'L';
    if (val >= 1_000)   return '₹' + (val / 1_000).toFixed(1) + 'K';
    return '₹' + val;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.fill }} />
                    <span className="text-gray-500 dark:text-gray-400 capitalize">{entry.name}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {'₹' + Number(entry.value).toLocaleString('en-IN', {
                            minimumFractionDigits: 2, maximumFractionDigits: 2,
                        })}
                    </span>
                </div>
            ))}
        </div>
    );
};

export function SalesPurchaseChart({ data }: Props) {
    const chartData = (data ?? []).map(d => ({
        ...d,
        label: formatDate(d.date),
    }));

    if (!chartData.length) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
                No chart data available yet.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tickFormatter={formatINR}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend
                    wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
                    formatter={(value) => (
                        <span className="text-gray-600 dark:text-gray-300 capitalize">{value}</span>
                    )}
                />
                <Bar dataKey="sales"     name="Sales"     fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

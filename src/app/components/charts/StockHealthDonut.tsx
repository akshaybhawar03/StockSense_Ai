import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartSkeleton } from '../skeletons/ChartSkeleton';

// Custom label renderer — shows percentage inside/outside slice
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if percentage is well defined and not '0.0%'
    if (percentage === '0.0%') return null;

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
            {percentage}
        </text>
    );
};

export default function StockHealthDonut({ data: stockHealthData }: { data: any[] }) {
    if (!stockHealthData || stockHealthData.length === 0) {
        return <ChartSkeleton height={220} />;
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={stockHealthData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    dataKey="value"
                    paddingAngle={2}
                    labelLine={false}
                    label={renderCustomLabel}
                >
                    {stockHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: any, name: any) => [value + ' products', name]}
                    contentStyle={{
                        background: '#1e2433',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        fontSize: 13,
                    }}
                />
                <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                    formatter={(value: any, entry: any) => (
                        <span style={{ color: '#9ca3af' }}>
                            {value}: {entry.payload.value}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

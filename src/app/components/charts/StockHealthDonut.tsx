import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS: Record<string, string> = {
    healthy:'#22c55e', low:'#f59e0b', out_of_stock:'#ef4444', dead_stock:'#6b7280'
};
const LABELS: Record<string, string> = {
    healthy:'Healthy', low:'Low Stock', out_of_stock:'Out of Stock', dead_stock:'Dead Stock'
};

export default function StockHealthDonut({ data }: { data: any }) {
    const chartData = Object.entries(data || {})
        .filter(([,v]: any) => v > 0)
        .map(([k,v]: any) => ({ name: LABELS[k] || k, value: v, key: k }));

    if (!chartData.length)
        return <p className='text-gray-500 text-sm text-center py-8'>No data yet</p>;

    return (
        <ResponsiveContainer width='100%' height={220}>
            <PieChart>
                <Pie data={chartData} cx='50%' cy='50%' innerRadius={55} outerRadius={85} dataKey='value' paddingAngle={2}>
                    {chartData.map(e => <Cell key={e.key} fill={COLORS[e.key] || '#6b7280'} />)}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor:'#1f2937', border:'1px solid #374151', borderRadius:'8px' }}
                    formatter={(v: any, n: any) => [v.toLocaleString('en-IN') + ' items', n]}
                />
                <Legend wrapperStyle={{ fontSize:'12px', color:'#9ca3af' }} />
            </PieChart>
        </ResponsiveContainer>
    );
}

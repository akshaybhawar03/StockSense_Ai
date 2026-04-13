import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartSkeleton } from '../skeletons/ChartSkeleton';

export default function TopProductsBar({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ height: 220 }} className='flex items-center justify-center text-sm font-medium text-gray-500'>
                No top products
            </div>
        );
    }

    return (
        <ResponsiveContainer width='100%' height={220}>
            <BarChart data={data} layout='vertical' margin={{ left: 10 }}>
                <XAxis type='number' tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} />
                <YAxis type='category' dataKey='name' tickFormatter={n => n.length > 16 ? n.slice(0, 16) + '...' : n} tick={{ fontSize: 10, fill: '#6b7280' }} width={110} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} 
                    itemStyle={{ color: '#111827', fontWeight: 500 }}
                    labelStyle={{ color: '#6b7280', paddingBottom: '4px' }}
                    formatter={(v: any) => ['₹' + v.toLocaleString('en-IN'), 'Value']} 
                />
                <Bar dataKey='totalValue' fill='#10b981' radius={[0,4,4,0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

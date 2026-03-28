import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartSkeleton } from '../skeletons/ChartSkeleton';

export default function TopProductsBar({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <ChartSkeleton height={220} />;
    }

    return (
        <ResponsiveContainer width='100%' height={220}>
            <BarChart data={data} layout='vertical' margin={{ left:10 }}>
                <XAxis type='number' tickFormatter={v => '₹'+(v/1000).toFixed(0)+'k'} tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} />
                <YAxis type='category' dataKey='name' tickFormatter={n => n.length > 16 ? n.slice(0,16)+'...' : n} tick={{ fontSize:10, fill:'#9ca3af' }} width={110} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor:'#1f2937', border:'1px solid #374151', borderRadius:'8px' }} formatter={(v: any) => ['₹'+v.toLocaleString('en-IN'), 'Value']} />
                <Bar dataKey='totalValue' fill='#10b981' radius={[0,4,4,0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CategoryBarChart({ data }: { data: any[] }) {
    const sorted = [...(data || [])].sort((a,b) => b.value - a.value).slice(0,8);
    if (!sorted.length)
        return <p className='text-gray-500 text-sm text-center py-8'>No data yet</p>;

    return (
        <ResponsiveContainer width='100%' height={220}>
            <BarChart data={sorted} layout='vertical' margin={{ left:10 }}>
                <XAxis type='number' tickFormatter={v => '₹'+(v/1000).toFixed(0)+'k'} tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} />
                <YAxis type='category' dataKey='category' tick={{ fontSize:11, fill:'#9ca3af' }} width={90} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor:'#1f2937', border:'1px solid #374151', borderRadius:'8px' }} formatter={(v: any) => ['₹'+v.toLocaleString('en-IN'), 'Value']} />
                <Bar dataKey='value' fill='#3b82f6' radius={[0,4,4,0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

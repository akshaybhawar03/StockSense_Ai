import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

export default function LowStockBar({ data }: { data: any[] }) {
    if (!data?.length)
        return <p className='text-gray-500 text-sm text-center py-8'>No data yet</p>;

    return (
        <ResponsiveContainer width='100%' height={220}>
            <BarChart data={data} margin={{ bottom:50 }}>
                <XAxis dataKey='name' tickFormatter={n => n.length > 10 ? n.slice(0,10)+'...' : n} angle={-40} textAnchor='end' tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor:'#1f2937', border:'1px solid #374151', borderRadius:'8px' }} formatter={(v: any) => [v+' units', 'Quantity']} />
                <ReferenceLine y={10} stroke='#ef4444' strokeDasharray='4   4' label={{ value:'Reorder threshold', position:'insideTopRight', fontSize:10, fill:'#ef4444' }} />
                <Bar dataKey='quantity' fill='#f59e0b' radius={[4,4,0,0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

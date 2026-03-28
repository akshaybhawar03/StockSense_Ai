import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { ChartSkeleton } from '../skeletons/ChartSkeleton';

export default function LowStockBar({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <ChartSkeleton height={220} />;
    }

    return (
        <ResponsiveContainer width='100%' height={220}>
            <BarChart data={data} layout='vertical' margin={{ left:10 }}>
                <XAxis type='number' tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} />
                <YAxis type='category' dataKey='name' tickFormatter={n => n.length > 10 ? n.slice(0,10)+'...' : n} tick={{ fontSize:10, fill:'#9ca3af' }} width={110} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor:'#1f2937', border:'1px solid #374151', borderRadius:'8px' }} formatter={(v: any, name: any, props: any) => [`${v} / ${props.payload.threshold}`, 'Stock vs Threshold']} />
                
                {data.some((p: any) => p.threshold > 0) && (
                    <ReferenceLine x={data[0]?.threshold || 10} stroke='#ef4444' strokeDasharray='4 4' label={{ value:'Reorder', position:'insideBottomRight', fontSize:10, fill:'#ef4444' }} />
                )}

                <Bar dataKey='current' radius={[0,4,4,0]}>
                    {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.current < entry.threshold ? '#ef4444' : '#f59e0b'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

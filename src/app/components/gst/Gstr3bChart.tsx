import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { GstTrend } from '../../services/gst';

const formatINR = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v ?? 0);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
            <p className="text-gray-300 font-medium mb-1">{label}</p>
            <p className="text-emerald-400 font-bold">{formatINR(payload[0].value)}</p>
        </div>
    );
};

interface Props {
    data: GstTrend[];
}

export function Gstr3bChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Monthly GST trend (last 6 months)</p>
                <div className="h-56 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                    No trend data available for this period
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Monthly GST trend (last 6 months)</p>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        width={52}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="gst_amount" radius={[6, 6, 0, 0]} maxBarSize={52}>
                        {data.map((_, i) => (
                            <Cell
                                key={i}
                                fill={i === data.length - 1 ? '#10b981' : '#34d399'}
                                opacity={0.85 + (i / data.length) * 0.15}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

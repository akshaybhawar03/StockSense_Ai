import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../../lib/queries';
import { AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

export function LowStockAlert() {
    const { data } = useProducts(1, true); // Fetch first page of only low stock items

    useEffect(() => {
        if (data && data.data.length > 0) {
            toast.custom((t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Low Stock Warning
                                </p>
                                <p className="mt-1 text-sm text-gray-400">
                                    {data.data.length} products are running low.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[rgb(var(--accent-primary))] hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), { duration: 5000, position: 'top-right' });
        }
    }, [data]);

    return null;
}

export const StatusBadge = ({ stock }: { stock: number }) => {
    if (stock === 0) return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm animate-pulse">Critical Out</Badge>;
    if (stock <= 10) return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-sm">Warning Low</Badge>;
    return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0 dark:bg-green-900/40 dark:text-green-400">Stock OK</Badge>;
};

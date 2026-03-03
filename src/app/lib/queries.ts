import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, createProduct, updateProduct, deleteProductBulk, fetchPrediction, fetchStats, fetchMovements } from './api';
import { CreateProduct } from '../types/inventory';

export function useProducts(page: number, lowStock?: boolean) {
    return useQuery({
        queryKey: ['products', page, lowStock],
        queryFn: () => fetchProducts(page, lowStock),
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProduct) => createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<CreateProduct> }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useDeleteProducts() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: number[]) => deleteProductBulk(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function usePrediction(productId: number | null) {
    return useQuery({
        queryKey: ['prediction', productId],
        queryFn: () => productId ? fetchPrediction(productId) : Promise.resolve([]),
        enabled: !!productId,
    });
}

export function useStats() {
    return useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
    });
}

export function useMovements() {
    return useQuery({
        queryKey: ['movements'],
        queryFn: fetchMovements,
    });
}

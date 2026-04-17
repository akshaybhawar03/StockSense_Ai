import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Building2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getLocations, deactivateLocation } from '../../services/locations';
import { useLocation } from '../../contexts/LocationContext';
import { LocationCard } from '../../components/locations/LocationCard';
import { LocationDrawer } from '../../components/locations/LocationDrawer';
import type { Location } from '../../contexts/LocationContext';

type Filter = 'all' | 'active' | 'inactive';

export function LocationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshLocations } = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmDeactivate, setConfirmDeactivate] = useState<Location | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['locations', 'manage'],
    queryFn: () => getLocations({ include_inactive: true }).then(res => {
      const d = res.data;
      return Array.isArray(d) ? d : (d?.items ?? d?.locations ?? d?.data ?? []);
    }),
    staleTime: 30_000,
  });

  const locations: Location[] = data ?? [];

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateLocation(id),
    onSuccess: async (_, id) => {
      toast.success(`Location deactivated`);
      setConfirmDeactivate(null);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      await refreshLocations();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Something went wrong, please try again';
      if (err?.response?.status === 403) toast.error('Access denied');
      else toast.error(msg);
    },
  });

  const filtered = useMemo(() => {
    let list = locations;
    if (filter === 'active') list = list.filter(l => l.is_active);
    if (filter === 'inactive') list = list.filter(l => !l.is_active);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(l => l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q));
    }
    return list;
  }, [locations, filter, search]);

  const handleDrawerSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['locations'] });
    setEditingLocation(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Locations</h1>
        <button
          onClick={() => { setEditingLocation(null); setDrawerOpen(true); }}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[rgb(var(--accent-primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search locations…"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/30"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as Filter)}
          className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-52 animate-pulse border border-gray-100 dark:border-gray-700" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {locations.length === 0 ? 'No locations added yet' : 'No locations match your filters'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-4">
            {locations.length === 0
              ? 'Add your warehouse, godown, or retail shop to start tracking stock by location.'
              : 'Try adjusting your search or filter.'}
          </p>
          {locations.length === 0 && (
            <button
              onClick={() => { setEditingLocation(null); setDrawerOpen(true); }}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[rgb(var(--accent-primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add your first location
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(loc => (
            <LocationCard
              key={loc.id}
              location={loc}
              onEdit={l => { setEditingLocation(l); setDrawerOpen(true); }}
              onDeactivate={l => setConfirmDeactivate(l)}
              onViewInventory={l => navigate(`/dashboard/locations/${l.id}`)}
            />
          ))}
        </div>
      )}

      {/* Deactivate confirm dialog */}
      {confirmDeactivate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setConfirmDeactivate(null); }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Deactivate {confirmDeactivate.name}?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will hide it from all filters. You can reactivate it later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeactivate(null)}
                className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deactivateMutation.mutate(confirmDeactivate.id)}
                disabled={deactivateMutation.isPending}
                className="flex-1 h-9 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deactivateMutation.isPending ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LocationDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingLocation(null); }}
        locationToEdit={editingLocation}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}

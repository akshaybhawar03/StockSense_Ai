import { useLocation } from '../../contexts/LocationContext';

export function LocationSwitcher() {
  const { selectedLocationId, locationsList, setSelectedLocation } = useLocation();
  const activeLocations = locationsList.filter(l => l.is_active);

  // Mobile: render as select dropdown
  const selectEl = (
    <select
      value={selectedLocationId ?? ''}
      onChange={e => {
        const id = e.target.value || null;
        const name = id ? (activeLocations.find(l => l.id === id)?.name ?? '') : '';
        setSelectedLocation(id, name);
      }}
      className="h-8 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))] md:hidden"
    >
      <option value="">All Locations</option>
      {activeLocations.map(l => (
        <option key={l.id} value={l.id}>{l.name}</option>
      ))}
    </select>
  );

  // Desktop: pill button group
  const pillGroup = (
    <div className="hidden md:flex items-center gap-1 flex-wrap">
      <button
        onClick={() => setSelectedLocation(null, '')}
        className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
          !selectedLocationId
            ? 'bg-[rgb(var(--accent-primary))] text-white border-[rgb(var(--accent-primary))]'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-primary))]'
        }`}
      >
        All Locations
      </button>
      {activeLocations.map(loc => (
        <button
          key={loc.id}
          onClick={() => setSelectedLocation(loc.id, loc.name)}
          className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
            selectedLocationId === loc.id
              ? 'bg-[rgb(var(--accent-primary))] text-white border-[rgb(var(--accent-primary))]'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-primary))]'
          }`}
        >
          {loc.name}
        </button>
      ))}
    </div>
  );

  if (activeLocations.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {selectEl}
      {pillGroup}
    </div>
  );
}

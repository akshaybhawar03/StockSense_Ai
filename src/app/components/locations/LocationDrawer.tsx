import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLocation, updateLocation } from '../../services/locations';
import { useLocation } from '../../contexts/LocationContext';
import type { Location } from '../../contexts/LocationContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locationToEdit: Location | null;
  onSuccess: () => void;
}

interface FormState {
  name: string;
  type: 'warehouse' | 'shop' | 'store';
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pin_code: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: '', type: 'warehouse', address_line1: '', address_line2: '',
  city: '', state: '', pin_code: '', is_active: true,
};

export function LocationDrawer({ isOpen, onClose, locationToEdit, onSuccess }: Props) {
  const { locationsList, refreshLocations } = useLocation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'api', string>>>({});
  const [saving, setSaving] = useState(false);

  const isEdit = !!locationToEdit;

  useEffect(() => {
    if (isOpen) {
      if (locationToEdit) {
        setForm({
          name: locationToEdit.name,
          type: locationToEdit.type,
          address_line1: locationToEdit.address_line1,
          address_line2: locationToEdit.address_line2 ?? '',
          city: locationToEdit.city,
          state: locationToEdit.state,
          pin_code: locationToEdit.pin_code ?? '',
          is_active: locationToEdit.is_active,
        });
      } else {
        setForm(EMPTY);
      }
      setErrors({});
    }
  }, [isOpen, locationToEdit]);

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const checkNameUnique = (name: string) => {
    const lower = name.trim().toLowerCase();
    const duplicate = locationsList.find(
      l => l.name.toLowerCase() === lower && l.id !== locationToEdit?.id
    );
    if (duplicate) {
      setErrors(e => ({ ...e, name: 'A location with this name already exists.' }));
    }
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (form.name.trim().length > 100) e.name = 'Name must be under 100 characters.';
    const lower = form.name.trim().toLowerCase();
    const dup = locationsList.find(l => l.name.toLowerCase() === lower && l.id !== locationToEdit?.id);
    if (dup) e.name = 'A location with this name already exists.';
    if (!form.type) e.type = 'Type is required.';
    if (!form.address_line1.trim()) e.address_line1 = 'Address is required.';
    if (!form.city.trim()) e.city = 'City is required.';
    if (!form.state) e.state = 'State is required.';
    if (form.pin_code && !/^[0-9]{6}$/.test(form.pin_code)) e.pin_code = 'PIN code must be exactly 6 digits.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        pin_code: form.pin_code || undefined,
        is_active: form.is_active,
      };
      if (isEdit && locationToEdit) {
        await updateLocation(locationToEdit.id, payload);
        toast.success('Location updated');
        // analytics: location_edited
      } else {
        await createLocation(payload);
        toast.success('Location added successfully');
        // analytics: location_created
      }
      await refreshLocations();
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Something went wrong, please try again';
      if (err?.response?.status === 400) {
        setErrors(e => ({ ...e, api: msg }));
      } else if (err?.response?.status === 403) {
        toast.error('Access denied');
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = (field: keyof FormState) =>
    `w-full h-10 px-3 rounded-lg border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/30 transition-all ${
      errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-[rgb(var(--accent-primary))]'
    }`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Location' : 'Add New Location'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errors.api && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">
              {errors.api}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location Name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              onBlur={() => checkNameUnique(form.name)}
              maxLength={100}
              placeholder="e.g. Main Warehouse"
              className={inputCls('name')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={e => set('type', e.target.value as any)}
              className={inputCls('type')}
            >
              <option value="warehouse">Warehouse</option>
              <option value="shop">Shop</option>
              <option value="store">Store</option>
            </select>
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Address Line 1 *</label>
            <input
              value={form.address_line1}
              onChange={e => set('address_line1', e.target.value)}
              placeholder="Street / Building / Plot"
              className={inputCls('address_line1')}
            />
            {errors.address_line1 && <p className="text-xs text-red-500 mt-1">{errors.address_line1}</p>}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Address Line 2</label>
            <input
              value={form.address_line2}
              onChange={e => set('address_line2', e.target.value)}
              placeholder="Area / Landmark (optional)"
              className={inputCls('address_line2')}
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City *</label>
              <input
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="City"
                className={inputCls('city')}
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">State *</label>
              <select
                value={form.state}
                onChange={e => set('state', e.target.value)}
                className={inputCls('state')}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
            </div>
          </div>

          {/* PIN Code */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">PIN Code</label>
            <input
              value={form.pin_code}
              onChange={e => set('pin_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit PIN (optional)"
              inputMode="numeric"
              className={inputCls('pin_code')}
            />
            {errors.pin_code && <p className="text-xs text-red-500 mt-1">{errors.pin_code}</p>}
          </div>

          {/* Is Active toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Active</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inactive locations are hidden from filters</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.is_active ? 'bg-[rgb(var(--accent-primary))]' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 h-10 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 h-10 rounded-lg bg-[rgb(var(--accent-primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : isEdit ? 'Update Location' : 'Add Location'}
          </button>
        </div>
      </div>
    </>
  );
}

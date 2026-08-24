import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';

const empty = {
  label: '',
  description: '',
  hasSizes: false,
  hasColors: false,
  sizePresetText: '',
  colorPresetText: '',
  isActive: true,
};

export default function AdminProductTypes() {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await adminAPI.getProductTypesAdmin();
    setTypes(res?.data?.types || []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onEdit = (t) => {
    setEditingId(t._id);
    setForm({
      label: t.label || '',
      description: t.description || '',
      hasSizes: !!t.hasSizes,
      hasColors: !!t.hasColors,
      sizePresetText: (t.sizePreset || []).join(', '),
      colorPresetText: (t.colorPreset || []).join(', '),
      isActive: t.isActive !== false,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error('Enter a type name');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        description: form.description,
        hasSizes: form.hasSizes,
        hasColors: form.hasColors,
        sizePreset: form.sizePresetText,
        colorPreset: form.colorPresetText,
        isActive: form.isActive,
      };
      if (editingId) {
        await adminAPI.updateProductType(editingId, payload);
        toast.success('Product type updated');
      } else {
        await adminAPI.createProductType(payload);
        toast.success('Product type created');
      }
      reset();
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (t) => {
    if (!confirm(`Delete type “${t.label}”?`)) return;
    try {
      await adminAPI.deleteProductType(t._id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout
      title="Product types"
      subtitle="Create types yourself. Tick Size / Colour — presets like 40, 41, 42 for shoes."
    >
      <form onSubmit={onSubmit} className="admin-card p-6 mb-6 max-w-3xl space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Type name</label>
            <input
              required
              className="admin-input w-full mt-1"
              placeholder="e.g. Shoes, Perfume, Bags"
              value={form.label}
              onChange={(e) => setField('label', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Description</label>
            <input
              className="admin-input w-full mt-1"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Short note for admins"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.hasSizes}
              onChange={(e) => setField('hasSizes', e.target.checked)}
            />
            Has sizes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.hasColors}
              onChange={(e) => setField('hasColors', e.target.checked)}
            />
            Has colours
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setField('isActive', e.target.checked)}
            />
            Active
          </label>
        </div>

        {form.hasSizes ? (
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">
              Size presets (comma separated)
            </label>
            <input
              className="admin-input w-full mt-1"
              placeholder="e.g. 38, 39, 40, 41, 42, 43  or  S, M, L, XL"
              value={form.sizePresetText}
              onChange={(e) => setField('sizePresetText', e.target.value)}
            />
            <p className="text-[11px] text-[#6b6560] mt-1">
              These appear as quick buttons when adding a product. You can still add custom sizes there.
            </p>
          </div>
        ) : null}

        {form.hasColors ? (
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">
              Colour presets (comma separated)
            </label>
            <input
              className="admin-input w-full mt-1"
              placeholder="e.g. Black, Brown, White"
              value={form.colorPresetText}
              onChange={(e) => setField('colorPresetText', e.target.value)}
            />
          </div>
        ) : null}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="admin-btn-primary px-5 py-2.5 disabled:opacity-60">
            {saving ? 'Saving…' : editingId ? 'Update type' : 'Add product type'}
          </button>
          {editingId ? (
            <button type="button" onClick={reset} className="px-4 py-2 border rounded-lg text-sm">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {types.map((t) => (
          <div key={t._id || t.key} className="admin-card p-4">
            <p className="font-medium text-[#141210]">{t.label}</p>
            <p className="text-[10px] text-[#8a7350] mt-0.5">key: {t.key}</p>
            <p className="text-xs text-[#6b6560] mt-2 line-clamp-2">{t.description || '—'}</p>
            <p className="text-[11px] mt-2 text-[#6b6560]">
              {t.hasSizes ? 'Sizes ✓' : 'No sizes'} · {t.hasColors ? 'Colours ✓' : 'No colours'}
              {t.isActive === false ? ' · Inactive' : ''}
            </p>
            {t.hasSizes && (t.sizePreset || []).length > 0 ? (
              <p className="text-[11px] mt-1 text-[#8a7350]">Sizes: {(t.sizePreset || []).join(', ')}</p>
            ) : null}
            <div className="mt-3 flex gap-3 text-sm">
              <button type="button" onClick={() => onEdit(t)} className="text-[#9a7a4f] hover:underline">
                Edit
              </button>
              <button type="button" onClick={() => onDelete(t)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {types.length === 0 && (
          <div className="admin-card p-8 text-center text-[#6b6560] sm:col-span-2 xl:col-span-3">
            No product types yet.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

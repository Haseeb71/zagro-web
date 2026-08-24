import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';
import { mediaUrl } from '../../../utils/mediaUrl';
import { PRODUCT_TYPE_LIST } from '../../../config/productTypes';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [typeList, setTypeList] = useState(PRODUCT_TYPE_LIST);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [productTypes, setProductTypes] = useState(['watch']);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await adminAPI.getBrands();
    setBrands(res?.data?.brands || []);
  };

  useEffect(() => {
    load();
    adminAPI.getProductTypes().then((res) => {
      const list = res?.data?.types || [];
      if (list.length) setTypeList(list);
    });
  }, []);

  const reset = () => {
    setName('');
    setDescription('');
    setLogo(null);
    setProductTypes([typeList[0]?.key || 'watch']);
    setEditingId(null);
  };

  const toggleType = (key) => {
    setProductTypes((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!productTypes.length) {
      toast.error('Select at least one product type');
      return;
    }
    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    fd.append('isActive', 'true');
    fd.append('productTypes', JSON.stringify(productTypes));
    if (logo) fd.append('logo', logo);

    if (editingId) {
      await adminAPI.updateBrand(editingId, fd);
      toast.success('Brand updated');
    } else {
      await adminAPI.createBrand(fd);
      toast.success('Brand added');
    }
    reset();
    load();
  };

  const onEdit = (brand) => {
    setEditingId(brand._id);
    setName(brand.name);
    setDescription(brand.description || '');
    setProductTypes(Array.isArray(brand.productTypes) && brand.productTypes.length
      ? brand.productTypes
      : [typeList[0]?.key || 'watch']);
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this brand?')) return;
    await adminAPI.deleteBrand(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout
      title="Brands"
      subtitle="Tag each brand with product types — watch brands won’t appear on suits."
    >
      <form onSubmit={onSubmit} className="admin-card p-6 mb-6 grid sm:grid-cols-2 gap-4 max-w-3xl">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Brand name</label>
          <input required className="admin-input w-full mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rolex or Raymond" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Logo / photo</label>
          <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Sells which types?</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {typeList.map((t) => {
              const on = productTypes.includes(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleType(t.key)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    on ? 'bg-[#141210] text-white border-[#141210]' : 'border-black/15'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Description</label>
          <textarea className="admin-input w-full mt-1 min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" className="admin-btn-primary px-5 py-2.5 text-sm">
            {editingId ? 'Update brand' : 'Add brand'}
          </button>
          {editingId ? (
            <button type="button" onClick={reset} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
          ) : null}
        </div>
      </form>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {brands.map((b) => (
          <div key={b._id} className="admin-card overflow-hidden">
            <div className="h-32 bg-[#f3efe8] flex items-center justify-center p-4">
              {mediaUrl(b.logo) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(b.logo)} alt={b.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="font-display text-2xl text-[#141210]">{b.name}</span>
              )}
            </div>
            <div className="p-4">
              <p className="font-medium text-[#141210]">{b.name}</p>
              <p className="text-[10px] text-[#8a7350] mt-1">
                {(b.productTypes || []).join(', ') || 'No type tagged'}
              </p>
              <p className="text-xs text-[#6b6560] mt-1 line-clamp-2">{b.description}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button type="button" onClick={() => onEdit(b)} className="text-[#9a7a4f] hover:underline">Edit</button>
                <button type="button" onClick={() => onDelete(b._id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {brands.length === 0 && (
          <div className="admin-card p-8 text-center text-[#6b6560] sm:col-span-2 xl:col-span-3">
            No brands yet.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

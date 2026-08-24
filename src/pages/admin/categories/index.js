import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';
import { mediaUrl } from '../../../utils/mediaUrl';
import { PRODUCT_TYPE_LIST } from '../../../config/productTypes';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [typeList, setTypeList] = useState(PRODUCT_TYPE_LIST);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('');
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await adminAPI.getCategories();
    setCategories(res?.data?.categories || []);
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
    setProductType('');
    setImage(null);
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    fd.append('productType', productType || '');
    if (image) fd.append('image', image);

    if (editingId) {
      await adminAPI.updateCategory(editingId, fd);
      toast.success('Category updated');
    } else {
      await adminAPI.createCategory(fd);
      toast.success('Category created');
    }
    reset();
    load();
  };

  const onEdit = (c) => {
    setEditingId(c._id);
    setName(c.name);
    setDescription(c.description || '');
    setProductType(c.productType || '');
  };

  const onDelete = async (id) => {
    if (!confirm('Delete category?')) return;
    await adminAPI.deleteCategory(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout
      title="Categories"
      subtitle="Link each category to a product type so brand filters stay correct (e.g. Suits → Apparel)."
    >
      <form onSubmit={onSubmit} className="admin-card p-5 mb-6 grid sm:grid-cols-2 gap-3 max-w-3xl">
        <input required placeholder="Name" className="admin-input" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="file" accept="image/*" className="text-sm" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        <input placeholder="Description" className="admin-input sm:col-span-2" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Product type (for brand filter)</label>
          <select className="admin-input w-full mt-1" value={productType} onChange={(e) => setProductType(e.target.value)}>
            <option value="">None</option>
            {typeList.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" className="admin-btn-primary px-4 py-2">
            {editingId ? 'Update category' : 'Add category'}
          </button>
          {editingId ? (
            <button type="button" onClick={reset} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          ) : null}
        </div>
      </form>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="admin-card overflow-hidden">
            <div className="h-36 bg-[#f3efe8]">
              {mediaUrl(c.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(c.image)} alt={c.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-4">
              <p className="font-medium text-[#141210]">{c.name}</p>
              <p className="text-[10px] text-[#8a7350] mt-1">
                type: {c.productType || '—'} · {c.slug}
              </p>
              <p className="text-xs text-[#6b6560] mt-1 line-clamp-2">{c.description}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button type="button" onClick={() => onEdit(c)} className="text-[#9a7a4f] hover:underline">Edit</button>
                <button type="button" onClick={() => onDelete(c._id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

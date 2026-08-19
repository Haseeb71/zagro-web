import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';
import { mediaUrl } from '../../../utils/mediaUrl';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await adminAPI.getCategories();
    setCategories(res?.data?.categories || []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setName('');
    setDescription('');
    setImage(null);
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
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
      subtitle="Upload a photo per collection (Men / Women / Kids). Images show on the homepage."
    >
      <form onSubmit={onSubmit} className="admin-card p-5 mb-6 grid sm:grid-cols-2 gap-3 max-w-3xl">
        <input required placeholder="Name" className="admin-input" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="file" accept="image/*" className="text-sm" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        <input placeholder="Description" className="admin-input sm:col-span-2" value={description} onChange={(e) => setDescription(e.target.value)} />
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
            <div className="h-36 bg-[#ebe7e0]">
              {mediaUrl(c.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(c.image)} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-[#6b6560]">No photo</div>
              )}
            </div>
            <div className="p-4">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-[#6b6560] mt-1">{c.slug}</p>
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

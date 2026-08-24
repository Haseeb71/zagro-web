import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';
import brandsAPI from '../../../APIs/brands';
import { PRODUCT_TYPE_LIST, getProductTypeConfig } from '../../../config/productTypes';

const emptyForm = {
  name: '',
  price: '',
  originalPrice: '',
  quantity: '',
  description: '',
  category: '',
  brand: '',
  productType: 'simple',
  isActive: true,
  isFeatured: false,
  isNew: true,
  isBestSeller: false,
  isTrending: false,
  isSpecial: false,
};

export default function AdminProductForm() {
  const router = useRouter();
  const { id } = router.query;
  const isEdit = Boolean(id) && id !== 'new';
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  /** { file, url }[] for new uploads with preview */
  const [imageItems, setImageItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sizeStock, setSizeStock] = useState({});
  const [colorStock, setColorStock] = useState({});
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState('');

  const typeConfig = getProductTypeConfig(form.productType);

  const computedDiscount = useMemo(() => {
    const sale = Number(form.price);
    const original = Number(form.originalPrice);
    if (original > sale && sale > 0) {
      return Math.round(((original - sale) / original) * 100);
    }
    return 0;
  }, [form.price, form.originalPrice]);

  const sizeTotal = useMemo(() => {
    if (!typeConfig.hasSizes) return Number(form.quantity) || 0;
    return Object.values(sizeStock).reduce((s, n) => s + (Number(n) || 0), 0);
  }, [typeConfig.hasSizes, sizeStock, form.quantity]);

  useEffect(() => {
    adminAPI.getCategories().then((cRes) => {
      setCategories(cRes?.data?.categories || []);
    });
  }, []);

  useEffect(() => {
    brandsAPI.getAll({ productType: form.productType || undefined }).then((bRes) => {
      setBrands(bRes?.data?.brands || []);
    });
  }, [form.productType]);

  useEffect(() => {
    if (!isEdit || !id) return;
    adminAPI.getProductById(id).then((res) => {
      const p = res?.data?.product;
      if (!p) return;
      setForm({
        name: p.name || '',
        price: p.price ?? '',
        originalPrice: p.originalPrice ?? '',
        quantity: p.quantity ?? '',
        description: p.description || '',
        category: p.category?._id || p.category || '',
        brand: p.brand?._id || p.brand || '',
        productType: p.productType || 'simple',
        isActive: p.isActive !== false,
        isFeatured: !!p.isFeatured,
        isNew: !!p.isNew,
        isBestSeller: !!p.isBestSeller,
        isTrending: !!p.isTrending,
        isSpecial: !!p.isSpecial,
      });
      const sq = p.sizeQuantities && typeof p.sizeQuantities === 'object' ? p.sizeQuantities : {};
      if (Object.keys(sq).length) {
        const mapped = {};
        Object.entries(sq).forEach(([k, v]) => {
          mapped[k] = String(v);
        });
        setSizeStock(mapped);
      } else if (Array.isArray(p.sizes) && p.sizes.length) {
        const mapped = {};
        p.sizes.forEach((s) => {
          mapped[s] = '';
        });
        setSizeStock(mapped);
      }
      const cq = p.colorQuantities && typeof p.colorQuantities === 'object' ? p.colorQuantities : {};
      if (Object.keys(cq).length) {
        const mapped = {};
        Object.entries(cq).forEach(([k, v]) => {
          mapped[k] = String(v);
        });
        setColorStock(mapped);
      }
    });
  }, [id, isEdit]);

  useEffect(() => {
    return () => {
      imageItems.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onProductTypeChange = (nextType) => {
    setField('productType', nextType);
    setField('brand', '');
    const cfg = getProductTypeConfig(nextType);
    if (!cfg.hasSizes) setSizeStock({});
    else if (cfg.sizePreset.length && Object.keys(sizeStock).length === 0) {
      const mapped = {};
      cfg.sizePreset.forEach((s) => {
        mapped[s] = '';
      });
      setSizeStock(mapped);
    }
    if (!cfg.hasColors) setColorStock({});
    else if (cfg.colorPreset.length && Object.keys(colorStock).length === 0) {
      const mapped = {};
      cfg.colorPreset.forEach((c) => {
        mapped[c] = '';
      });
      setColorStock(mapped);
    }
  };

  const toggleKey = (setter, key) => {
    setter((prev) => {
      const next = { ...prev };
      if (next[key] != null) delete next[key];
      else next[key] = '';
      return next;
    });
  };

  const addCustomKey = (setter, value, clear) => {
    const s = value.trim();
    if (!s) return;
    setter((prev) => ({ ...prev, [s]: prev[s] ?? '' }));
    clear('');
  };

  const onImagesPick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setImageItems((prev) => [...prev, ...next]);
    e.target.value = '';
  };

  const removeImage = (id) => {
    setImageItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sale = Number(form.price);
      const original = Number(form.originalPrice);
      const hasDiscount = original > sale && sale > 0;
      const cfg = getProductTypeConfig(form.productType);

      const sizes = cfg.hasSizes ? Object.keys(sizeStock) : [];
      const sizeQuantities = {};
      if (cfg.hasSizes) {
        if (!sizes.length) {
          toast.error('Select at least one size for this product type');
          setSaving(false);
          return;
        }
        sizes.forEach((s) => {
          sizeQuantities[s] = Number(sizeStock[s]) || 0;
        });
        if (Object.values(sizeQuantities).every((n) => n <= 0)) {
          toast.error('Enter stock for at least one size');
          setSaving(false);
          return;
        }
      }

      const colors = cfg.hasColors ? Object.keys(colorStock) : [];
      const colorQuantities = {};
      if (cfg.hasColors && colors.length) {
        colors.forEach((c) => {
          colorQuantities[c] = Number(colorStock[c]) || 0;
        });
      }

      let quantity = Number(form.quantity) || 0;
      if (cfg.hasSizes) quantity = sizeTotal;
      else if (cfg.hasColors && colors.length) {
        quantity = Object.values(colorQuantities).reduce((s, n) => s + n, 0) || quantity;
      }

      const payload = {
        ...form,
        quantity,
        isDiscounted: hasDiscount,
        discountPercentage: hasDiscount ? computedDiscount : 0,
        originalPrice: hasDiscount ? original : '',
        sizes: JSON.stringify(sizes),
        sizeQuantities: JSON.stringify(sizeQuantities),
        colorQuantities: JSON.stringify(colorQuantities),
      };

      const fd = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === '' && (key === 'brand' || key === 'originalPrice')) return;
        fd.append(key, String(value));
      });
      imageItems.forEach((item) => fd.append('images', item.file));

      if (isEdit) {
        await adminAPI.updateProduct(id, fd);
        toast.success('Product updated');
      } else {
        if (!imageItems.length) {
          toast.error('Add at least one product image');
          setSaving(false);
          return;
        }
        await adminAPI.createProduct(fd);
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit product' : 'Add product'} subtitle="Product type controls sizes, colours, and stock fields.">
      <form onSubmit={onSubmit} className="admin-card p-6 max-w-3xl space-y-5">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Product type</label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRODUCT_TYPE_LIST.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onProductTypeChange(t.key)}
                className={`text-left rounded-xl border px-3 py-2.5 transition ${
                  form.productType === t.key
                    ? 'border-[#c4a574] bg-[#c4a574]/15'
                    : 'border-black/10 hover:border-[#c4a574]/50'
                }`}
              >
                <p className="text-sm font-medium text-[#141210]">{t.label}</p>
                <p className="text-[11px] text-[#6b6560] mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Name</label>
            <input required className="admin-input w-full mt-1" value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Sale price (Rs)</label>
            <input required type="number" min="0" className="admin-input w-full mt-1" value={form.price} onChange={(e) => setField('price', e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Original price (Rs)</label>
            <input type="number" min="0" className="admin-input w-full mt-1" value={form.originalPrice} onChange={(e) => setField('originalPrice', e.target.value)} placeholder="Optional MRP" />
            <p className="text-xs text-[#6b6560] mt-1">
              {computedDiscount > 0 ? `${computedDiscount}% off` : 'Leave empty if no discount'}
            </p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Category</label>
            <select required className="admin-input w-full mt-1" value={form.category} onChange={(e) => setField('category', e.target.value)}>
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Brand</label>
            <select className="admin-input w-full mt-1" value={form.brand} onChange={(e) => setField('brand', e.target.value)}>
              <option value="">None</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-[#6b6560] mt-1">Only brands tagged for this product type</p>
          </div>

          {!typeConfig.hasSizes && !typeConfig.hasColors ? (
            <div>
              <label className="text-xs uppercase tracking-wider text-[#8a7350]">Quantity</label>
              <input required type="number" min="0" className="admin-input w-full mt-1" value={form.quantity} onChange={(e) => setField('quantity', e.target.value)} />
            </div>
          ) : null}

          {typeConfig.hasSizes ? (
            <div className="sm:col-span-2 rounded-xl border border-[#c4a574]/35 bg-[#c4a574]/5 p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8a7350]">Sizes & stock</p>
                <p className="text-[11px] text-[#6b6560] mt-0.5">Total units: {sizeTotal}</p>
              </div>
              {typeConfig.sizePreset.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {typeConfig.sizePreset.map((s) => {
                    const on = sizeStock[s] != null;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleKey(setSizeStock, s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          on ? 'bg-[#141210] text-white border-[#141210]' : 'border-black/15'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className="admin-input flex-1"
                  placeholder="Custom size"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomKey(setSizeStock, customSize, setCustomSize);
                    }
                  }}
                />
                <button type="button" onClick={() => addCustomKey(setSizeStock, customSize, setCustomSize)} className="px-3 py-2 border rounded-lg text-sm">
                  Add
                </button>
              </div>
              {Object.keys(sizeStock).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(sizeStock).map((s) => (
                    <label key={s} className="block">
                      <span className="text-[11px] text-[#6b6560]">Qty — {s}</span>
                      <input
                        type="number"
                        min="0"
                        className="admin-input w-full mt-1"
                        value={sizeStock[s]}
                        onChange={(e) => setSizeStock((prev) => ({ ...prev, [s]: e.target.value }))}
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6b6560]">Select sizes above to enter stock.</p>
              )}
            </div>
          ) : null}

          {typeConfig.hasColors ? (
            <div className="sm:col-span-2 rounded-xl border border-black/10 bg-black/[0.02] p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8a7350]">Colours & stock</p>
                <p className="text-[11px] text-[#6b6560] mt-0.5">Optional — leave empty if colour does not apply</p>
              </div>
              {typeConfig.colorPreset.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {typeConfig.colorPreset.map((c) => {
                    const on = colorStock[c] != null;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleKey(setColorStock, c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          on ? 'bg-[#141210] text-white border-[#141210]' : 'border-black/15'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className="admin-input flex-1"
                  placeholder="Custom colour"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomKey(setColorStock, customColor, setCustomColor);
                    }
                  }}
                />
                <button type="button" onClick={() => addCustomKey(setColorStock, customColor, setCustomColor)} className="px-3 py-2 border rounded-lg text-sm">
                  Add
                </button>
              </div>
              {Object.keys(colorStock).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(colorStock).map((c) => (
                    <label key={c} className="block">
                      <span className="text-[11px] text-[#6b6560]">Qty — {c}</span>
                      <input
                        type="number"
                        min="0"
                        className="admin-input w-full mt-1"
                        value={colorStock[c]}
                        onChange={(e) => setColorStock((prev) => ({ ...prev, [c]: e.target.value }))}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
              {!typeConfig.hasSizes ? (
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#8a7350]">Fallback quantity</label>
                  <input type="number" min="0" className="admin-input w-full mt-1" value={form.quantity} onChange={(e) => setField('quantity', e.target.value)} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Description</label>
            <textarea className="admin-input w-full mt-1 min-h-28" value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Images</label>
            <input type="file" accept="image/*" multiple className="mt-2 text-sm" onChange={onImagesPick} />
            <p className="text-[11px] text-[#6b6560] mt-1">Select multiple images. Click × on a preview to remove it.</p>
            {imageItems.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {imageItems.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-black/10 bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/75 text-white text-sm leading-none"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['isNew', 'New'],
            ['isBestSeller', 'Bestseller'],
            ['isTrending', 'Trending'],
            ['isFeatured', 'Featured'],
            ['isSpecial', 'Special'],
            ['isActive', 'Active'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input type="checkbox" checked={!!form[key]} onChange={(e) => setField(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="admin-btn-primary px-5 py-2.5 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save product'}
          </button>
          <button type="button" onClick={() => router.push('/admin/products')} className="px-5 py-2.5 border rounded-lg">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

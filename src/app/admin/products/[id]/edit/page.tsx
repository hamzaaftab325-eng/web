"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, X, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Category { id: string; name: string; slug: string; }
interface ImageEntry { id?: string; url: string; altText: string; }

export default function AdminProductEdit() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [badge, setBadge] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [inStock, setInStock] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [materials, setMaterials] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [images, setImages] = useState<ImageEntry[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(data => setCategories(data.categories ?? []))
      .catch(() => {});

    fetch(`/api/admin/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(p => {
        setName(p.name ?? "");
        setSlug(p.slug ?? "");
        setSubtitle(p.subtitle ?? "");
        setDescription(p.description ?? "");
        setLongDescription(p.longDescription ?? "");
        setPrice(p.price != null ? String(p.price) : "");
        setCompareAtPrice(p.compareAtPrice != null ? String(p.compareAtPrice) : "");
        setCategorySlug(p.categorySlug ?? "");
        setBadge(p.badge ?? "");
        setStockQuantity(String(p.stockQuantity ?? 0));
        setInStock(!!p.inStock);
        setIsActive(!!p.isActive);
        setFeatured(!!p.featured);
        setMaterials(Array.isArray(p.materials) ? p.materials.join(", ") : "");
        setDimensions(p.dimensions ?? "");
        setCareInstructions(p.careInstructions ?? "");
        setSortOrder(String(p.sortOrder ?? 0));
        setImages((p.images ?? []).map((i: { id?: string; url: string; altText?: string | null }) => ({ id: i.id, url: i.url, altText: i.altText ?? "" })));
      })
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "aura-living/products");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Upload failed");
        }
        const data = await res.json();
        setImages(prev => [...prev, { url: data.url, altText: "" }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = {
        name, slug,
        subtitle: subtitle || null,
        description,
        longDescription: longDescription || null,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        categorySlug: categorySlug || null,
        badge: badge || null,
        stockQuantity: Number(stockQuantity),
        inStock, isActive, featured,
        materials: materials ? materials.split(",").map(m => m.trim()).filter(Boolean) : [],
        dimensions: dimensions || null,
        careInstructions: careInstructions || null,
        sortOrder: Number(sortOrder),
        images: images.map(({ url, altText }) => ({ url, altText: altText || undefined })),
      };
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update");
      }
      router.push("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Deactivate (soft-delete) this product?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      router.push("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8"><div className="aura-loader-ring"><span className="aura-loader-dot" /></div></div>;

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/admin/products" className="inline-flex items-center gap-2 t-label-caps c-ink-faint hover:c-ink mb-6">
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="t-display-md c-ink mb-8">Edit Product</h1>

      {error && (
        <div className="bg-error/10 border border-error/30 c-error p-4 rounded-sm mb-6 t-body-sm">{error}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <Section title="Basic Info">
          <Field label="Name *">
            <input required value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Slug *">
            <input required value={slug} onChange={e => setSlug(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Subtitle">
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Description *" full>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputCls} />
          </Field>
          <Field label="Long Description" full>
            <textarea value={longDescription} onChange={e => setLongDescription(e.target.value)} rows={6} className={inputCls} />
          </Field>
        </Section>

        <Section title="Pricing & Inventory">
          <Field label="Price (PKR) *">
            <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Compare-at Price (PKR)">
            <input type="number" step="0.01" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Stock Quantity">
            <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Badge">
            <input value={badge} onChange={e => setBadge(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={categorySlug} onChange={e => setCategorySlug(e.target.value)} className={inputCls}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Sort Order">
            <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={inputCls} />
          </Field>
          <div className="flex flex-wrap gap-6 col-span-full">
            <Toggle label="In Stock" checked={inStock} onChange={setInStock} />
            <Toggle label="Active" checked={isActive} onChange={setIsActive} />
            <Toggle label="Featured" checked={featured} onChange={setFeatured} />
          </div>
        </Section>

        <Section title="Materials & Care">
          <Field label="Materials (comma-separated)" full>
            <input value={materials} onChange={e => setMaterials(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Dimensions">
            <input value={dimensions} onChange={e => setDimensions(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Care Instructions" full>
            <textarea value={careInstructions} onChange={e => setCareInstructions(e.target.value)} rows={3} className={inputCls} />
          </Field>
        </Section>

        <Section title="Images">
          <div className="col-span-full">
            <label className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2.5 rounded-sm cursor-pointer hover:bg-gold-deep transition-colors">
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload Images"}
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={e => handleFileUpload(e.target.files)} disabled={uploading} />
            </label>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    { }
                    <img src={img.url} alt={img.altText} className="w-full aspect-square object-cover border border-hairline-cream rounded-sm" />
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-ink c-paper p-1 rounded-full hover:bg-error transition-colors">
                      <X size={12} />
                    </button>
                    <input value={img.altText} onChange={e => setImages(images.map((x, idx) => idx === i ? { ...x, altText: e.target.value } : x))}
                      placeholder="Alt text" className="w-full mt-2 px-2 py-1 t-caption c-ink bg-paper border border-hairline-cream rounded-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <div className="flex items-center gap-4 pt-4 border-t border-hairline-cream">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
            <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={onDelete} disabled={deleting}
            className="inline-flex items-center gap-2 bg-error/10 c-error t-label-caps px-4 py-3 rounded-sm hover:bg-error hover:c-paper transition-colors disabled:opacity-50">
            <Trash2 size={14} /> {deleting ? "Deleting..." : "Deactivate"}
          </button>
          <Link href="/admin/products" className="t-label-caps c-ink-faint hover:c-ink">Cancel</Link>
          {price && <span className="t-body c-ink-faint ml-auto">Preview: {formatPrice(Number(price))}</span>}
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
      <h2 className="t-headline-sm c-ink mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-full" : ""}`}>
      <span className="t-label-caps c-ink-faint block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-gold-deep" />
      <span className="t-body c-ink">{label}</span>
    </label>
  );
}

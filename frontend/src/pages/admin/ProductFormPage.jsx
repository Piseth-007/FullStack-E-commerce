import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ImageOff,
  Loader2,
  Package,
  Save,
  Tag,
  Truck,
  Upload,
  X,
} from "lucide-react";
import api from "../../api/axios";
import { ToastContext } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

const initialForm = {
  category_id: "",
  brand_id: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  discount: "",
  free_delivery: false,
};

export default function ProductFormPage() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useContext(ToastContext);

  const isEdit = Boolean(productId);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [skinTypes, setSkinTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedSkinTypeIds, setSelectedSkinTypeIds] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);

  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const busy = saving || uploading;

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setError("");

      try {
        const requests = [
          api.get("/categories"),
          api.get("/brands"),
          api.get("/skin-types"),
        ];

        if (isEdit) {
          requests.push(api.get(`/products/${productId}`));
        }

        const results = await Promise.all(requests);

        setCategories(results[0].data?.data || results[0].data || []);
        setBrands(results[1].data?.data || results[1].data || []);
        setSkinTypes(results[2].data?.data || results[2].data || []);

        if (isEdit) {
          const product = results[3].data?.data || results[3].data;

          setForm({
            category_id: product.category_id ?? "",
            brand_id: product.brand_id ?? "",
            name: product.name ?? "",
            description: product.description ?? "",
            price: product.price ?? "",
            stock: product.stock ?? "",
            discount: product.discount ?? "",
            free_delivery: Boolean(product.free_delivery),
          });

          setImages(product.images ?? []);

          setSelectedSkinTypeIds(
            (product.skinTypes || product.skin_types || []).map(
              (item) => item.id,
            ),
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            t("admin_prod_err_load", "Failed to load product information."),
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [productId, isEdit, t]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) setError("");
  };

  const toggleSkinType = (skinTypeId) => {
    setSelectedSkinTypeIds((prev) =>
      prev.includes(skinTypeId)
        ? prev.filter((id) => id !== skinTypeId)
        : [...prev, skinTypeId],
    );
  };

  const validateForm = () => {
    if (!form.category_id) {
      setError(t("admin_prod_val_cat", "Please select a category."));
      return false;
    }

    if (!form.name.trim()) {
      setError(t("admin_prod_val_name", "Please enter a product name."));
      return false;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError(t("admin_prod_val_price", "Please enter a valid price."));
      return false;
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      setError(t("admin_prod_val_stock", "Please enter a valid stock quantity."));
      return false;
    }

    if (
      form.discount !== "" &&
      (Number(form.discount) < 0 || Number(form.discount) > 100)
    ) {
      setError(t("admin_prod_val_disc", "Discount must be between 0 and 100."));
      return false;
    }

    return true;
  };

  const uploadProductImages = async (productIdForUpload, items) => {
    if (!items.length) return;

    const formData = new FormData();
    items.forEach((item) => {
      formData.append("images[]", item.file);
    });

    await api.post(`/products/${productIdForUpload}/images`, formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        category_id: form.category_id,
        brand_id: form.brand_id || null,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        discount: form.discount === "" ? 0 : Number(form.discount),
        free_delivery: form.free_delivery,
        skin_type_ids: selectedSkinTypeIds,
      };

      if (isEdit) {
        await api.put(`/products/${productId}`, payload);

        if (selectedFiles.length > 0) {
          setUploading(true);
          await uploadProductImages(productId, selectedFiles);
          setUploading(false);
        }

        showToast(
          t("admin_prod_toast_updated", "Product updated successfully."),
          "success",
        );
        navigate("/admin/products");
        return;
      }

      const res = await api.post("/products", payload);
      const newProductId = res.data?.data?.id || res.data?.id;

      if (!newProductId) {
        throw new Error(
          "Product was created successfully but no ID was returned.",
        );
      }

      if (selectedFiles.length > 0) {
        setUploading(true);
        await uploadProductImages(newProductId, selectedFiles);
        setUploading(false);
      }

      showToast(
        t("admin_prod_toast_created", "Product created successfully."),
        "success",
      );
      navigate("/admin/products");
    } catch (err) {
      setUploading(false);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("admin_prod_toast_err", "Failed to save product."),
      );
    } finally {
      setSaving(false);
    }
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setImageError("");

    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024,
    );

    if (!validFiles.length) {
      setImageError(
        t(
          "admin_prod_err_format",
          "Please select valid JPG, PNG, or WEBP images smaller than 5MB.",
        ),
      );
      return;
    }

    if (validFiles.length !== files.length) {
      setImageError(
        t(
          "admin_prod_err_skipped",
          "Some files were skipped. Only images smaller than 5MB are allowed.",
        ),
      );
    }

    const newFiles = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e) => {
    addFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (busy) return;
    addFiles(e.dataTransfer.files);
  };

  const removeSelectedFile = (fileId) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((item) => item.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((item) => item.id !== fileId);
    });
  };

  const handleImageDelete = async (publicId) => {
    if (!publicId || deletingImage) return;

    setImageError("");
    setDeletingImage(publicId);

    try {
      const res = await api.delete(`/products/${productId}/images`, {
        data: { public_id: publicId },
      });
      setImages(res.data?.images || []);
    } catch (err) {
      setImageError(
        err.response?.data?.message ||
          t("admin_prod_err_del_img", "Failed to delete image."),
      );
    } finally {
      setDeletingImage(null);
    }
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [selectedFiles]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => String(c.id) === String(form.category_id));
  }, [categories, form.category_id]);

  const selectedBrand = useMemo(() => {
    return brands.find((b) => String(b.id) === String(form.brand_id));
  }, [brands, form.brand_id]);

  const previewPrimaryImage = useMemo(() => {
    if (images.length > 0) {
      const primary = images.find((img) => img.is_primary);
      return primary?.url || images[0].url;
    }
    if (selectedFiles.length > 0) {
      return selectedFiles[0].preview;
    }
    return null;
  }, [images, selectedFiles]);

  const calculatedDiscountPrice = useMemo(() => {
    const rawPrice = Number(form.price) || 0;
    const rawDiscount = Number(form.discount) || 0;
    if (rawDiscount <= 0 || rawDiscount > 100) return rawPrice;
    return rawPrice * (1 - rawDiscount / 100);
  }, [form.price, form.discount]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-stone">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-ink"
            >
              <ArrowLeft size={13} />
              <span>{t("admin_prod_modal_products", "Products")}</span>
            </Link>
            <span>/</span>
            <span className="text-ink font-medium">
              {isEdit
                ? t("admin_prod_modal_edit", "Edit Product")
                : t("admin_prod_modal_new", "New Product")}
            </span>
          </div>

          <h1 className="font-display text-[26px] font-medium text-ink">
            {isEdit
              ? form.name
                ? `${t("admin_prod_modal_edit", "Edit")}: ${form.name}`
                : t("admin_prod_modal_edit", "Edit Product")
              : t("admin_prod_modal_new", "New Product")}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            disabled={busy}
            className="rounded-xl border border-hairline bg-surface px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-paper disabled:opacity-50"
          >
            {t("admin_prod_modal_cancel", "Cancel")}
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={busy || loadingData}
            className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-moss-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>
              {uploading
                ? t("admin_prod_modal_uploading", "Uploading images…")
                : saving
                  ? t("admin_prod_modal_saving", "Saving…")
                  : isEdit
                    ? t("admin_prod_modal_save", "Save Changes")
                    : t("admin_prod_modal_create", "Create Product")}
            </span>
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="flex min-h-96 items-center justify-center rounded-2xl border border-hairline bg-surface p-12">
          <div className="flex flex-col items-center">
            <Loader2 size={28} className="animate-spin text-moss" />
            <p className="mt-3 text-[13.5px] text-stone">
              {t("admin_prod_modal_loading", "Loading product data…")}
            </p>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="flex items-center justify-between rounded-xl border border-clay/20 bg-clay-tint px-4 py-3 text-[13.5px] text-clay">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-clay/70 hover:text-clay"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            {/* Main Column: Left 8 cols */}
            <div className="space-y-6 xl:col-span-8">
              <form id="product-form" onSubmit={handleSubmit}>
                {/* Card 1: Basic Information */}
                <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-5">
                  <div>
                    <h2 className="font-display text-[17px] font-medium text-ink">
                      {t("admin_prod_sec_basic", "Basic Information")}
                    </h2>
                    <p className="text-[12px] text-stone mt-0.5">
                      {t(
                        "admin_prod_sec_basic_desc",
                        "Configure product name, description, and core details.",
                      )}
                    </p>
                  </div>

                  <Field label={t("admin_prod_modal_name")} required>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t("admin_prod_modal_name_placeholder")}
                      maxLength={255}
                      disabled={busy}
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field label={t("admin_prod_modal_desc")}>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={6}
                      placeholder={t("admin_prod_modal_desc_placeholder")}
                      disabled={busy}
                      className={`${inputClass} resize-y leading-relaxed`}
                    />
                  </Field>
                </div>

                {/* Card 2: Pricing & Inventory */}
                <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6 space-y-5">
                  <div>
                    <h2 className="font-display text-[17px] font-medium text-ink">
                      {t("admin_prod_sec_pricing", "Pricing & Inventory")}
                    </h2>
                    <p className="text-[12px] text-stone mt-0.5">
                      {t(
                        "admin_prod_sec_pricing_desc",
                        "Set price, discounts, stock levels, and shipping options.",
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={t("admin_prod_modal_price")} required>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[14px] text-stone">
                          $
                        </span>
                        <input
                          type="number"
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          disabled={busy}
                          required
                          className={`${inputClass} pl-7`}
                        />
                      </div>
                    </Field>

                    <Field label={t("admin_prod_modal_stock")} required>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        placeholder="0"
                        disabled={busy}
                        required
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <Field label={t("admin_prod_modal_discount")}>
                      <div className="relative">
                        <input
                          type="number"
                          name="discount"
                          value={form.discount}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="1"
                          placeholder="0"
                          disabled={busy}
                          className={`${inputClass} pr-8`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[13px] text-stone">
                          %
                        </span>
                      </div>
                    </Field>

                    <Field label={t("admin_prod_modal_delivery")}>
                      <label
                        className={`flex items-center gap-2.5 h-[42px] px-3.5 rounded-lg border border-hairline bg-paper cursor-pointer select-none transition-colors hover:border-moss/40 ${
                          busy ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="free_delivery"
                          checked={form.free_delivery}
                          onChange={handleChange}
                          disabled={busy}
                          className="w-4 h-4 rounded border-hairline text-moss focus:ring-moss/30 accent-moss"
                        />
                        <span className="text-[13.5px] text-ink font-medium">
                          {t("admin_prod_modal_free_delivery")}
                        </span>
                      </label>
                    </Field>
                  </div>

                  {Number(form.discount) > 0 && Number(form.price) > 0 && (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-moss-tint px-3.5 py-2 text-[12.5px] text-moss font-medium">
                      <span>Effective Sale Price:</span>
                      <span className="font-mono text-[14px] font-bold text-moss-deep">
                        ${calculatedDiscountPrice.toFixed(2)}
                      </span>
                      <span className="rounded-md bg-moss/10 px-1.5 py-0.5 text-[11px]">
                        -{form.discount}% off
                      </span>
                    </div>
                  )}
                </div>

                {/* Card 3: Media & Images */}
                <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-[17px] font-medium text-ink">
                        {t("admin_prod_modal_images")}
                      </h2>
                      <p className="text-[12px] text-stone mt-0.5">
                        {t("admin_prod_modal_images_hint")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-paper px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-moss hover:bg-moss-tint hover:text-moss-deep disabled:opacity-50"
                    >
                      <Upload size={13} />
                      <span>{t("admin_prod_modal_choose_files")}</span>
                    </button>
                  </div>

                  {imageError && (
                    <div className="rounded-lg border border-clay/20 bg-clay-tint px-3.5 py-2.5 text-[12.5px] text-clay">
                      {imageError}
                    </div>
                  )}

                  {/* Existing Uploaded Images */}
                  {images.length > 0 && (
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone">
                        Current Images ({images.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((img, index) => (
                          <div
                            key={img.public_id || img.id || index}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-hairline bg-paper"
                          >
                            <img
                              src={img.url}
                              alt={`${form.name || "Product"} ${index + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {img.is_primary && (
                              <span className="absolute left-2 top-2 rounded bg-moss px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm">
                                {t("admin_prod_modal_primary")}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleImageDelete(img.public_id)}
                              disabled={deletingImage === img.public_id}
                              title="Delete image"
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-white opacity-0 transition-opacity hover:bg-clay group-hover:opacity-100 disabled:opacity-100"
                            >
                              {deletingImage === img.public_id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <X size={14} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Newly Selected Upload Previews */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-moss">
                        New Files to Upload ({selectedFiles.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {selectedFiles.map((item, index) => (
                          <div
                            key={item.id}
                            className="group relative aspect-square overflow-hidden rounded-xl border-2 border-moss/40 bg-paper"
                          >
                            <img
                              src={item.preview}
                              alt={`Selected image ${index + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            <span className="absolute left-2 top-2 rounded bg-moss px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm">
                              {t("admin_prod_modal_new_tag")}
                            </span>

                            <button
                              type="button"
                              onClick={() => removeSelectedFile(item.id)}
                              disabled={busy}
                              title="Remove"
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-white opacity-0 transition-opacity hover:bg-clay group-hover:opacity-100"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag and drop upload target */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!busy) setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                      isDragging
                        ? "border-moss bg-moss-tint"
                        : "border-hairline bg-paper/40 hover:border-moss/40 hover:bg-paper"
                    } ${busy ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-moss-tint text-moss mb-3">
                      <Upload size={20} strokeWidth={2} />
                    </div>

                    <p className="text-[13.5px] font-medium text-ink">
                      {t("admin_prod_modal_drag_drop")}
                    </p>

                    <p className="mt-1 text-[11.5px] text-stone">
                      {t("admin_prod_modal_formats")}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={busy}
                  />
                </div>
              </form>
            </div>

            {/* Sidebar Column: Right 4 cols */}
            <div className="space-y-6 xl:col-span-4">
              {/* Card 1: Categorization */}
              <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-5">
                <div>
                  <h2 className="font-display text-[17px] font-medium text-ink">
                    {t("admin_prod_sec_org", "Organization")}
                  </h2>
                  <p className="text-[12px] text-stone mt-0.5">
                    {t(
                      "admin_prod_sec_org_desc",
                      "Assign category, brand, and skin target types.",
                    )}
                  </p>
                </div>

                <Field label={t("admin_prod_modal_category")} required>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    disabled={busy}
                    required
                    className={inputClass}
                  >
                    <option value="">{t("admin_prod_modal_select_cat")}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t("admin_prod_modal_brand")}>
                  <select
                    name="brand_id"
                    value={form.brand_id}
                    onChange={handleChange}
                    disabled={busy}
                    className={inputClass}
                  >
                    <option value="">{t("admin_prod_modal_no_brand")}</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t("admin_prod_modal_skin_types")}>
                  {skinTypes.length === 0 ? (
                    <p className="text-[12.5px] text-stone">
                      {t("admin_prod_modal_no_skin_types")}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skinTypes.map((skinType) => {
                        const isSelected = selectedSkinTypeIds.includes(
                          skinType.id,
                        );

                        return (
                          <button
                            key={skinType.id}
                            type="button"
                            onClick={() => toggleSkinType(skinType.id)}
                            disabled={busy}
                            aria-pressed={isSelected}
                            className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all disabled:opacity-60 ${
                              isSelected
                                ? "border-moss bg-moss text-white shadow-xs"
                                : "border-hairline bg-paper text-stone hover:border-moss/40 hover:text-ink"
                            }`}
                          >
                            {skinType.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <p className="mt-2 text-[11px] text-stone">
                    {t("admin_prod_modal_skin_types_hint")}
                  </p>
                </Field>
              </div>

              {/* Card 2: Live Storefront Card Preview */}
              <div className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11.5px] font-semibold uppercase tracking-wider text-stone">
                    Storefront Preview
                  </h3>
                  <span className="rounded-full bg-paper border border-hairline px-2 py-0.5 text-[10px] text-stone font-medium">
                    Live
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-hairline bg-paper/60 transition-all">
                  <div className="relative aspect-square w-full bg-paper flex items-center justify-center overflow-hidden">
                    {previewPrimaryImage ? (
                      <img
                        src={previewPrimaryImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone/40">
                        <ImageOff size={36} strokeWidth={1.25} />
                        <span className="mt-1 text-[11px]">No image yet</span>
                      </div>
                    )}

                    {Number(form.discount) > 0 && (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        -{form.discount}%
                      </span>
                    )}

                    {form.free_delivery && (
                      <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-surface/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-moss shadow-xs border border-hairline">
                        <Truck size={10} />
                        Free
                      </span>
                    )}
                  </div>

                  <div className="p-3.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-stone truncate">
                      {selectedBrand?.name || selectedCategory?.name || "Skincare"}
                    </p>

                    <h4 className="mt-1 text-[13.5px] font-medium text-ink truncate">
                      {form.name || "Product Name"}
                    </h4>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-mono text-[14px] font-semibold text-ink">
                        ${calculatedDiscountPrice.toFixed(2)}
                      </span>
                      {Number(form.discount) > 0 && Number(form.price) > 0 && (
                        <span className="font-mono text-[12px] text-stone line-through">
                          ${Number(form.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Tips & Guidance */}
              <div className="rounded-2xl border border-hairline bg-surface p-6">
                <h3 className="font-display text-[16px] font-medium text-ink mb-3">
                  {t("admin_prod_modal_tips")}
                </h3>

                <div className="space-y-2.5">
                  {[
                    t("admin_prod_modal_tip1"),
                    t("admin_prod_modal_tip2"),
                    t("admin_prod_modal_tip3"),
                    t("admin_prod_modal_tip4"),
                    t("admin_prod_modal_tip5"),
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-moss-tint text-moss">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <p className="text-[12px] text-stone leading-tight">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between rounded-2xl border border-hairline bg-surface px-6 py-4">
            <Link
              to="/admin/products"
              className="text-[13px] text-stone hover:text-ink transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back to Products</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                disabled={busy}
                className="rounded-xl border border-hairline bg-surface px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-paper disabled:opacity-50"
              >
                {t("admin_prod_modal_cancel", "Cancel")}
              </button>

              <button
                type="submit"
                form="product-form"
                disabled={busy || loadingData}
                className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-moss-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                <span>
                  {uploading
                    ? t("admin_prod_modal_uploading", "Uploading images…")
                    : saving
                      ? t("admin_prod_modal_saving", "Saving…")
                      : isEdit
                        ? t("admin_prod_modal_save", "Save Changes")
                        : t("admin_prod_modal_create", "Create Product")}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-paper text-ink text-[14px] placeholder:text-stone/60 focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss transition-shadow disabled:opacity-60 disabled:cursor-not-allowed";

function Field({ label, required = false, children }) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-stone">
        {label}
        {required && <span className="ml-1 text-clay">*</span>}
      </label>
      {children}
    </div>
  );
}

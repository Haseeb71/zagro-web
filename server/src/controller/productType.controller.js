const ProductType = require("../models/productType.model");
const slugify = require("slugify");
const {
  refreshProductTypeCache,
  listProductTypeConfigs,
  toConfig,
} = require("../constants/productTypes");

function parseList(raw) {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((s) => s.trim()).filter(Boolean);
      }
    } catch (_) {
      /* comma-separated */
    }
    return raw
      .split(/[,|\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseBool(v, fallback = false) {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  if (s === "true" || s === "1" || s === "on" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "off" || s === "no") return false;
  return fallback;
}

const getProductTypes = async (_req, res) => {
  try {
    await refreshProductTypeCache();
    const types = listProductTypeConfigs();
    res.status(200).json({ types, message: "Product types fetched" });
  } catch (error) {
    console.error("getProductTypes:", error);
    res.status(500).json({ message: error.message });
  }
};

const getProductTypesAdmin = async (_req, res) => {
  try {
    const rows = await ProductType.find().sort({ sortOrder: 1, label: 1 });
    res.status(200).json({
      types: rows.map(toConfig),
      message: "Product types fetched",
    });
  } catch (error) {
    console.error("getProductTypesAdmin:", error);
    res.status(500).json({ message: error.message });
  }
};

const createProductType = async (req, res) => {
  try {
    const { label, description, key: rawKey } = req.body;
    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: "Label is required" });
    }
    const key = slugify(String(rawKey || label).trim(), { lower: true, strict: true });
    if (!key) {
      return res.status(400).json({ message: "Invalid key" });
    }
    const exists = await ProductType.findOne({ key });
    if (exists) {
      return res.status(400).json({ message: "Product type key already exists" });
    }

    const doc = await ProductType.create({
      key,
      label: String(label).trim(),
      description: description || "",
      hasSizes: parseBool(req.body.hasSizes, false),
      hasColors: parseBool(req.body.hasColors, false),
      sizePreset: parseList(req.body.sizePreset),
      colorPreset: parseList(req.body.colorPreset),
      isActive: parseBool(req.body.isActive, true),
      sortOrder: Number(req.body.sortOrder) || 100,
    });

    await refreshProductTypeCache();
    res.status(201).json({ type: toConfig(doc), message: "Product type created" });
  } catch (error) {
    console.error("createProductType:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateProductType = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ProductType.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Product type not found" });
    }

    if (req.body.label !== undefined) doc.label = String(req.body.label).trim();
    if (req.body.description !== undefined) doc.description = req.body.description;
    if (req.body.hasSizes !== undefined) doc.hasSizes = parseBool(req.body.hasSizes, doc.hasSizes);
    if (req.body.hasColors !== undefined) doc.hasColors = parseBool(req.body.hasColors, doc.hasColors);
    if (req.body.sizePreset !== undefined) doc.sizePreset = parseList(req.body.sizePreset);
    if (req.body.colorPreset !== undefined) doc.colorPreset = parseList(req.body.colorPreset);
    if (req.body.isActive !== undefined) doc.isActive = parseBool(req.body.isActive, doc.isActive);
    if (req.body.sortOrder !== undefined) doc.sortOrder = Number(req.body.sortOrder) || doc.sortOrder;

    // Key is immutable once created (products reference it)
    await doc.save();
    await refreshProductTypeCache();
    res.status(200).json({ type: toConfig(doc), message: "Product type updated" });
  } catch (error) {
    console.error("updateProductType:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProductType = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ProductType.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Product type not found" });
    }
    if (["simple", "watch", "apparel"].includes(doc.key)) {
      return res.status(400).json({ message: "Built-in types cannot be deleted — deactivate instead" });
    }
    await ProductType.findByIdAndDelete(id);
    await refreshProductTypeCache();
    res.status(200).json({ message: "Product type deleted" });
  } catch (error) {
    console.error("deleteProductType:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProductTypes,
  getProductTypesAdmin,
  createProductType,
  updateProductType,
  deleteProductType,
};

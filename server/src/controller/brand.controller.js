const brandModel = require("../models/brand.model");
const slugify = require("slugify");
const { PRODUCT_TYPE_KEYS } = require("../constants/productTypes");

function parseProductTypes(raw) {
  if (raw == null || raw === "") return [];
  let list = raw;
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw);
    } catch (_) {
      list = raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(list)) return [];
  return list.filter((t) => PRODUCT_TYPE_KEYS.includes(t));
}

const createBrand = async (req, res) => {
  try {
    const { name, description, isActive, productTypes } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Brand name is required" });
    }
    const slug = slugify(name, { lower: true, strict: true });
    const exists = await brandModel.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: "Brand already exists" });
    }
    const logo = req.file ? req.file.path : null;
    const brand = await brandModel.create({
      name,
      slug,
      description,
      logo,
      productTypes: parseProductTypes(productTypes),
      isActive: isActive === undefined ? true : isActive === true || isActive === "true",
    });
    res.status(201).json({ brand, message: "Brand created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating brand: " + error.message });
  }
};

const getBrands = async (req, res) => {
  try {
    const { isActive, productType } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (productType) {
      // Strict: only brands tagged for this product type (Rolex ≠ suits)
      query.productTypes = productType;
    }
    const brands = await brandModel.find(query).sort({ name: 1 });
    res.status(200).json({ brands, message: "Brands fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching brands: " + error.message });
  }
};

const getBrandById = async (req, res) => {
  try {
    const brand = await brandModel.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json({ brand, message: "Brand fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching brand: " + error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { name, description, isActive, productTypes } = req.body;
    const brand = await brandModel.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    if (name) {
      brand.name = name;
      brand.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) brand.description = description;
    if (isActive !== undefined) brand.isActive = isActive === true || isActive === "true";
    if (productTypes !== undefined) brand.productTypes = parseProductTypes(productTypes);
    if (req.file) brand.logo = req.file.path;
    brand.updatedAt = new Date();
    await brand.save();
    res.status(200).json({ brand, message: "Brand updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating brand: " + error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brand = await brandModel.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand: " + error.message });
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};

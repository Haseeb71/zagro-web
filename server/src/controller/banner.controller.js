const bannerModel = require("../models/banner.model");

const createBanner = async (req, res) => {
  try {
    const { title, subtitle, ctaText, link, isActive, sortOrder } = req.body;
    const image = req.file ? req.file.path : null;
    if (!image) {
      return res.status(400).json({ message: "Banner image is required" });
    }
    const banner = await bannerModel.create({
      title: title || "",
      subtitle: subtitle || "",
      image,
      ctaText: ctaText || "Shop collection",
      link: link || "/shop",
      isActive: isActive === undefined ? true : isActive === true || isActive === "true",
      sortOrder: Number(sortOrder) || 0,
    });
    res.status(201).json({ banner, message: "Banner created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating banner: " + error.message });
  }
};

const getBanners = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    const banners = await bannerModel.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ banners, message: "Banners fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching banners: " + error.message });
  }
};

const getActiveBanners = async (_req, res) => {
  try {
    const banners = await bannerModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ banners, message: "Active banners fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching banners: " + error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await bannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const { title, subtitle, ctaText, link, isActive, sortOrder } = req.body;
    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (ctaText !== undefined) banner.ctaText = ctaText;
    if (link !== undefined) banner.link = link;
    if (isActive !== undefined) banner.isActive = isActive === true || isActive === "true";
    if (sortOrder !== undefined) banner.sortOrder = Number(sortOrder) || 0;
    if (req.file) banner.image = req.file.path;
    banner.updatedAt = new Date();
    await banner.save();
    res.status(200).json({ banner, message: "Banner updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating banner: " + error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await bannerModel.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting banner: " + error.message });
  }
};

module.exports = {
  createBanner,
  getBanners,
  getActiveBanners,
  updateBanner,
  deleteBanner,
};

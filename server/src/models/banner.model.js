const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: false, default: "" },
  subtitle: { type: String, required: false, default: "" },
  image: { type: String, required: true },
  ctaText: { type: String, required: false, default: "Shop collection" },
  link: { type: String, required: false, default: "/shop" },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("banner", bannerSchema);

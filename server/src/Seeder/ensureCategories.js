const categoryModel = require("../models/category.model");

/** Fixed slugs so nav / shop / seed stay in sync (never slugify-from-name alone). */
const DEFAULT_CATEGORIES = [
  { name: "Watches", slug: "watches", description: "Timepieces for every wrist", productType: "watch" },
  { name: "Suits & Apparel", slug: "suits-apparel", description: "Formal wear, suits and clothing", productType: "apparel" },
  { name: "Baby & Toys", slug: "baby-toys", description: "Toys and kids essentials", productType: "toy" },
  { name: "Vehicles", slug: "vehicles", description: "Jeeps, cars and ride-ons", productType: "vehicle" },
  { name: "Men", slug: "men", description: "Men's collection", productType: "apparel" },
  { name: "Women", slug: "women", description: "Women's collection", productType: "apparel" },
  { name: "Kids", slug: "kids", description: "Kids' collection", productType: "toy" },
];

/** Old auto-slugify leftovers to remove so Rolex doesn't show under empty duplicate cats */
const LEGACY_SLUGS = ["suits-and-apparel", "baby-and-toys"];

async function ensureDefaultCategories() {
  for (const item of DEFAULT_CATEGORIES) {
    const existing = await categoryModel.findOne({ slug: item.slug });
    if (existing) {
      let dirty = false;
      if (existing.name !== item.name || existing.description !== item.description) {
        existing.name = item.name;
        existing.description = item.description;
        dirty = true;
      }
      if (!existing.productType && item.productType) {
        existing.productType = item.productType;
        dirty = true;
      }
      if (dirty) await existing.save();
      continue;
    }
    await categoryModel.create({
      name: item.name,
      slug: item.slug,
      description: item.description,
      productType: item.productType || "",
    });
    console.log(`Category seeded: ${item.name}`);
  }

  for (const slug of LEGACY_SLUGS) {
    const legacy = await categoryModel.findOne({ slug });
    if (!legacy) continue;
    const productCount = await require("../models/product.model").countDocuments({
      category: legacy._id,
    });
    if (productCount === 0) {
      await categoryModel.deleteOne({ _id: legacy._id });
      console.log(`Removed empty legacy category: ${slug}`);
    }
  }
}

module.exports = ensureDefaultCategories;

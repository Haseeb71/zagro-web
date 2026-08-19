const categoryModel = require("../models/category.model");

/** Fixed slugs so nav / shop / seed stay in sync (never slugify-from-name alone). */
const DEFAULT_CATEGORIES = [
  { name: "Watches", slug: "watches", description: "Timepieces for every wrist" },
  { name: "Suits & Apparel", slug: "suits-apparel", description: "Formal wear, suits and clothing" },
  { name: "Baby & Toys", slug: "baby-toys", description: "Toys and kids essentials" },
  { name: "Vehicles", slug: "vehicles", description: "Jeeps, cars and ride-ons" },
  { name: "Men", slug: "men", description: "Men's collection" },
  { name: "Women", slug: "women", description: "Women's collection" },
  { name: "Kids", slug: "kids", description: "Kids' collection" },
];

/** Old auto-slugify leftovers to remove so Rolex doesn't show under empty duplicate cats */
const LEGACY_SLUGS = ["suits-and-apparel", "baby-and-toys"];

async function ensureDefaultCategories() {
  for (const item of DEFAULT_CATEGORIES) {
    const existing = await categoryModel.findOne({ slug: item.slug });
    if (existing) {
      if (existing.name !== item.name || existing.description !== item.description) {
        existing.name = item.name;
        existing.description = item.description;
        await existing.save();
      }
      continue;
    }
    await categoryModel.create({
      name: item.name,
      slug: item.slug,
      description: item.description,
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

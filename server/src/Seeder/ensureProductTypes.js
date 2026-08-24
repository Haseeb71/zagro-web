const ProductType = require("../models/productType.model");
const { BUILTIN_PRODUCT_TYPES, refreshProductTypeCache } = require("../constants/productTypes");

async function ensureProductTypes() {
  const builtins = Object.values(BUILTIN_PRODUCT_TYPES);
  let order = 10;
  for (const t of builtins) {
    await ProductType.findOneAndUpdate(
      { key: t.key },
      {
        $setOnInsert: {
          key: t.key,
          label: t.label,
          description: t.description || "",
          hasSizes: Boolean(t.hasSizes),
          hasColors: Boolean(t.hasColors),
          sizePreset: t.sizePreset || [],
          colorPreset: t.colorPreset || [],
          isActive: true,
          sortOrder: order,
        },
      },
      { upsert: true, new: true }
    );
    order += 10;
  }
  await refreshProductTypeCache();
  console.log("[seed] Product types ready:", builtins.map((t) => t.key).join(", "));
}

module.exports = ensureProductTypes;

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const slugify = require("slugify");

const categoryModel = require("../models/category.model");
const brandModel = require("../models/brand.model");
const bannerModel = require("../models/banner.model");
const productModel = require("../models/product.model");

const { getDemoUploadDir, getUploadsRoot, relativeUploadPath } = require("../../paths");

const UPLOAD_DIR = getDemoUploadDir();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function clearDemoUploads() {
  if (!fs.existsSync(UPLOAD_DIR)) return;
  for (const name of fs.readdirSync(UPLOAD_DIR)) {
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, name));
    } catch (_) {
      /* ignore */
    }
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const request = client.get(
      url,
      {
        timeout: 25000,
        headers: {
          "User-Agent": "KhareedoDemoSeed/1.0",
          Accept: "image/*",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
        file.on("error", reject);
      }
    );
    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

function writePlaceholder(dest, label, kind = "watch") {
  const safe = String(label || "Item")
    .replace(/[<>&]/g, "")
    .slice(0, 28);
  const fg = "#c4a574";
  const body =
    kind === "suit"
      ? `<rect x="300" y="220" width="300" height="420" rx="20" fill="none" stroke="${fg}" stroke-width="10"/>
         <line x1="450" y1="220" x2="450" y2="640" stroke="${fg}" stroke-width="6"/>
         <path d="M300 280 Q450 340 600 280" fill="none" stroke="${fg}" stroke-width="8"/>`
      : `<circle cx="450" cy="400" r="210" fill="#0e0c0a" stroke="${fg}" stroke-width="14"/>
         <circle cx="450" cy="400" r="14" fill="${fg}"/>
         <line x1="450" y1="400" x2="450" y2="250" stroke="${fg}" stroke-width="8" stroke-linecap="round"/>
         <line x1="450" y1="400" x2="560" y2="450" stroke="${fg}" stroke-width="6" stroke-linecap="round"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <rect width="900" height="900" fill="#141210"/>
  ${body}
  <text x="450" y="760" text-anchor="middle" fill="${fg}" font-family="Georgia, serif" font-size="36">${safe}</text>
</svg>`;
  const out = dest.replace(/\.(jpe?g|png|webp)$/i, ".svg");
  fs.writeFileSync(out, svg);
  return out;
}

async function fetchImage(url, dest, label, kind = "watch") {
  try {
    await downloadFile(url, dest);
    return dest;
  } catch (err) {
    console.warn(`Image failed (${label}): ${err.message} — placeholder`);
    return writePlaceholder(dest, label, kind);
  }
}

const u = (id, w = 900, h = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const BRANDS = [
  // Watch brands
  { name: "Rolex", description: "Swiss luxury chronometers", productTypes: ["watch"], image: u("photo-1587836374828-4dbafa94cf0e", 600, 600) },
  { name: "Omega", description: "Precision since 1848", productTypes: ["watch"], image: u("photo-1614164185128-e4ec99c436d7", 600, 600) },
  { name: "Seiko", description: "Japanese craftsmanship", productTypes: ["watch"], image: u("photo-1539874754764-5a96559165b0", 600, 600) },
  { name: "Casio", description: "Innovation for everyday", productTypes: ["watch"], image: u("photo-1622434641406-a158123450f9", 600, 600) },
  { name: "Tissot", description: "Swiss tradition", productTypes: ["watch"], image: u("photo-1524592094714-0f0654e20314", 600, 600) },
  // Suit / apparel brands
  { name: "Raymond", description: "Classic formal wear", productTypes: ["apparel"], image: u("photo-1594938298603-c8148c4dae35", 600, 600), kind: "suit" },
  { name: "Brooks Brothers", description: "American suiting", productTypes: ["apparel"], image: u("photo-1507679799987-c73779587ccf", 600, 600), kind: "suit" },
  { name: "Indigo Nation", description: "Contemporary menswear", productTypes: ["apparel"], image: u("photo-1617137968427-85924c800a22", 600, 600), kind: "suit" },
  { name: "Van Heusen", description: "Smart formal apparel", productTypes: ["apparel"], image: u("photo-1593032465175-481ac7f401a0", 600, 600), kind: "suit" },
];

const CATEGORY_IMAGES = {
  watches: { url: u("photo-1523170335258-f5ed11844a49", 1200, 900), kind: "watch" },
  "suits-apparel": { url: u("photo-1594938298603-c8148c4dae35", 1200, 900), kind: "suit" },
  "baby-toys": { url: u("photo-1515488042361-ee00e0ddd4b4", 1200, 900), kind: "watch" },
  vehicles: { url: u("photo-1533473359331-0135ef1b58bf", 1200, 900), kind: "watch" },
  men: { url: u("photo-1507679799987-c73779587ccf", 1200, 900), kind: "suit" },
  women: { url: u("photo-1547996160-81dfa63595aa", 1200, 900), kind: "watch" },
  kids: { url: u("photo-1508685096489-7aacd43bd3b1", 1200, 900), kind: "watch" },
};

const BANNERS = [
  {
    title: "Watches & Suits",
    subtitle: "Shop curated timepieces and formal wear",
    ctaText: "Shop collection",
    link: "/shop",
    image: u("photo-1524592094714-0f0654e20314", 1600, 900),
    file: "banner-1.jpg",
    sortOrder: 0,
  },
  {
    title: "New arrivals",
    subtitle: "Fresh watches and tailored suits",
    ctaText: "Browse shop",
    link: "/shop",
    image: u("photo-1594938298603-c8148c4dae35", 1600, 900),
    file: "banner-2.jpg",
    sortOrder: 1,
    kind: "suit",
  },
];

const PRODUCTS = [
  // Watches → category watches
  {
    name: "Rolex Submariner Classic",
    price: 185000,
    originalPrice: 220000,
    brand: "Rolex",
    category: "watches",
    productType: "watch",
    featured: true,
    images: [u("photo-1587836374828-4dbafa94cf0e"), u("photo-1523170335258-f5ed11844a49")],
    file: "product-rolex-sub",
  },
  {
    name: "Rolex Datejust Steel",
    price: 142000,
    originalPrice: 165000,
    brand: "Rolex",
    category: "watches",
    productType: "watch",
    featured: true,
    images: [u("photo-1547996160-81dfa63595aa")],
    file: "product-rolex-dj",
  },
  {
    name: "Omega Seamaster Diver",
    price: 98000,
    originalPrice: 115000,
    brand: "Omega",
    category: "watches",
    productType: "watch",
    images: [u("photo-1614164185128-e4ec99c436d7")],
    file: "product-omega-sm",
  },
  {
    name: "Seiko Presage Cocktail",
    price: 32000,
    originalPrice: 38000,
    brand: "Seiko",
    category: "watches",
    productType: "watch",
    images: [u("photo-1539874754764-5a96559165b0")],
    file: "product-seiko-pr",
  },
  {
    name: "Casio G-Shock Tough",
    price: 12500,
    brand: "Casio",
    category: "watches",
    productType: "watch",
    best: true,
    images: [u("photo-1622434641406-a158123450f9")],
    file: "product-casio-gs",
  },
  {
    name: "Tissot PRX Quartz",
    price: 45000,
    originalPrice: 52000,
    brand: "Tissot",
    category: "watches",
    productType: "watch",
    trending: true,
    images: [u("photo-1524592094714-0f0654e20314")],
    file: "product-tissot-prx",
  },
  // Suits → suits-apparel + sizes
  {
    name: "Raymond Classic Navy Suit",
    price: 28500,
    originalPrice: 35000,
    brand: "Raymond",
    category: "suits-apparel",
    productType: "apparel",
    featured: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    sizeQuantities: { S: 5, M: 12, L: 10, XL: 8, XXL: 4 },
    images: [u("photo-1594938298603-c8148c4dae35")],
    file: "product-raymond-navy",
    kind: "suit",
  },
  {
    name: "Brooks Brothers Charcoal Suit",
    price: 42000,
    originalPrice: 52000,
    brand: "Brooks Brothers",
    category: "suits-apparel",
    productType: "apparel",
    sizes: ["S", "M", "L", "XL"],
    sizeQuantities: { S: 3, M: 8, L: 9, XL: 5 },
    images: [u("photo-1507679799987-c73779587ccf")],
    file: "product-brooks-charcoal",
    kind: "suit",
  },
  {
    name: "Indigo Nation Slim Black Suit",
    price: 18900,
    originalPrice: 24000,
    brand: "Indigo Nation",
    category: "suits-apparel",
    productType: "apparel",
    isNew: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeQuantities: { XS: 2, S: 6, M: 10, L: 7, XL: 3 },
    images: [u("photo-1617137968427-85924c800a22")],
    file: "product-indigo-black",
    kind: "suit",
  },
  {
    name: "Van Heusen Grey Formal Suit",
    price: 22000,
    brand: "Van Heusen",
    category: "suits-apparel",
    productType: "apparel",
    sizes: ["M", "L", "XL", "XXL"],
    sizeQuantities: { M: 8, L: 11, XL: 6, XXL: 4 },
    images: [u("photo-1593032465175-481ac7f401a0")],
    file: "product-vh-grey",
    kind: "suit",
  },
];

async function ensureDemoCatalog() {
  if (process.env.SKIP_DEMO_SEED === "true") {
    console.log("SKIP_DEMO_SEED=true — skipping demo catalog");
    return;
  }

  const force = process.env.FORCE_DEMO_SEED === "true";
  const productCount = await productModel.countDocuments();

  if (productCount > 0 && !force) {
    console.log(`Products already exist (${productCount}) — skip demo catalog seed`);
    console.log("Set FORCE_DEMO_SEED=true to wipe and reseed watches + suits");
    return;
  }

  if (force && productCount > 0) {
    console.log("FORCE_DEMO_SEED=true — clearing products, banners & brands for reseed");
    await productModel.deleteMany({});
    await bannerModel.deleteMany({});
    await brandModel.deleteMany({});
  }

  clearDemoUploads();
  ensureDir(UPLOAD_DIR);
  console.log("Seeding demo catalog (watches + suits)...");

  const categories = await categoryModel.find();
  const categoryBySlug = {};
  for (const cat of categories) categoryBySlug[cat.slug] = cat;

  for (const [slug, meta] of Object.entries(CATEGORY_IMAGES)) {
    let cat = categoryBySlug[slug];
    if (!cat) {
      const name = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      cat = await categoryModel.create({
        name,
        slug,
        description: `${name} collection`,
      });
      categoryBySlug[slug] = cat;
    }
    const dest = path.join(UPLOAD_DIR, `category-${slug}.jpg`);
    const file = await fetchImage(meta.url, dest, cat.name, meta.kind);
    cat.image = relativeUploadPath(file);
    await cat.save();
  }

  const brandByName = {};
  for (const item of BRANDS) {
    const dest = path.join(UPLOAD_DIR, `brand-${slugify(item.name, { lower: true })}.jpg`);
    const file = await fetchImage(item.image, dest, item.name, item.kind || "watch");
    const slug = slugify(item.name, { lower: true, strict: true });
    let brand = await brandModel.findOne({ slug });
    if (!brand) {
      brand = await brandModel.create({
        name: item.name,
        slug,
        description: item.description,
        logo: relativeUploadPath(file),
        productTypes: item.productTypes || [],
        isActive: true,
      });
    } else {
      brand.logo = relativeUploadPath(file);
      brand.description = item.description;
      brand.productTypes = item.productTypes || [];
      brand.isActive = true;
      await brand.save();
    }
    brandByName[item.name] = brand;
  }

  await bannerModel.deleteMany({});
  for (const item of BANNERS) {
    const dest = path.join(UPLOAD_DIR, item.file);
    const file = await fetchImage(item.image, dest, item.title, item.kind || "watch");
    await bannerModel.create({
      title: item.title,
      subtitle: item.subtitle,
      image: relativeUploadPath(file),
      ctaText: item.ctaText,
      link: item.link,
      isActive: true,
      sortOrder: item.sortOrder,
    });
  }

  for (const item of PRODUCTS) {
    const cat = categoryBySlug[item.category];
    const brand = brandByName[item.brand];
    if (!cat || !brand) {
      console.warn(`Skip product ${item.name}: missing category/brand (${item.category}/${item.brand})`);
      continue;
    }

    const imagePaths = [];
    for (let i = 0; i < item.images.length; i++) {
      const dest = path.join(UPLOAD_DIR, `${item.file}-${i + 1}.jpg`);
      const file = await fetchImage(item.images[i], dest, item.name, item.kind || "watch");
      imagePaths.push(relativeUploadPath(file));
    }

    const sizeQuantities = item.sizeQuantities || null;
    const quantity = sizeQuantities
      ? Object.values(sizeQuantities).reduce((s, n) => s + Number(n || 0), 0)
      : 25;

    await productModel.create({
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice || null,
      isDiscounted: Boolean(item.originalPrice && item.originalPrice > item.price),
      discountPercentage:
        item.originalPrice && item.originalPrice > item.price
          ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
          : 0,
      description: `${item.name} — Khareedo demo. Brand: ${item.brand}.`,
      images: imagePaths,
      category: cat._id,
      brand: brand._id,
      productType: item.productType || "simple",
      quantity,
      sizes: item.sizes || [],
      sizeQuantities: sizeQuantities || undefined,
      isActive: true,
      isFeatured: Boolean(item.featured),
      isNew: Boolean(item.isNew),
      isBestSeller: Boolean(item.best),
      isTrending: Boolean(item.trending),
    });
  }

  console.log(
    `Demo catalog ready: ${BRANDS.length} brands, ${BANNERS.length} banners, ${PRODUCTS.length} products (watches + suits)`
  );
}

module.exports = ensureDemoCatalog;

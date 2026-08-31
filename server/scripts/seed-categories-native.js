/**
 * One-off: seed default categories into Atlas (native driver — avoids dual-mongoose issues).
 * Usage: node server/scripts/seed-categories-native.js
 */
const { MongoClient } = require("mongodb");

const url =
  process.env.MONGO_DB_URL ||
  "mongodb+srv://khareedoshopofficial_db_user:E6moLZwj8EZvTQf6@khareedoshop.dtlvrdi.mongodb.net/khareedo?retryWrites=true&w=majority&appName=KhareedoShop";

const cats = [
  { name: "Watches", slug: "watches", description: "Timepieces for every wrist", productType: "watch" },
  { name: "Suits & Apparel", slug: "suits-apparel", description: "Formal wear, suits and clothing", productType: "apparel" },
  { name: "Baby & Toys", slug: "baby-toys", description: "Toys and kids essentials", productType: "toy" },
  { name: "Vehicles", slug: "vehicles", description: "Jeeps, cars and ride-ons", productType: "vehicle" },
  { name: "Men", slug: "men", description: "Men's collection", productType: "apparel" },
  { name: "Women", slug: "women", description: "Women's collection", productType: "apparel" },
  { name: "Kids", slug: "kids", description: "Kids' collection", productType: "toy" },
];

async function main() {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db("khareedo");

  for (const c of cats) {
    const r = await db.collection("categories").updateOne(
      { slug: c.slug },
      {
        $set: {
          name: c.name,
          description: c.description,
          productType: c.productType,
        },
        $setOnInsert: {
          slug: c.slug,
          image: null,
          subCategories: [],
        },
      },
      { upsert: true }
    );
    console.log(c.slug, "upserted", r.upsertedCount, "modified", r.modifiedCount);
  }

  const all = await db.collection("categories").find({}).project({ name: 1, slug: 1 }).toArray();
  console.log("TOTAL categories:", all.length, all.map((x) => x.slug).join(","));

  // Prove a product with S3-style image key can be inserted
  const cat = all[0];
  const ins = await db.collection("products").insertOne({
    name: "__seed_test__",
    price: 1,
    description: "seed test",
    images: ["uploads/products/seed-test.jpg"],
    category: cat._id,
    productType: "simple",
    quantity: 1,
    isActive: true,
    isNew: true,
    sizes: [],
    sizeQuantities: {},
    colorQuantities: {},
    colorImages: {},
    createdAt: new Date(),
  });
  console.log("product insert OK", String(ins.insertedId));
  await db.collection("products").deleteOne({ _id: ins.insertedId });
  console.log("cleaned test product");

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

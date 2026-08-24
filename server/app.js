const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env.production") });
require("dotenv").config({ path: path.join(process.cwd(), "server", ".env") });
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectToDB = require("./src/config/db");

const userRoutes = require("./src/routes/user.routes");
const productRoutes = require("./src/routes/product.routes");
const brandRoutes = require("./src/routes/brand.routes");
const bannerRoutes = require("./src/routes/banner.routes");
const promotionRoutes = require("./src/routes/promotion.routes");
const couponRoutes = require("./src/routes/coupon.routes");
const checkoutRoutes = require("./src/routes/checkout.routes");
const permissionRoutes = require("./src/routes/perrmission.routes");
const productTypeRoutes = require("./src/routes/productType.routes");

let appPromise = null;

async function getApp() {
  if (appPromise) return appPromise;

  appPromise = (async () => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // Health does not need DB — useful on Amplify cold starts
    app.get("/api/health", (_req, res) => {
      res.json({
        ok: true,
        service: "khareedo-api",
        hasMongoEnv: Boolean(process.env.MONGO_DB_URL),
      });
    });

    try {
      await connectToDB();
      try {
        const ensureAdminSeed = require("./src/Seeder/ensureAdmin");
        const ensureDefaultCategories = require("./src/Seeder/ensureCategories");
        const ensureProductTypes = require("./src/Seeder/ensureProductTypes");
        await ensureAdminSeed();
        await ensureDefaultCategories();
        await ensureProductTypes();
        if (process.env.FORCE_DEMO_SEED === "true") {
          const ensureDemoCatalog = require("./src/Seeder/ensureDemoCatalog");
          await ensureDemoCatalog();
        }
      } catch (seedErr) {
        console.error("[getApp] Seed failed:", seedErr.message);
      }
    } catch (err) {
      console.error("[getApp] MongoDB failed:", err.message);
      app.use("/api", (_req, res) => {
        res.status(503).json({
          ok: false,
          message: "Database unavailable: " + err.message,
          hint: "Set MONGO_DB_URL in Amplify environment variables and allow 0.0.0.0/0 in Atlas Network Access",
        });
      });
      return app;
    }

    app.use("/api/user", userRoutes);
    app.use("/api/product", productRoutes);
    app.use("/api/brand", brandRoutes);
    app.use("/api/banner", bannerRoutes);
    app.use("/api/promotion", promotionRoutes);
    app.use("/api/coupon", couponRoutes);
    app.use("/api/checkout", checkoutRoutes);
    app.use("/api/permission", permissionRoutes);
    app.use("/api/product-type", productTypeRoutes);

    return app;
  })().catch((err) => {
    appPromise = null;
    throw err;
  });

  return appPromise;
}

module.exports = { getApp };

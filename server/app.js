const path = require("path");
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

let appPromise = null;

async function getApp() {
  if (appPromise) return appPromise;

  appPromise = (async () => {
    await connectToDB();

    const app = express();
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.get("/api/health", (_req, res) => {
      res.json({ ok: true, service: "khareedo-api" });
    });

    app.use("/api/user", userRoutes);
    app.use("/api/product", productRoutes);
    app.use("/api/brand", brandRoutes);
    app.use("/api/banner", bannerRoutes);
    app.use("/api/promotion", promotionRoutes);
    app.use("/api/coupon", couponRoutes);
    app.use("/api/checkout", checkoutRoutes);
    app.use("/api/permission", permissionRoutes);

    return app;
  })();

  return appPromise;
}

module.exports = { getApp };

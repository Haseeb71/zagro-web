const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const { getApp } = require("./app");

const port = process.env.API_PORT || process.env.PORT || 3006;

getApp()
  .then((app) => {
    app.listen(port, () => {
      console.log(`Ecommerce API running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start API:", err);
    process.exit(1);
  });

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const DEMO = path.join(__dirname, "../uploads/demo");

function request(method, urlPath, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "localhost", port: 3006, path: urlPath, method, headers },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => resolve({ status: res.statusCode, body: buf }));
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          return reject(new Error("HTTP " + res.statusCode));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
      })
      .on("error", reject);
  });
}

function multipart(fields, files) {
  const boundary = "----ZagroBoundary" + Date.now();
  const chunks = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === "") continue;
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`
      )
    );
  }
  for (const file of files) {
    const filename = path.basename(file);
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="images"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`
      )
    );
    chunks.push(fs.readFileSync(file));
    chunks.push(Buffer.from("\r\n"));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return { body: Buffer.concat(chunks), boundary };
}

(async () => {
  if (!fs.existsSync(DEMO)) fs.mkdirSync(DEMO, { recursive: true });

  const multiFiles = [];
  for (let i = 1; i <= 4; i++) {
    const dest = path.join(DEMO, `gallery-${i}.jpg`);
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
      try {
        await download(`https://picsum.photos/seed/zagro-gallery-${i}/900/900`, dest);
      } catch (e) {
        // fallback: copy any existing jpg in demo
        const any = fs.readdirSync(DEMO).find((f) => f.endsWith(".jpg"));
        if (!any) throw e;
        fs.copyFileSync(path.join(DEMO, any), dest);
      }
    }
    multiFiles.push(dest);
  }

  const login = await request(
    "POST",
    "/api/user/login",
    JSON.stringify({ email: "admin@zagro.com", password: "admin@123" }),
    { "Content-Type": "application/json" }
  );
  const token = JSON.parse(login.body).token;

  const list = await request("POST", "/api/product/", "{}", {
    "Content-Type": "application/json",
  });
  const products = JSON.parse(list.body).products || [];
  // Prefer Rolex Submariner for a nice demo gallery
  const p =
    products.find((x) => /Submariner/i.test(x.name)) ||
    products.find((x) => (x.images || []).length > 0) ||
    products[0];
  if (!p) throw new Error("No products");

  // Remove old images from DB only (do not unlink demo files) by setting empty then adding —
  // safest: send imagesToRemove for DB paths if they exist, without deleting physical if missing
  const fields = {
    name: p.name,
    price: String(p.price),
    description:
      (p.description || "") +
      " Gallery demo: open this product to see multiple photos and thumbnails on the detail page.",
    quantity: String(p.quantity || 25),
    category: String(p.category?._id || p.category),
    brand: String(p.brand?._id || p.brand || ""),
    isActive: "true",
  };

  // Clear previous image list in DB so we don't stack forever
  if (Array.isArray(p.images) && p.images.length) {
    fields.imagesToRemove = JSON.stringify(p.images);
  }

  const { body, boundary } = multipart(fields, multiFiles);
  const updated = await request("POST", `/api/product/update/${p._id}`, body, {
    Authorization: `Bearer ${token}`,
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Content-Length": body.length,
  });

  console.log("update", updated.status);
  const check = JSON.parse((await request("GET", `/api/product/${p._id}`)).body);
  const imgs = check.product?.images || [];
  console.log("PRODUCT=" + check.product?.name);
  console.log("ID=" + p._id);
  console.log("IMAGES=" + imgs.length);
  imgs.forEach((img) => console.log(" - " + img));
  console.log("URL=http://localhost:3000/products/" + p._id);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

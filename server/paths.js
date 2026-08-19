const fs = require("fs");
const path = require("path");

/** Uploads live under public/ so Next.js serves /uploads in one deploy. */
function getUploadsRoot() {
  const root = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  return root;
}

function getDemoUploadDir() {
  const dir = path.join(getUploadsRoot(), "demo");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function relativeUploadPath(absPath) {
  const uploadsRoot = getUploadsRoot();
  const rel = path.relative(uploadsRoot, absPath).replace(/\\/g, "/");
  return `uploads/${rel}`;
}

module.exports = {
  getUploadsRoot,
  getDemoUploadDir,
  relativeUploadPath,
};

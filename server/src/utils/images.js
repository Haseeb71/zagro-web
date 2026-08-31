const fs = require("fs");
const { parseMaybeJson } = require("./inventory");

function getS3() {
  try {
    return require("../services/s3.service");
  } catch (err) {
    console.error("[images] S3 module unavailable:", err.message);
    return null;
  }
}

function collectImageKeys(req, fieldName = "imageKeys") {
  const s3 = getS3();
  const normalize = (v) => (s3 ? s3.normalizeStoredMediaValue(String(v)) : String(v));

  const parsed = parseMaybeJson(req.body?.[fieldName]);
  if (Array.isArray(parsed)) {
    return parsed.map(normalize).filter(Boolean);
  }

  /** Backward compat: accept legacy imageUrls */
  const legacy = parseMaybeJson(req.body?.imageUrls);
  if (Array.isArray(legacy)) {
    return legacy.map(normalize).filter(Boolean);
  }
  return [];
}

function collectMultipartImagePaths(req, fieldName = "images") {
  if (!req.files?.length) return [];
  return req.files
    .filter((f) => f.fieldname === fieldName)
    .map((f) => f.path)
    .filter(Boolean);
}

function mergeProductImages(req) {
  const fromS3 = collectImageKeys(req, "imageKeys");
  const fromDisk = collectMultipartImagePaths(req, "images");
  return [...fromS3, ...fromDisk];
}

async function removeStoredImage(storedValue) {
  if (!storedValue) return;

  const s3 = getS3();
  if (s3) {
    const normalized = s3.normalizeStoredMediaValue(storedValue);
    if (s3.isS3ObjectKey(normalized) || s3.isS3Url(storedValue)) {
      try {
        await s3.deleteStoredMedia(storedValue);
      } catch (err) {
        console.error("[images] S3 delete failed:", storedValue, err.message);
      }
      return;
    }
  }

  try {
    if (fs.existsSync(storedValue)) {
      fs.unlinkSync(storedValue);
    }
  } catch (err) {
    console.error("[images] local delete failed:", storedValue, err.message);
  }
}

async function removeStoredImages(imagePaths) {
  const list = Array.isArray(imagePaths) ? imagePaths : [];
  for (const p of list) {
    await removeStoredImage(p);
  }
}

module.exports = {
  collectImageKeys,
  collectMultipartImagePaths,
  mergeProductImages,
  removeStoredImage,
  removeStoredImages,
};

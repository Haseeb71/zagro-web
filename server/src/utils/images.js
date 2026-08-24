const fs = require("fs");
const { parseMaybeJson } = require("./inventory");
const s3 = require("../services/s3.service");

function collectImageUrls(req, fieldName = "imageUrls") {
  const parsed = parseMaybeJson(req.body?.[fieldName]);
  if (Array.isArray(parsed)) {
    return parsed.map(String).filter(Boolean);
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
  const fromS3 = collectImageUrls(req, "imageUrls");
  const fromDisk = collectMultipartImagePaths(req, "images");
  return [...fromS3, ...fromDisk];
}

async function removeStoredImage(imagePath) {
  if (!imagePath) return;
  if (s3.isS3Url(imagePath)) {
    try {
      await s3.deleteObjectByUrl(imagePath);
    } catch (err) {
      console.error("[images] S3 delete failed:", imagePath, err.message);
    }
    return;
  }
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (err) {
    console.error("[images] local delete failed:", imagePath, err.message);
  }
}

async function removeStoredImages(imagePaths) {
  const list = Array.isArray(imagePaths) ? imagePaths : [];
  for (const p of list) {
    await removeStoredImage(p);
  }
}

module.exports = {
  collectImageUrls,
  collectMultipartImagePaths,
  mergeProductImages,
  removeStoredImage,
  removeStoredImages,
};

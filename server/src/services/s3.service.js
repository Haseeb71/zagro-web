const crypto = require("crypto");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

let s3Client = null;

/** Allowed upload profiles by folder/type */
const UPLOAD_PROFILES = {
  products: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxBytes: 10 * 1024 * 1024,
  },
  brands: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxBytes: 5 * 1024 * 1024,
  },
  categories: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxBytes: 5 * 1024 * 1024,
  },
  banners: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxBytes: 8 * 1024 * 1024,
  },
  promotions: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxBytes: 8 * 1024 * 1024,
  },
};

function getRegion() {
  return process.env.S3_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
}

function getBucket() {
  return process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || "";
}

function isS3Enabled() {
  return Boolean(getBucket() && getRegion());
}

/** Default credential provider chain — Amplify Compute IAM role, no static keys */
function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({ region: getRegion() });
  }
  return s3Client;
}

function safeFilename(name) {
  return String(name || "file")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

function getExtension(filename) {
  const m = String(filename || "").toLowerCase().match(/(\.[a-z0-9]+)$/i);
  return m ? m[1] : "";
}

function validateUploadRequest({ filename, contentType, folder, sizeBytes }) {
  const type = String(folder || "products").replace(/[^a-zA-Z0-9_-]/g, "") || "products";
  const profile = UPLOAD_PROFILES[type] || UPLOAD_PROFILES.products;
  const ext = getExtension(filename);
  const mime = (contentType || "").toLowerCase();

  if (!filename || !String(filename).trim()) {
    return { ok: false, message: "filename is required" };
  }
  if (ext && !profile.extensions.includes(ext)) {
    return { ok: false, message: `File type not allowed. Allowed: ${profile.extensions.join(", ")}` };
  }
  if (mime && !profile.mimes.includes(mime)) {
    return { ok: false, message: `MIME type not allowed: ${mime}` };
  }
  if (sizeBytes != null && Number(sizeBytes) > profile.maxBytes) {
    return { ok: false, message: `File too large. Max ${Math.round(profile.maxBytes / (1024 * 1024))}MB` };
  }
  return { ok: true, type, profile };
}

function buildObjectKey(type, filename) {
  const safeType = String(type || "products").replace(/[^a-zA-Z0-9_-]/g, "") || "products";
  const randomId = crypto.randomBytes(8).toString("hex");
  return `uploads/${safeType}/${Date.now()}-${randomId}-${safeFilename(filename)}`;
}

function isS3ObjectKey(value) {
  if (!value || typeof value !== "string") return false;
  if (value.startsWith("http://") || value.startsWith("https://")) return false;
  return /^uploads\/[a-zA-Z0-9_-]+\/.+/.test(value);
}

function isS3Url(url) {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  const bucket = getBucket();
  if (!bucket) return false;
  return url.includes(`${bucket}.s3.`) || url.includes(`s3.amazonaws.com/${bucket}/`);
}

function keyFromUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const bucket = getBucket();
    if (u.hostname.startsWith(`${bucket}.s3.`)) {
      return decodeURIComponent(u.pathname.replace(/^\//, ""));
    }
    if (u.hostname === "s3.amazonaws.com" && u.pathname.startsWith(`/${bucket}/`)) {
      return decodeURIComponent(u.pathname.slice(bucket.length + 2));
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

/** Normalize legacy DB values → S3 key for storage, or pass through local/http paths */
function normalizeStoredMediaValue(value) {
  if (!value) return value;
  const raw = String(value);
  if (isS3ObjectKey(raw)) return raw;
  if (isS3Url(raw)) {
    const key = keyFromUrl(raw);
    if (key) return key;
  }
  return raw;
}

function assertSafeObjectKey(key) {
  if (!key || typeof key !== "string") {
    throw new Error("Invalid object key");
  }
  const decoded = decodeURIComponent(key);
  if (decoded.includes("..") || decoded.startsWith("/") || !decoded.startsWith("uploads/")) {
    throw new Error("Invalid object key path");
  }
  return decoded;
}

async function createPresignedUpload({ filename, contentType, folder = "products", sizeBytes }) {
  if (!isS3Enabled()) {
    throw new Error("S3 is not configured. Set S3_BUCKET_NAME and S3_REGION in Amplify.");
  }
  const validation = validateUploadRequest({ filename, contentType, folder, sizeBytes });
  if (!validation.ok) {
    const err = new Error(validation.message);
    err.statusCode = 400;
    throw err;
  }

  const key = buildObjectKey(validation.type, filename);
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 900 });

  return { uploadUrl, key, contentType: contentType || "application/octet-stream" };
}

async function createPresignedDownload(key, expiresIn = 3600) {
  if (!isS3Enabled()) {
    throw new Error("S3 is not configured");
  }
  const safeKey = assertSafeObjectKey(key);
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: safeKey,
  });
  const downloadUrl = await getSignedUrl(getS3Client(), command, { expiresIn });
  return { downloadUrl, key: safeKey, expiresIn };
}

async function deleteObjectByKey(key) {
  if (!isS3Enabled() || !key) return false;
  const safeKey = assertSafeObjectKey(key);
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: safeKey,
    })
  );
  return true;
}

async function deleteStoredMedia(value) {
  const normalized = normalizeStoredMediaValue(value);
  if (isS3ObjectKey(normalized)) {
    await deleteObjectByKey(normalized);
    return true;
  }
  if (isS3Url(value)) {
    const key = keyFromUrl(value);
    if (key) await deleteObjectByKey(key);
    return true;
  }
  return false;
}

module.exports = {
  UPLOAD_PROFILES,
  isS3Enabled,
  isS3ObjectKey,
  isS3Url,
  keyFromUrl,
  normalizeStoredMediaValue,
  assertSafeObjectKey,
  validateUploadRequest,
  buildObjectKey,
  createPresignedUpload,
  createPresignedDownload,
  deleteObjectByKey,
  deleteStoredMedia,
  getBucket,
  getRegion,
};

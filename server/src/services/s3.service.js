const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

let s3Client = null;

function getRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
}

function getBucket() {
  return process.env.AWS_S3_BUCKET || "";
}

function isS3Enabled() {
  return Boolean(
    getBucket() &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
  );
}

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: getRegion(),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

function getPublicBaseUrl() {
  const custom = (process.env.AWS_S3_PUBLIC_URL || "").replace(/\/$/, "");
  if (custom) return custom;
  const bucket = getBucket();
  const region = getRegion();
  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

function safeFilename(name) {
  return String(name || "file")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

function buildObjectKey(folder, filename) {
  const safeFolder = String(folder || "uploads")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/^\/+|\/+$/g, "");
  return `${safeFolder}/${Date.now()}-${safeFilename(filename)}`;
}

function publicUrlForKey(key) {
  return `${getPublicBaseUrl()}/${key}`;
}

function isS3Url(url) {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  const base = getPublicBaseUrl();
  if (base && url.startsWith(base)) return true;
  const bucket = getBucket();
  return bucket ? url.includes(`${bucket}.s3.`) || url.includes(`s3.amazonaws.com/${bucket}/`) : false;
}

function keyFromUrl(url) {
  if (!url) return null;
  const base = getPublicBaseUrl();
  if (base && url.startsWith(base + "/")) {
    return url.slice(base.length + 1);
  }
  try {
    const u = new URL(url);
    const bucket = getBucket();
    if (u.hostname.startsWith(`${bucket}.s3.`)) {
      return u.pathname.replace(/^\//, "");
    }
    if (u.hostname === "s3.amazonaws.com" && u.pathname.startsWith(`/${bucket}/`)) {
      return u.pathname.slice(bucket.length + 2);
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

async function createPresignedUpload({ filename, contentType, folder = "products" }) {
  if (!isS3Enabled()) {
    throw new Error("S3 is not configured. Set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in Amplify.");
  }
  const key = buildObjectKey(folder, filename);
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 900 });
  return {
    uploadUrl,
    publicUrl: publicUrlForKey(key),
    key,
  };
}

async function deleteObjectByUrl(url) {
  if (!isS3Enabled() || !isS3Url(url)) return false;
  const key = keyFromUrl(url);
  if (!key) return false;
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
  return true;
}

module.exports = {
  isS3Enabled,
  isS3Url,
  getPublicBaseUrl,
  createPresignedUpload,
  deleteObjectByUrl,
  publicUrlForKey,
};

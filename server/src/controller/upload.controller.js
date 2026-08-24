const {
  createPresignedUpload,
  createPresignedDownload,
  isS3Enabled,
  isS3ObjectKey,
  assertSafeObjectKey,
} = require("../services/s3.service");

function safeErrorMessage(err, fallback = "Request failed") {
  if (err?.statusCode === 400) return err.message;
  console.error("[upload]", err);
  return fallback;
}

const createUploadPresign = async (req, res) => {
  try {
    if (!isS3Enabled()) {
      return res.status(503).json({
        message: "File storage is not configured. Set S3_BUCKET_NAME and S3_REGION in Amplify.",
      });
    }

    const { filename, contentType, folder, sizeBytes } = req.body || {};
    const result = await createPresignedUpload({
      filename,
      contentType: contentType || "application/octet-stream",
      folder: folder || "products",
      sizeBytes,
    });

    res.status(200).json({
      uploadUrl: result.uploadUrl,
      key: result.key,
      contentType: result.contentType,
      message: "Presigned upload URL created",
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: safeErrorMessage(error, "Could not prepare upload") });
  }
};

/** Returns a short-lived signed GET URL (JSON) — for clients that fetch URL first */
const createDownloadPresign = async (req, res) => {
  try {
    if (!isS3Enabled()) {
      return res.status(503).json({ message: "File storage is not configured" });
    }
    const key = req.query.key || req.body?.key;
    if (!key) {
      return res.status(400).json({ message: "key is required" });
    }
    const safeKey = assertSafeObjectKey(String(key));
    const result = await createPresignedDownload(safeKey);
    res.status(200).json({
      url: result.downloadUrl,
      key: result.key,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: safeErrorMessage(error, "Could not prepare download") });
  }
};

/** Redirect to signed GET URL — use as img src for private bucket objects */
const redirectToMedia = async (req, res) => {
  try {
    if (!isS3Enabled()) {
      return res.status(503).json({ message: "File storage is not configured" });
    }
    const key = req.query.key;
    if (!key) {
      return res.status(400).json({ message: "key is required" });
    }
    const safeKey = assertSafeObjectKey(String(key));
    const { downloadUrl } = await createPresignedDownload(safeKey, 3600);
    res.redirect(302, downloadUrl);
  } catch (error) {
    console.error("[upload] redirectToMedia:", error.message);
    res.status(404).json({ message: "Media not found" });
  }
};

module.exports = {
  createUploadPresign,
  createDownloadPresign,
  redirectToMedia,
};

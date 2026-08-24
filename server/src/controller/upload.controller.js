const { createPresignedUpload, isS3Enabled } = require("../services/s3.service");

const createUploadPresign = async (req, res) => {
  try {
    if (!isS3Enabled()) {
      return res.status(503).json({
        message:
          "S3 upload is not configured. Add AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION in Amplify.",
      });
    }
    const { filename, contentType, folder } = req.body || {};
    if (!filename) {
      return res.status(400).json({ message: "filename is required" });
    }
    const result = await createPresignedUpload({
      filename,
      contentType: contentType || "application/octet-stream",
      folder: folder || "products",
    });
    res.status(200).json({
      ...result,
      message: "Presigned upload URL created",
    });
  } catch (error) {
    console.error("createUploadPresign:", error);
    res.status(500).json({ message: error.message || "Presign failed" });
  }
};

module.exports = { createUploadPresign };

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createUploadPresign,
  createDownloadPresign,
  redirectToMedia,
} = require("../controller/upload.controller");

router.post("/presign", authMiddleware, createUploadPresign);
router.get("/sign", createDownloadPresign);
router.post("/sign", createDownloadPresign);
router.get("/media", redirectToMedia);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { createUploadPresign } = require("../controller/upload.controller");

router.post("/presign", authMiddleware, createUploadPresign);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getPermissions,
  getRoles,
  createRole,
  deleteRole,
  updateRole,
  addWorker,
  getAllWorkers,
  editWorker,
  deleteWorker,
  getUserPermissions,
  setUserPermissions,
  getAllPermissionSlugs,
} = require("../controller/permission.controller");
const { requireAdmin } = require("../middlewares/permission.middleware");

// All permission & role management is admin-only
router.get("/", ...requireAdmin, getPermissions);
router.get("/all-slugs", ...requireAdmin, getAllPermissionSlugs);
router.get("/roles", ...requireAdmin, getRoles);
router.post("/roles/add", ...requireAdmin, createRole);
router.post("/roles/delete", ...requireAdmin, deleteRole);
router.post("/roles/update", ...requireAdmin, updateRole);

// Worker management
router.post("/worker/add", ...requireAdmin, addWorker);
router.get("/worker/getall", ...requireAdmin, getAllWorkers);
router.post("/worker/edit", ...requireAdmin, editWorker);
router.post("/worker/delete", ...requireAdmin, deleteWorker);

// Per-user permission assignment
router.get("/user/:userId", ...requireAdmin, getUserPermissions);
router.put("/user/:userId", ...requireAdmin, setUserPermissions);

module.exports = router;
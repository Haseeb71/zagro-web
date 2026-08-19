const mongoose = require("mongoose");
const ActivityLog = require("../models/activityLog.model");

const safeObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (mongoose.Types.ObjectId.isValid(String(value))) {
    return new mongoose.Types.ObjectId(String(value));
  }
  return null;
};

/**
 * Log an action — awaits DB write; never throws to callers.
 */
const log = async (opts) => {
  try {
    const doc = {
      performedBy: safeObjectId(opts.performedBy),
      performedByName: opts.performedByName || null,
      action: opts.action,
      module: opts.module,
      description: opts.description,
      referenceType: opts.referenceType || null,
      before: opts.before || null,
      after: opts.after || null,
      ip: opts.ip || null,
    };
    const refId = safeObjectId(opts.referenceId);
    if (refId) doc.referenceId = refId;

    await ActivityLog.create(doc);
  } catch (err) {
    console.error("[ActivityLog] Failed to write log:", err.message, {
      action: opts.action,
      module: opts.module,
      description: opts.description?.slice?.(0, 80),
    });
  }
};

/**
 * Helper to extract user info from req object.
 */
const fromReq = (req) => ({
  performedBy: req.user?.userId || req.userDoc?._id || null,
  performedByName: req.userDoc?.name || null,
  ip: req.ip || req.headers?.["x-forwarded-for"] || null,
});

module.exports = { log, fromReq, safeObjectId };

const mongoose = require("mongoose");

/**
 * Audit trail — every significant action is logged here.
 * Immutable by design: no update/delete routes exposed.
 */
const activityLogSchema = new mongoose.Schema(
  {
    /**
     * Who performed the action.
     */
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    performedByName: { type: String, required: false },

    /**
     * Action verb: create | update | delete | view | login | permission_change |
     *              password_reset | stock_update | export
     */
    action: { type: String, required: true },

    /**
     * Module: invoice | incoming_invoice | product | permission |
     *         profile | notification | report | auth | stock
     */
    module: { type: String, required: true },

    /**
     * Human-readable description, e.g.
     * "Created outgoing invoice OUT-2026-06-001 for customer ABC Ltd"
     */
    description: { type: String, required: true },

    /**
     * Optional reference to the affected document.
     */
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: false },
    referenceType: { type: String, required: false },

    /**
     * Snapshot of relevant data before/after the change.
     */
    before: { type: mongoose.Schema.Types.Mixed, required: false },
    after: { type: mongoose.Schema.Types.Mixed, required: false },

    /**
     * IP address of the request (optional, set by controller if available).
     */
    ip: { type: String, required: false },
  },
  {
    timestamps: true,
    /**
     * Prevent accidental updates to log records.
     */
  }
);

// Index for fast queries by user, module, and date
activityLogSchema.index({ performedBy: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);

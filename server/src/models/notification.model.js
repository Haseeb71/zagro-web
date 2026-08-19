const mongoose = require("mongoose");

const readReceiptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    /**
     * Type controls the visual badge: success | error | warning | info
     */
    type: {
      type: String,
      enum: ["success", "error", "warning", "info"],
      default: "info",
    },
    /**
     * Category groups notifications for filtering.
     * invoice | stock | permission | profile | order | system
     */
    category: {
      type: String,
      enum: ["invoice", "stock", "permission", "profile", "order", "system"],
      default: "system",
    },
    /**
     * Optional link to the related resource (e.g. "/factory/invoice/abc123")
     */
    link: { type: String, required: false },
    /**
     * Reference to the document that triggered this notification.
     */
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    referenceType: { type: String, required: false },
    /**
     * If empty, the notification is broadcast to all admins.
     * If populated, only those users receive it.
     */
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    readReceipts: [readReceiptSchema],
    /** Users who dismissed/cleared this notification from their list */
    dismissedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

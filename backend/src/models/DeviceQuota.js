const mongoose = require('mongoose');

const deviceQuotaSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD, UTC
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

deviceQuotaSchema.index({ deviceId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DeviceQuota', deviceQuotaSchema);

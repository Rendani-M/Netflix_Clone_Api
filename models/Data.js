const mongoose = require("mongoose");

const DataOperationsSchema = new mongoose.Schema(
  {
    date: { type: String },
    upload: { type: Number, default: 0 },
    download: { type: Number, default: 0 },
    fileSize: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DataOperations", DataOperationsSchema);
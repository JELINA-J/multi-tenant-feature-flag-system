const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, 
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);

featureFlagSchema.index({ organization: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);

const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // prevents duplicate org names
    },
  },
  { timestamps: true } // createdAt/updatedAt for free 
);

module.exports = mongoose.model('Organization', organizationSchema);

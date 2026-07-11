const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['orgadmin'],
      default: 'orgadmin',
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true, // every org admin must belong to exactly one org
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

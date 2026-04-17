const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // UUID v7 stored as string
    },
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
    },
    gender_probability: {
      type: Number,
      required: true,
    },
    sample_size: {
      type: Number,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    age_group: {
      type: String,
      enum: ["child", "teenager", "adult", "senior"],
      required: true,
    },
    country_id: {
      type: String,
      required: true,
    },
    country_probability: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    // Disable the default _id and versionKey so we control _id ourselves
    _id: false,
    versionKey: false,
  }
);

// Format output: rename _id → id, format created_at
profileSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    gender: this.gender,
    gender_probability: this.gender_probability,
    sample_size: this.sample_size,
    age: this.age,
    age_group: this.age_group,
    country_id: this.country_id,
    country_probability: this.country_probability,
    created_at: this.created_at.toISOString(),
  };
};

profileSchema.methods.toListJSON = function () {
  return {
    id: this._id,
    name: this.name,
    gender: this.gender,
    age: this.age,
    age_group: this.age_group,
    country_id: this.country_id,
  };
};

module.exports = mongoose.model("Profile", profileSchema);

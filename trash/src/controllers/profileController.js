const { v7: uuidv7 } = require("uuid");
const Profile = require("../models/Profile");
const { enrichName } = require("../services/enrichment");

// POST /api/profiles
async function createProfile(req, res) {
  try {
    const { name } = req.body;

    // --- Validate input ---
    if (name === undefined || name === null || name === "") {
      return res.status(400).json({ status: "error", message: "Name is required" });
    }

    if (typeof name !== "string") {
      return res.status(422).json({ status: "error", message: "Name must be a string" });
    }

    const trimmedName = name.trim().toLowerCase();

    if (trimmedName === "") {
      return res.status(400).json({ status: "error", message: "Name cannot be empty" });
    }

    // --- Check for existing profile (idempotency) ---
    const existing = await Profile.findOne({ name: trimmedName });
    if (existing) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existing.toPublicJSON(),
      });
    }

    // --- Enrich name via external APIs ---
    const enriched = await enrichName(trimmedName);

    // --- Store in database ---
    const profile = new Profile({
      _id: uuidv7(),
      name: trimmedName,
      ...enriched,
      created_at: new Date(),
    });

    await profile.save();

    return res.status(201).json({
      status: "success",
      data: profile.toPublicJSON(),
    });
  } catch (err) {
    // Handle 502 errors from enrichment service
    if (err.status === 502) {
      return res.status(502).json({
        status: "error",
        message: err.message,
      });
    }

    console.error("createProfile error:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

// GET /api/profiles/:id
async function getProfile(req, res) {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ status: "error", message: "Profile not found" });
    }

    return res.status(200).json({
      status: "success",
      data: profile.toPublicJSON(),
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

// GET /api/profiles
async function getAllProfiles(req, res) {
  try {
    const { gender, country_id, age_group } = req.query;

    // Build filter object — case-insensitive
    const filter = {};

    if (gender) {
      filter.gender = { $regex: new RegExp(`^${gender}$`, "i") };
    }
    if (country_id) {
      filter.country_id = { $regex: new RegExp(`^${country_id}$`, "i") };
    }
    if (age_group) {
      filter.age_group = { $regex: new RegExp(`^${age_group}$`, "i") };
    }

    const profiles = await Profile.find(filter);

    return res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles.map((p) => p.toListJSON()),
    });
  } catch (err) {
    console.error("getAllProfiles error:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

// DELETE /api/profiles/:id
async function deleteProfile(req, res) {
  try {
    const { id } = req.params;

    const profile = await Profile.findByIdAndDelete(id);
    if (!profile) {
      return res.status(404).json({ status: "error", message: "Profile not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("deleteProfile error:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

module.exports = { createProfile, getProfile, getAllProfiles, deleteProfile };

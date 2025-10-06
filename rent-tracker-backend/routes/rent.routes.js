const express = require("express");
const { getRents, getRent, createRent, updateRent, deleteRent, getRentSummary } = require("../controllers/rent.controller.js");
const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

// Protected routes
router.get("/", authMiddleware, getRents);
router.get("/:id", authMiddleware, getRent);
router.post("/", authMiddleware, createRent);
router.put("/:id", authMiddleware, updateRent);
router.delete("/:id", authMiddleware, deleteRent);
router.get("/summary", authMiddleware, getRentSummary);

module.exports = router;

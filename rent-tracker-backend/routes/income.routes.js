const express = require("express");
const {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary // 👈 this must be imported here
} = require("../controllers/income.controller.js");

const router = express.Router();

// Routes
router.get("/summary", getIncomeSummary); // 👈 defined before /:id
router.get("/", getIncomes);
router.get("/:id", getIncome);
router.post("/", createIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

module.exports = router;

const Income = require("../models/income.model.js");
const Rent = require("../models/rent.model.js"); // added since we’re referencing Rent

// Get all incomes
const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find();
    res.status(200).json(incomes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single income
const getIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create income
const createIncome = async (req, res) => {
  try {
    const income = new Income(req.body);
    await income.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update income
const updateIncome = async (req, res) => {
  try {
    const updatedIncome = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedIncome) return res.status(404).json({ message: "Income not found" });
    res.status(200).json(updatedIncome);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete income
const deleteIncome = async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📊 Summary endpoint
const getIncomeSummary = async (req, res) => {
  try {
    const { month, propertyName } = req.query;
    if (!month) 
      return res.status(400).json({ message: "Month is required (e.g., ?month=October)" });

    // Build query dynamically
    const query = { month };
    if (propertyName) query.propertyName = propertyName;

    const incomes = await Income.find(query);

    const totalIncome = incomes.filter(i => i.paid).reduce((sum, i) => sum + i.amount, 0);
    const paidUnits = incomes.filter(i => i.paid).length;
    const unpaidUnits = incomes.filter(i => !i.paid).length;

    res.status(200).json({ month, propertyName: propertyName || "All properties", totalIncome, paidUnits, unpaidUnits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Proper export
module.exports = {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary
};

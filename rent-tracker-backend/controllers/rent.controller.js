const Rent = require("../models/rent.model.js");

// Get all rents
const getRents = async (req, res) => {
  try {
    const rents = await Rent.find();
    res.status(200).json(rents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single rent by ID
const getRent = async (req, res) => {
  try {
    const rent = await Rent.findById(req.params.id);
    if (!rent) return res.status(404).json({ message: "Rent not found" });
    res.status(200).json(rent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new rent
const createRent = async (req, res) => {
  try {
    const rent = new Rent(req.body);
    await rent.save();
    res.status(201).json(rent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update rent by ID
const updateRent = async (req, res) => {
  try {
    const updatedRent = await Rent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedRent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete rent by ID
const deleteRent = async (req, res) => {
  try {
    await Rent.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get rent summary for a specific month
const getRentSummary = async (req, res) => {
  try {
    const month = req.query.month;
    if (!month) return res.status(400).json({ message: "Month is required" });

    const rents = await Rent.find({ month });

    const totalIncome = rents.filter(r => r.paid).reduce((sum, r) => sum + r.amount, 0);
    const paidUnits = rents.filter(r => r.paid).length;
    const unpaidUnits = rents.filter(r => !r.paid).length;

    res.status(200).json({ month, totalIncome, paidUnits, unpaidUnits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getRents,
  getRent,
  createRent,
  updateRent,
  deleteRent,
  getRentSummary
};

const mongoose = require('mongoose');

const IncomeSchema = mongoose.Schema(
  {
    source: { type: String, required: true }, // e.g., "Salary"
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Income', IncomeSchema);

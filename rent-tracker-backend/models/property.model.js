const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  rent: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
});

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true }, // or mongoose.Schema.Types.ObjectId if using ObjectId
    houses: [houseSchema], // Make sure this is an array
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
const mongoose = require("mongoose");

const rentSchema = new mongoose.Schema(
  {
    propertyName: { 
      type: String, 
      required: true 
    }, // e.g. "Sunset Apartments - Flat 2B"

    tenantName: { 
      type: String, 
      required: true 
    }, // e.g. "Ramesh Kumar"

    month: { 
      type: String, 
      required: true 
    }, // e.g. "October"

    amount: { 
      type: Number, 
      required: true 
    },

    dueDate: { 
      type: Date 
    },

    paid: { 
      type: Boolean, 
      default: false 
    },

    paymentDate: { 
      type: Date 
    },

    paymentMethod: { 
      type: String, 
      enum: ["cash", "bank", "online"], 
      default: "cash" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rent", rentSchema);

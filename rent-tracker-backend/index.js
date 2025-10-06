const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const rentRoutes = require("./routes/rent.routes.js");
const incomeRoutes = require("./routes/income.routes.js");
const authRoutes = require("./routes/auth.routes.js");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // React dev server
  credentials: true               // allow cookies, authorization headers
}));

app.use(express.json());

// Routes
app.use("/api/rents", rentRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/auth", authRoutes);

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://pattabirama2000_db_user:123pattabi@cluster0.wwl7nmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("MongoDB connected");

    // Debug: list collections
    mongoose.connection.once("open", async () => {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log("Collections in this DB:", collections.map((c) => c.name));
    });

    // Start the server
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.log(err));

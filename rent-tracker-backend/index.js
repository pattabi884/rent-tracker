require('dotenv').config(); // Add this at the very top
const express = require("express");
// ... rest of your code
const mongoose = require("mongoose");
const cors = require("cors");



// Import routes
const rentRoutes = require("./routes/rent.routes.js");
const incomeRoutes = require("./routes/income.routes.js");
const authRoutes = require("./routes/auth.routes.js");
const propertyRoutes = require("./routes/property.routes.js");

const app = express();

// ==========================
// 🧩 Middleware
// ==========================
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend dev URL
    credentials: true,               // allow cookies, tokens, etc.
  })
);

app.use(express.json());

// Simple logger (for debugging)
// Simple logger (for debugging) - UPDATE THIS
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  
  // Only log body for requests that have bodies (POST, PUT, PATCH)
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log('Request Body:', req.body);
  }
  
  next();
});

// Add this RIGHT AFTER your existing logger middleware
// Enhanced logger - UPDATE THIS in index.js
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  
  // Log all incoming requests, especially POST ones
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (Object.keys(req.body).length > 0) {
      console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    } else {
      console.log('📦 Empty request body');
    }
  }
  
  next();
});

// ==========================
// 🛣️ Routes
// ==========================
app.use("/api/rents", rentRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

// ==========================
// 🗄️ MongoDB Connection
// ==========================
mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://pattabirama2000_db_user:123pattabi@cluster0.wwl7nmp.mongodb.net/rent_tracker?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("✅ MongoDB connected successfully");
     // Test database operations
    const Property = require("./models/property.model");
    Property.findOne({})
      .then(prop => console.log('🧪 Database test - Found properties:', prop ? 'Yes' : 'No'))
      .catch(err => console.log('❌ Database test error:', err));
    // ... rest of your code
    mongoose.connection.once("open", async () => {
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      console.log(
        "📦 Collections in DB:",
        collections.map((c) => c.name)
      );
    });

    // Start the server
    app.listen(3000, () =>
      console.log("🚀 Server running on http://localhost:3000")
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Add this after all route definitions in index.js
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});
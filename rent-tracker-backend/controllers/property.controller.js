const Property = require("../models/property.model.js");

// 🏗️ Create multiple properties for a user
// 🏗️ Create multiple properties for a user
const setupProperties = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { properties } = req.body;

    console.log('🚨 SETUP PROPERTIES CONTROLLER CALLED!');
    console.log('🔨 Setup properties request for user:', userId);
    console.log('📦 Properties data received:', JSON.stringify(properties, null, 2));

    if (!properties || properties.length === 0) {
      console.log('❌ No properties provided');
      return res.status(400).json({ message: "No properties provided" });
    }

    // ✅ Avoid duplicates for same user
    const createdProps = [];
    for (let p of properties) {
      const exists = await Property.findOne({ owner: userId, name: p.name });
      if (!exists) {
        // 🚨 MAKE SURE HOUSES ARE INCLUDED
        const newProp = new Property({ 
          name: p.name, 
          owner: userId, 
          houses: p.houses || [] // Ensure houses are saved
        });
        
        console.log('💾 Saving property to database...');
        await newProp.save();
        createdProps.push(newProp);
        
        console.log(`✅ Created property: "${p.name}" with ${p.houses?.length || 0} houses`);
        console.log(`📊 Saved property ID:`, newProp._id);
        
      } else {
        console.log(`⚠️ Property already exists: ${p.name}`);
      }
    }

    if (createdProps.length === 0) {
      console.log('❌ All properties already exist');
      return res.status(400).json({ message: "All property names already exist" });
    }

    console.log('🎯 Sending success response with', createdProps.length, 'properties');
    res.status(201).json({
      message: "Properties created successfully",
      properties: createdProps,
    });

  } catch (err) {
    console.error("❌ Error in setupProperties:", err);
    res.status(500).json({ message: err.message });
  }
};
// 🏘️ Add houses to a specific property
const addHouses = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { houses } = req.body;

    if (!houses || !Array.isArray(houses) || houses.length === 0) {
      return res.status(400).json({ message: "Please provide a valid houses array" });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    houses.forEach((h) => {
      property.houses.push({
        number: h.number,
        rent: h.rent,
        status: "pending",
      });
    });

    await property.save();
    res.status(200).json({ message: "Houses added", property });
  } catch (err) {
    console.error("Error adding houses:", err);
    res.status(500).json({ message: err.message });
  }
};

// 💰 Update rent status of a specific house
const updateHouseStatus = async (req, res) => {
  try {
    const { propertyId, houseId } = req.params;
    const { status } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const house = property.houses.id(houseId);
    if (!house) return res.status(404).json({ message: "House not found" });

    house.status = status;
    await property.save();

    res.status(200).json({ message: "House status updated", property });
  } catch (err) {
    console.error("Error updating house status:", err);
    res.status(500).json({ message: err.message });
  }
};

// 📊 Get property summary (per user)
// 📊 Get property summary (per user)
// 📊 Get property summary (per user)
const getPropertiesSummary = async (req, res) => {
  try {
    const userId = req.user?.userId;
    console.log('getPropertiesSummary - User ID:', userId);
    console.log('Full user object:', req.user);

    // Demo mode - return demo data if no user ID
    if (!userId) {
      console.log('No user ID - Returning demo data');
      return res.status(200).json({
        summary: [
          {
            _id: "demo-1",
            propertyName: "Sunset Apartments",
            totalHouses: 4,
            paidHouses: 2,
            pendingHouses: 2,
            totalRent: 4000,
            paidRent: 2000,
            pendingRent: 2000,
            demo: true,
          },
          {
            _id: "demo-2",
            propertyName: "River View Homes", 
            totalHouses: 6,
            paidHouses: 4,
            pendingHouses: 2,
            totalRent: 6000,
            paidRent: 4000,
            pendingRent: 2000,
            demo: true,
          }
        ],
      });
    }

    // Real user - get data from database
    console.log('Fetching properties for user ID:', userId);
    const properties = await Property.find({ owner: userId });
    console.log('Found properties:', properties.length);

    const summary = properties.map((p) => {
      const totalHouses = p.houses.length;
      const paidHouses = p.houses.filter((h) => h.status === "paid").length;
      const pendingHouses = totalHouses - paidHouses;
      const totalRent = p.houses.reduce((sum, h) => sum + (h.rent || 0), 0);
      const paidRent = p.houses
        .filter((h) => h.status === "paid")
        .reduce((sum, h) => sum + (h.rent || 0), 0);
      const pendingRent = totalRent - paidRent;

      return {
        _id: p._id,
        propertyName: p.name,
        totalHouses,
        paidHouses,
        pendingHouses,
        totalRent,
        paidRent,
        pendingRent,
        demo: false,
      };
    });

    console.log('Sending real user data:', summary.length, 'properties');
    res.status(200).json({ summary });

  } catch (err) {
    console.error("Error fetching property summary:", err);
    res.status(500).json({ message: "Server error while fetching summary" });
  }
};
// 🏢 Update property name
const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { name },
      { new: true }
    );

    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json({ message: "Property updated", property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete property
const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findByIdAndDelete(propertyId);

    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json({ message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📈 Get all property summaries (for dashboard)


// ✅ Export all functions cleanly
// ✅ Export all functions cleanly - MAKE SURE NAMES MATCH
module.exports = {
  setupProperties,
  addHouses,
  updateHouseStatus,
  getPropertiesSummary, // ✅ This should be getPropertiesSummary (plural)
  updateProperty,
  deleteProperty,
};
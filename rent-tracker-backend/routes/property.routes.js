const express = require('express');
const router = express.Router();
const {
  setupProperties,
  addHouses,
  updateHouseStatus,
  getPropertiesSummary,
  updateProperty,
  deleteProperty
} = require('../controllers/property.controller');

const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// 🚨 ADD ROUTE-SPECIFIC LOGGING
router.post('/setup', (req, res, next) => {
  console.log('🟢 POST /api/properties/setup ROUTE HIT!');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('👤 User from auth:', req.user);
  next();
}, setupProperties);

// Other routes remain the same
router.post('/:propertyId/houses', addHouses);
router.patch('/:propertyId/houses/:houseId/status', updateHouseStatus);
router.get('/summary', getPropertiesSummary);
router.put('/:propertyId', updateProperty);
router.delete('/:propertyId', deleteProperty);

module.exports = router;
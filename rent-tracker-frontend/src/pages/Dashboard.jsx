import React, { useState, useEffect } from 'react';
import { getPropertiesSummary, setupProperties, updateHouseStatus, updateProperty, deleteProperty } from '../api/api';

const Dashboard = () => {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({ name: '', housesCount: '' });
  const [loading, setLoading] = useState(false);
  const [houseDetails, setHouseDetails] = useState({});
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [user, setUser] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editName, setEditName] = useState('');

 useEffect(() => {
  // Check if token exists when dashboard loads
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🏠 Dashboard mounted - Token exists:', !!token);
  console.log('🏠 Dashboard mounted - User exists:', !!user);
  console.log('🏠 Dashboard mounted - All localStorage:', Object.keys(localStorage));
  
  if (token) {
    console.log('🔑 Token content preview:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ No token found in localStorage!');
  }
  
  fetchProperties();
}, []);
  const fetchProperties = async () => {
  try {
    console.log('Fetching properties from backend...');
    const response = await getPropertiesSummary();
    console.log('Backend response:', response.data);
    
    let propertiesData = [];
    
    if (response.data && response.data.summary) {
      propertiesData = response.data.summary;
    } else {
      console.warn('Unexpected response format:', response.data);
      throw new Error('Unexpected response format');
    }
    
    console.log('Properties data:', propertiesData);
    setProperties(propertiesData);
    
    // 🚨 FIXED DEMO MODE DETECTION
    const user = localStorage.getItem('user');
    const hasDemoProperties = propertiesData.some(p => p.demo);
    const hasRealProperties = propertiesData.some(p => !p.demo);
    
    console.log('Demo mode check:', {
      userExists: !!user,
      hasDemoProperties,
      hasRealProperties,
      propertiesCount: propertiesData.length
    });
    
    // Only use demo mode if we have explicit demo properties
    // OR if we have no user logged in
    const shouldBeDemoMode = hasDemoProperties || !user;
    setIsDemoMode(shouldBeDemoMode);
    
    console.log('Setting demo mode to:', shouldBeDemoMode);
    
    // Create house details
    const details = {};
    propertiesData.forEach((property, index) => {
      details[index] = Array(property.totalHouses).fill(0).map((_, i) => ({
        _id: property._id ? `house-${property._id}-${i}` : `house-${index}-${i}`,
        number: i + 1,
        rent: Math.floor(property.totalRent / property.totalHouses) || 1000,
        status: i < property.paidHouses ? 'paid' : 'pending'
      }));
    });
    
    setHouseDetails(details);
    
  } catch (error) {
    console.error('Error fetching properties:', error);
    setIsDemoMode(true);
    setDemoData();
  }
};
  const setDemoData = () => {
    const demoProperties = [
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
    ];
    
    const demoHouseDetails = {
      0: [
        { _id: 'demo-1-1', number: 1, rent: 1000, status: 'paid' },
        { _id: 'demo-1-2', number: 2, rent: 1000, status: 'pending' },
        { _id: 'demo-1-3', number: 3, rent: 1000, status: 'paid' },
        { _id: 'demo-1-4', number: 4, rent: 1000, status: 'pending' },
      ],
      1: [
        { _id: 'demo-2-1', number: 1, rent: 1000, status: 'paid' },
        { _id: 'demo-2-2', number: 2, rent: 1000, status: 'paid' },
        { _id: 'demo-2-3', number: 3, rent: 1000, status: 'paid' },
        { _id: 'demo-2-4', number: 4, rent: 1000, status: 'pending' },
        { _id: 'demo-2-5', number: 5, rent: 1000, status: 'paid' },
        { _id: 'demo-2-6', number: 6, rent: 1000, status: 'pending' },
      ]
    };
    
    setProperties(demoProperties);
    setHouseDetails(demoHouseDetails);
  };

  const addProperty = async () => {
  if (!newProperty.name || !newProperty.housesCount) {
    alert('Please fill in both property name and number of houses');
    return;
  }
  
  const housesCount = parseInt(newProperty.housesCount);
  if (housesCount <= 0 || housesCount > 20) {
    alert('Please enter a number between 1 and 20 for houses');
    return;
  }
  
  setLoading(true);
  try {
    const houses = Array.from({ length: housesCount }, (_, index) => ({
      number: index + 1,
      rent: 1000,
      status: "pending"
    }));

    console.log('Creating property:', newProperty.name, 'with', housesCount, 'houses');

    // 🚨 ALWAYS CALL BACKEND WHEN USER IS LOGGED IN
    const user = localStorage.getItem('user');
    console.log('User logged in:', !!user);
    
    if (user) {
      console.log('🚀 User is authenticated, calling backend API...');
      const response = await setupProperties({
        properties: [{
          name: newProperty.name,
          houses: houses
        }]
      });
      
      console.log('✅ Backend response:', response.data);
      
      // Refresh to get the real data from backend
      await fetchProperties();
    } else {
      console.log('👤 No user logged in, using local state only');
      // Only use local state if no user is logged in
      const newProp = {
        _id: `demo-${Date.now()}`,
        propertyName: newProperty.name,
        totalHouses: housesCount,
        paidHouses: 0,
        pendingHouses: housesCount,
        totalRent: housesCount * 1000,
        paidRent: 0,
        pendingRent: housesCount * 1000,
        demo: true,
      };
      
      const newHouseDetails = Array.from({ length: housesCount }, (_, i) => ({
        _id: `house-${newProp._id}-${i}`,
        number: i + 1,
        rent: 1000,
        status: 'pending'
      }));
      
      setProperties(prev => [...prev, newProp]);
      setHouseDetails(prev => ({
        ...prev,
        [properties.length]: newHouseDetails
      }));
    }
    
    // Reset form
    setNewProperty({ name: '', housesCount: '' });
    
    alert('Property added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding property:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      alert('Server error: ' + (error.response.data.message || 'Please try again'));
    } else if (error.request) {
      console.error('No response received');
      alert('Cannot connect to server. Please check if backend is running.');
    } else {
      alert('Error: ' + error.message);
    }
  }
  setLoading(false);
};
  const toggleRentStatus = async (propertyIndex, houseId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const property = properties[propertyIndex];
    const house = houseDetails[propertyIndex]?.find(h => h._id === houseId);
    
    if (!property || !house) {
      console.error('Property or house not found');
      return;
    }

    // Store original state for potential rollback
    const originalHouseStatus = house.status;
    const originalPropertyState = { ...property };

    // Optimistic UI update
    setHouseDetails(prev => {
      const newDetails = { ...prev };
      const houseIndex = newDetails[propertyIndex].findIndex(h => h._id === houseId);
      if (houseIndex !== -1) {
        newDetails[propertyIndex][houseIndex].status = newStatus;
      }
      return newDetails;
    });

    setProperties(prev => {
      const newProperties = [...prev];
      const prop = newProperties[propertyIndex];
      
      if (newStatus === 'paid') {
        prop.paidHouses += 1;
        prop.pendingHouses -= 1;
        prop.paidRent += house.rent;
        prop.pendingRent -= house.rent;
      } else {
        prop.paidHouses -= 1;
        prop.pendingHouses += 1;
        prop.paidRent -= house.rent;
        prop.pendingRent += house.rent;
      }
      return newProperties;
    });

    // Backend update for real properties
    if (!property.demo && property._id && !property._id.startsWith('new-')) {
      try {
        await updateHouseStatus(property._id, houseId, {
          status: newStatus
        });
        console.log('House status updated successfully in backend');
      } catch (error) {
        console.error('Error updating house status:', error);
        // Revert optimistic update on error
        setHouseDetails(prev => {
          const newDetails = { ...prev };
          const houseIndex = newDetails[propertyIndex].findIndex(h => h._id === houseId);
          if (houseIndex !== -1) {
            newDetails[propertyIndex][houseIndex].status = originalHouseStatus;
          }
          return newDetails;
        });
        setProperties(prev => {
          const newProperties = [...prev ];
          newProperties[propertyIndex] = originalPropertyState;
          return newProperties;
        });
        alert('Failed to update rent status. Please try again.');
      }
    }
  };

  const handleUpdateProperty = async (propertyIndex) => {
    if (!editName.trim()) {
      alert('Property name cannot be empty');
      return;
    }

    const property = properties[propertyIndex];
    
    try {
      if (!property.demo && property._id && !property._id.startsWith('new-')) {
        await updateProperty(property._id, { name: editName });
      }
      
      setProperties(prev => {
        const newProperties = [...prev];
        newProperties[propertyIndex].propertyName = editName;
        return newProperties;
      });
      
      setEditingProperty(null);
      setEditName('');
      
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property name');
    }
  };

  const handleDeleteProperty = async (propertyIndex) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    const property = properties[propertyIndex];
    
    try {
      if (!property.demo && property._id && !property._id.startsWith('new-')) {
        await deleteProperty(property._id);
      }
      
      setProperties(prev => prev.filter((_, index) => index !== propertyIndex));
      setHouseDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[propertyIndex];
        const reindexed = {};
        Object.keys(newDetails).forEach((key, newIndex) => {
          reindexed[newIndex] = newDetails[key];
        });
        return reindexed;
      });
      
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const startEditing = (propertyIndex, currentName) => {
    setEditingProperty(propertyIndex);
    setEditName(currentName);
  };

  const cancelEditing = () => {
    setEditingProperty(null);
    setEditName('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const totalStats = properties.reduce((acc, property) => {
    acc.totalHouses += property.totalHouses;
    acc.paidHouses += property.paidHouses;
    acc.pendingHouses += property.pendingHouses;
    acc.totalRent += property.totalRent;
    acc.paidRent += property.paidRent;
    acc.pendingRent += property.pendingRent;
    return acc;
  }, { totalHouses: 0, paidHouses: 0, pendingHouses: 0, totalRent: 0, paidRent: 0, pendingRent: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏠 Rent Tracker</h1>
          <p className="text-blue-100 text-lg mb-4">Click on houses to toggle rent payment status</p>
          
          {user && (
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-white">Welcome, {user.name}!</span>
              <button 
                onClick={handleLogout}
                className="ml-4 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full transition-colors"
              >
                Logout
              </button>
            </div>
          )}
          
          
          {isDemoMode && (
            <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
              🔄 Demo Mode - Using Local Data
            </div>
          )}
        </div>

        {/* Overall Stats */}
        {properties.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalStats.totalHouses}</div>
                <div className="text-gray-600">Total Houses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalStats.paidHouses}</div>
                <div className="text-gray-600">Paid Houses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{totalStats.pendingHouses}</div>
                <div className="text-gray-600">Pending Houses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">${totalStats.totalRent}</div>
                <div className="text-gray-600">Total Rent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">${totalStats.paidRent}</div>
                <div className="text-gray-600">Paid Rent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">${totalStats.pendingRent}</div>
                <div className="text-gray-600">Pending Rent</div>
              </div>
            </div>
          </div>
        )}

        {/* Add Property Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
            Add New Property
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name
              </label>
              <input
                type="text"
                placeholder="e.g., Sunset Apartments"
                value={newProperty.name}
                onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Houses
              </label>
              <input
                type="number"
                placeholder="e.g., 5"
                min="1"
                max="20"
                value={newProperty.housesCount}
                onChange={(e) => setNewProperty({...newProperty, housesCount: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <button 
            onClick={addProperty} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Property...
              </span>
            ) : (
              'Add Property'
            )}
          </button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, propertyIndex) => (
            <PropertyBuilding
              key={property._id || propertyIndex}
              property={property}
              propertyIndex={propertyIndex}
              houseDetails={houseDetails[propertyIndex] || []}
              onToggleRent={toggleRentStatus}
              onEdit={startEditing}
              onUpdate={handleUpdateProperty}
              onDelete={handleDeleteProperty}
              isEditing={editingProperty === propertyIndex}
              editName={editName}
              onEditNameChange={setEditName}
              onCancelEdit={cancelEditing}
            />
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center text-white py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-2">No Properties Yet</h3>
              <p className="text-blue-100">Add your first property using the form above to get started!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Property Building Component
const PropertyBuilding = ({ 
  property, 
  propertyIndex, 
  houseDetails, 
  onToggleRent, 
  onEdit,
  onUpdate,
  onDelete,
  isEditing,
  editName,
  onEditNameChange,
  onCancelEdit
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-white hover:border-blue-100">
      {/* Property Header with Edit/Delete Controls */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          {isEditing ? (
            <div className="flex-1 mr-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                className="w-full p-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          ) : (
            <h3 className="text-xl font-bold text-gray-800">{property.propertyName}</h3>
          )}
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button 
                  onClick={() => onUpdate(propertyIndex)}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                >
                  ✓
                </button>
                <button 
                  onClick={onCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                >
                  ✗
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onEdit(propertyIndex, property.propertyName)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                  title="Edit property name"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => onDelete(propertyIndex)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                  title="Delete property"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">🏠 {property.totalHouses} units</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">💰 ${property.totalRent}</span>
          <span className={`px-2 py-1 rounded ${
            property.pendingHouses > 0 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {property.pendingHouses > 0 ? '⚠️ Pending' : '✅ All Paid'}
          </span>
        </div>
      </div>

      {/* Building Visual - House Units */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
        {houseDetails.map((house) => (
          <HouseUnit
            key={house._id}
            house={house}
            propertyIndex={propertyIndex}
            onToggleRent={onToggleRent}
          />
        ))}
      </div>

      {/* Property Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Paid:
            </span>
            <strong className="text-green-600">
              ${property.paidRent} ({property.paidHouses})
            </strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Pending:
            </span>
            <strong className="text-red-600">
              ${property.pendingRent} ({property.pendingHouses})
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual House Unit Component with Enhanced Animations
const HouseUnit = ({ house, propertyIndex, onToggleRent }) => {
  const isPaid = house.status === 'paid';
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onToggleRent(propertyIndex, house._id, house.status);
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <div 
      className={`
        relative p-2 rounded-lg text-center cursor-pointer transition-all duration-300 
        transform border-2 shadow-sm
        ${isClicked ? 'scale-90' : 'hover:scale-110'}
        ${isPaid 
          ? 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border-green-300 hover:border-green-400 hover:shadow-lg' 
          : 'bg-gradient-to-br from-orange-50 via-amber-100 to-red-100 border-orange-300 hover:border-orange-400 hover:shadow-lg'
        }
      `}
      onClick={handleClick}
      title={`House ${house.number} - $${house.rent} - Click to mark as ${isPaid ? 'pending' : 'paid'}`}
    >
      {/* House Number */}
      <div className="font-bold text-gray-800 text-xs mb-1">#{house.number}</div>
      
      {/* Rent Amount */}
      <div className="text-xs text-gray-600 mb-2">${house.rent}</div>
      
      {/* Animated Light Indicator */}
      <div className="flex justify-center mb-1">
        <div className={`
          w-3 h-3 rounded-full border-2 transition-all duration-500
          ${isPaid 
            ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-700 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse' 
            : 'bg-gradient-to-br from-red-400 to-red-600 border-red-700 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
          }
          ${isClicked ? 'scale-150' : ''}
        `}></div>
      </div>
      
      {/* Status Text */}
      <div className={`text-xs font-semibold transition-all duration-300 ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
        {isPaid ? 'Paid' : 'Due'}
      </div>
      
      {/* Ripple Effect on Click */}
      {isClicked && (
        <div className="absolute inset-0 rounded-lg bg-white opacity-30 animate-ping"></div>
      )}
    </div>
  );
};

export default Dashboard;
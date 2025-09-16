import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TransText from '../../components/TransText';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSearch, 
  FaFilter, 
  FaMapMarkerAlt,
  FaPhone,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClock,
  FaBookmark,
  FaSpinner,
  FaSort,
  FaInfoCircle
} from 'react-icons/fa';

const PatientMedicines = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [reservationQuantity, setReservationQuantity] = useState(1);

  const categories = [
    'All', 'Pain Relief', 'Antibiotics', 'Antihistamines', 
    'Diabetes', 'Vitamins', 'Heart', 'Respiratory'
  ];

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterAndSortMedicines();
  }, [medicines, searchTerm, selectedCategory, sortBy, availableOnly]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/medicines', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      // Mock data for demo
      const mockMedicines = [
        {
          id: '1',
          name: 'Paracetamol 500mg',
          generic_name: 'Acetaminophen',
          brand: 'Crocin',
          manufacturer: 'Cipla Ltd',
          category: 'Pain Relief',
          description: 'Pain reliever and fever reducer',
          requires_prescription: false,
          total_stock: 150,
          pharmacy_locations: [
            {
              pharmacy_id: '1',
              pharmacy_name: 'Kaur Medical Store',
              contact: '+919876543213',
              address: 'Main Market, Nabha',
              quantity: 150,
              price: 25.50,
              expiry_date: '2025-12-31',
              stock_status: 'In Stock'
            }
          ]
        },
        {
          id: '2',
          name: 'Amoxicillin 250mg',
          generic_name: 'Amoxicillin',
          brand: 'Amoxil',
          manufacturer: 'Sun Pharma',
          category: 'Antibiotics',
          description: 'Antibiotic for bacterial infections',
          requires_prescription: true,
          total_stock: 8,
          pharmacy_locations: [
            {
              pharmacy_id: '1',
              pharmacy_name: 'Kaur Medical Store',
              contact: '+919876543213',
              address: 'Main Market, Nabha',
              quantity: 8,
              price: 85.00,
              expiry_date: '2024-08-15',
              stock_status: 'Low Stock'
            }
          ]
        },
        {
          id: '3',
          name: 'Cetirizine 10mg',
          generic_name: 'Cetirizine HCl',
          brand: 'Zyrtec',
          manufacturer: 'Dr. Reddy\'s',
          category: 'Antihistamines',
          description: 'Allergy relief medication',
          requires_prescription: false,
          total_stock: 0,
          pharmacy_locations: []
        }
      ];
      setMedicines(mockMedicines);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMedicines = () => {
    let filtered = medicines;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(medicine => 
        medicine.category === selectedCategory
      );
    }

    // Filter by availability
    if (availableOnly) {
      filtered = filtered.filter(medicine => medicine.total_stock > 0);
    }

    // Sort medicines
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const priceA = a.pharmacy_locations[0]?.price || 0;
          const priceB = b.pharmacy_locations[0]?.price || 0;
          return priceA - priceB;
        case 'availability':
          return b.total_stock - a.total_stock;
        default:
          return 0;
      }
    });

    setFilteredMedicines(filtered);
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'text-green-600 bg-green-100';
      case 'Low Stock':
        return 'text-yellow-600 bg-yellow-100';
      case 'Out of Stock':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStockIcon = (status) => {
    switch (status) {
      case 'In Stock':
        return FaCheckCircle;
      case 'Low Stock':
        return FaExclamationTriangle;
      case 'Out of Stock':
        return FaTimesCircle;
      default:
        return FaInfoCircle;
    }
  };

  const handleReserveMedicine = (medicine, pharmacy) => {
    setSelectedMedicine(medicine);
    setSelectedPharmacy(pharmacy);
    setReservationQuantity(1);
    setShowReservationModal(true);
  };

  const confirmReservation = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/medicines/${selectedMedicine.id}/reserve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pharmacy_id: selectedPharmacy.pharmacy_id,
          quantity: reservationQuantity
        })
      });

      if (response.ok) {
  alert(t('reservation_success'));
        setShowReservationModal(false);
        fetchMedicines(); // Refresh data
      } else {
        const error = await response.json();
  alert(error.message || t('reservation_failed'));
      }
    } catch (error) {
      console.error('Error reserving medicine:', error);
  alert(t('reservation_error'));
    }
  };

  const requestRareMedicine = async (medicine) => {
    try {
      const response = await fetch('http://localhost:5000/api/medicines/rare-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicine_id: medicine.id,
          notes: `Patient requests ${medicine.name}`
        })
      });

      if (response.ok) {
  alert(t('rare_request_success'));
      } else {
        const error = await response.json();
  alert(error.message || t('rare_request_failed'));
      }
    } catch (error) {
      console.error('Error requesting rare medicine:', error);
  alert(t('rare_request_error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">{t('loading_medicines')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('find_medicines')}
          </h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_medicines')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
            >
              <FaFilter className="mr-2" />
              {t('filters')}
            </button>
            
            <div className="flex items-center space-x-2">
              <FaSort className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="name">{t('name_asc')}</option>
                <option value="price">{t('price_low_high')}</option>
                <option value="availability">{t('stock_high_low')}</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('category')}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {categories.map(category => (
                      <option key={category} value={category === 'All' ? '' : category}>
                        {t(category.toLowerCase().replace(' ', '_'))}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available-only"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="available-only" className="text-sm text-gray-700">
                    {t('show_available_only')}
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        <p className="text-gray-600 mb-4">
          {t('found_medicines', { count: filteredMedicines.length })}
        </p>

        <div className="space-y-4">
          {filteredMedicines.map((medicine) => (
            <div key={medicine.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    <TransText text={medicine.name} />
                  </h3>
                  <p className="text-gray-600 text-sm">
                    <TransText text={`${medicine.generic_name} • ${medicine.manufacturer}`} />
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    <TransText text={medicine.description} />
                  </p>
                </div>
                
                {medicine.requires_prescription && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {t('prescription_required')}
                  </span>
                )}
              </div>

              {/* Pharmacy Locations */}
              {medicine.pharmacy_locations.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">
                    {t('available_at')}:
                  </h4>
                  {medicine.pharmacy_locations.map((pharmacy, index) => {
                    const StatusIcon = getStockIcon(pharmacy.stock_status);
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">
                              <TransText text={pharmacy.pharmacy_name} />
                            </h5>
                            <div className="flex items-center text-gray-600 text-sm mt-1">
                              <FaMapMarkerAlt className="mr-1" />
                              <TransText text={pharmacy.address} />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-800">
                              ₹{pharmacy.price}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {t('expires')}: {pharmacy.expiry_date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`flex items-center px-2 py-1 rounded-full text-xs ${getStockStatusColor(pharmacy.stock_status)}`}>
                              <StatusIcon className="mr-1" />
                              {t(pharmacy.stock_status.toLowerCase().replace(/ /g,'_'))} ({pharmacy.quantity})
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(`tel:${pharmacy.contact}`, '_self')}
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-gray-700 text-sm"
                            >
                              <FaPhone className="mr-1" />
                              {t('call')}
                            </button>
                            
                            {pharmacy.quantity > 0 && (
                              <button
                                onClick={() => handleReserveMedicine(medicine, pharmacy)}
                                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
                              >
                                <FaBookmark className="mr-1" />
                                {t('reserve')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaTimesCircle className="text-red-500 text-2xl mx-auto mb-2" />
                  <p className="text-gray-600 mb-3">
                    {t('not_available')}
                  </p>
                  <button
                    onClick={() => requestRareMedicine(medicine)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {t('request_rare')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-8">
            <FaSearch className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">
              {t('no_medicines_found')}
            </p>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t('reserve_medicine')}
            </h3>
            
            <div className="mb-4">
              <p className="font-medium"><TransText text={selectedMedicine?.name || ''} /></p>
              <p className="text-sm text-gray-600"><TransText text={selectedPharmacy?.pharmacy_name || ''} /></p>
              <p className="text-sm text-gray-600">₹{selectedPharmacy?.price} per unit</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('quantity')}
              </label>
              <input
                type="number"
                min="1"
                max={selectedPharmacy?.quantity}
                value={reservationQuantity}
                onChange={(e) => setReservationQuantity(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('max_available')}: {selectedPharmacy?.quantity}
              </p>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                {t('total_cost')}: ₹{(selectedPharmacy?.price * reservationQuantity).toFixed(2)}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowReservationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmReservation}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                {t('confirm_reservation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMedicines;
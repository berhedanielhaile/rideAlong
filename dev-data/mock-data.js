// =====================================================
// RIDEALONG MOCK DATA
// Realistic test data for development and demos
// =====================================================

const MOCK_DATA = {
  // ===== LOCATIONS =====
  locations: [
    { id: 'LOC001', name: 'Bole', lat: 9.0371, lng: 38.7533, area: 'Addis Ababa', coordinates: [38.7533, 9.0371] },
    { id: 'LOC002', name: 'Kazanchis', lat: 9.0247, lng: 38.8075, area: 'Addis Ababa', coordinates: [38.8075, 9.0247] },
    { id: 'LOC003', name: 'Piassa', lat: 9.0321, lng: 38.7467, area: 'Addis Ababa', coordinates: [38.7467, 9.0321] },
    { id: 'LOC004', name: 'Mexico Square', lat: 9.0298, lng: 38.7421, area: 'Addis Ababa', coordinates: [38.7421, 9.0298] },
    { id: 'LOC005', name: 'Saris', lat: 9.0153, lng: 38.7644, area: 'Addis Ababa', coordinates: [38.7644, 9.0153] },
    { id: 'LOC006', name: 'CMC', lat: 9.0421, lng: 38.7587, area: 'Addis Ababa', coordinates: [38.7587, 9.0421] },
    { id: 'LOC007', name: 'Megenagna', lat: 9.0095, lng: 38.7702, area: 'Addis Ababa', coordinates: [38.7702, 9.0095] },
    { id: 'LOC008', name: 'Gerji', lat: 9.0526, lng: 38.7913, area: 'Addis Ababa', coordinates: [38.7913, 9.0526] },
    { id: 'LOC009', name: '4 Kilo', lat: 9.0742, lng: 38.7811, area: 'Addis Ababa', coordinates: [38.7811, 9.0742] },
    { id: 'LOC010', name: 'Airport', lat: 8.9953, lng: 38.7982, area: 'Addis Ababa', coordinates: [38.7982, 8.9953] },
    { id: 'LOC011', name: 'Lafto', lat: 9.0851, lng: 38.7935, area: 'Addis Ababa', coordinates: [38.7935, 9.0851] },
    { id: 'LOC012', name: 'Arat Kilo', lat: 9.0298, lng: 38.7391, area: 'Addis Ababa', coordinates: [38.7391, 9.0298] },
    { id: 'LOC013', name: 'Meskel Square', lat: 9.0298, lng: 38.7465, area: 'Addis Ababa', coordinates: [38.7465, 9.0298] },
  ],

  // ===== VEHICLES =====
  vehicles: [
    {
      id: 'VEH001',
      plate_number: 'AA 123 ABC',
      model: 'Toyota Corolla',
      color: 'Silver',
      year: 2022,
      meter_serial_number: 'METER-001-2022',
      type: 'sedan',
      capacity: 4,
    },
    {
      id: 'VEH002',
      plate_number: 'AA 456 DEF',
      model: 'Honda Civic',
      color: 'Black',
      year: 2021,
      meter_serial_number: 'METER-002-2021',
      type: 'sedan',
      capacity: 4,
    },
    {
      id: 'VEH003',
      plate_number: 'AA 789 GHI',
      model: 'Hyundai i20',
      color: 'White',
      year: 2023,
      meter_serial_number: 'METER-003-2023',
      type: 'sedan',
      capacity: 4,
    },
    {
      id: 'VEH004',
      plate_number: 'AA 321 JKL',
      model: 'Mitsubishi Lancer',
      color: 'Blue',
      year: 2020,
      meter_serial_number: 'METER-004-2020',
      type: 'sedan',
      capacity: 4,
    },
    {
      id: 'VEH005',
      plate_number: 'AA 654 MNO',
      model: 'Toyota Yaris',
      color: 'Red',
      year: 2022,
      meter_serial_number: 'METER-005-2022',
      type: 'sedan',
      capacity: 4,
    },
  ],

  // ===== PASSENGERS =====
  passengers: [
    {
      id: 'P001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phoneNumber: '+251912345678',
      role: 'passenger',
      createdAt: new Date('2024-01-15'),
      passengerProfile: {
        default_payment_method: 'visa',
        saved_Places: [
          { name: 'Home', adress: '123 Bole Street, Addis Ababa', coordinates: [38.7533, 9.0371] },
          { name: 'Work', adress: '456 Kazanchis Avenue, Addis Ababa', coordinates: [38.8075, 9.0247] },
        ],
        total_rides: 156,
        rating: 4.9,
      },
    },
    {
      id: 'P002',
      name: 'Abebe Tekle',
      email: 'abebe.tekle@email.com',
      phoneNumber: '+251911234567',
      role: 'passenger',
      createdAt: new Date('2024-02-20'),
      passengerProfile: {
        default_payment_method: 'telebirr',
        saved_Places: [
          { name: 'Home', adress: 'Piassa, Addis Ababa', coordinates: [38.7467, 9.0321] },
        ],
        total_rides: 89,
        rating: 4.7,
      },
    },
    {
      id: 'P003',
      name: 'Marta Alemayehu',
      email: 'marta.alemayehu@email.com',
      phoneNumber: '+251913456789',
      role: 'passenger',
      createdAt: new Date('2024-03-10'),
      passengerProfile: {
        default_payment_method: 'cbe_bank',
        saved_Places: [
          { name: 'Home', adress: 'Mexico Square, Addis Ababa', coordinates: [38.7421, 9.0298] },
          { name: 'Gym', adress: 'Saris, Addis Ababa', coordinates: [38.7644, 9.0153] },
        ],
        total_rides: 234,
        rating: 4.8,
      },
    },
    {
      id: 'P004',
      name: 'Kaleab Hailu',
      email: 'kaleab.hailu@email.com',
      phoneNumber: '+251914567890',
      role: 'passenger',
      createdAt: new Date('2024-01-05'),
      passengerProfile: {
        default_payment_method: 'visa',
        saved_Places: [],
        total_rides: 67,
        rating: 4.6,
      },
    },
    {
      id: 'P005',
      name: 'Yohannes Kebede',
      email: 'yohannes.kebede@email.com',
      phoneNumber: '+251915678901',
      role: 'passenger',
      createdAt: new Date('2024-02-01'),
      passengerProfile: {
        default_payment_method: 'telebirr',
        saved_Places: [
          { name: 'Home', adress: 'CMC, Addis Ababa', coordinates: [38.7587, 9.0421] },
          { name: 'Office', adress: 'Megenagna, Addis Ababa', coordinates: [38.7702, 9.0095] },
          { name: 'Hospital', adress: 'Gerji, Addis Ababa', coordinates: [38.7913, 9.0526] },
        ],
        total_rides: 345,
        rating: 4.9,
      },
    },
  ],

  // ===== DRIVERS =====
  drivers: [
    {
      id: 'D001',
      name: 'Addis Alemayehu',
      email: 'addis.alemayehu@email.com',
      phoneNumber: '+251912111111',
      role: 'driver',
      createdAt: new Date('2023-06-15'),
      driverProfile: {
        license_number: 'ET-DR-001-2023',
        status: 'available',
        rating: 4.9,
        total_trips: 320,
        current_location: { type: 'Point', coordinates: [38.7533, 9.0371] },
        active_vehicle: {
          plate_number: 'AA 123 ABC',
          model: 'Toyota Corolla',
          color: 'Silver',
          year: 2022,
          meter_serial_number: 'METER-001-2022',
          ride_type: 'standard',
        },
      },
    },
    {
      id: 'D002',
      name: 'Kaleab Hailu',
      email: 'kaleab.driver@email.com',
      phoneNumber: '+251912222222',
      role: 'driver',
      createdAt: new Date('2023-07-20'),
      driverProfile: {
        license_number: 'ET-DR-002-2023',
        status: 'available',
        rating: 4.8,
        total_trips: 287,
        current_location: { type: 'Point', coordinates: [38.8075, 9.0247] },
        active_vehicle: {
          plate_number: 'AA 456 DEF',
          model: 'Honda Civic',
          color: 'Black',
          year: 2021,
          meter_serial_number: 'METER-002-2021',
          ride_type: 'comfort',
        },
      },
    },
    {
      id: 'D003',
      name: 'Yohannes Kebede',
      email: 'yohannes.driver@email.com',
      phoneNumber: '+251912333333',
      role: 'driver',
      createdAt: new Date('2023-08-10'),
      driverProfile: {
        license_number: 'ET-DR-003-2023',
        status: 'on_trip',
        rating: 4.7,
        total_trips: 245,
        current_location: { type: 'Point', coordinates: [38.7467, 9.0321] },
        active_vehicle: {
          plate_number: 'AA 789 GHI',
          model: 'Hyundai i20',
          color: 'White',
          year: 2023,
          meter_serial_number: 'METER-003-2023',
          ride_type: 'standard',
        },
      },
    },
    {
      id: 'D004',
      name: 'Abebe Tsegaye',
      email: 'abebe.driver@email.com',
      phoneNumber: '+251912444444',
      role: 'driver',
      createdAt: new Date('2023-09-05'),
      driverProfile: {
        license_number: 'ET-DR-004-2023',
        status: 'offline',
        rating: 4.6,
        total_trips: 198,
        current_location: { type: 'Point', coordinates: [38.7421, 9.0298] },
        active_vehicle: {
          plate_number: 'AA 321 JKL',
          model: 'Mitsubishi Lancer',
          color: 'Blue',
          year: 2020,
          meter_serial_number: 'METER-004-2020',
          ride_type: 'premium',
        },
      },
    },
    {
      id: 'D005',
      name: 'Getnet Teshome',
      email: 'getnet.driver@email.com',
      phoneNumber: '+251912555555',
      role: 'driver',
      createdAt: new Date('2023-10-12'),
      driverProfile: {
        license_number: 'ET-DR-005-2023',
        status: 'available',
        rating: 4.9,
        total_trips: 412,
        current_location: { type: 'Point', coordinates: [38.7644, 9.0153] },
        active_vehicle: {
          plate_number: 'AA 654 MNO',
          model: 'Toyota Yaris',
          color: 'Red',
          year: 2022,
          meter_serial_number: 'METER-005-2022',
          ride_type: 'standard',
        },
      },
    },
  ],

  // ===== RIDES/BOOKINGS =====
  rides: [
    {
      id: 'RID001',
      passenger_id: 'P001',
      driver_id: 'D001',
      pickup_location: { name: 'Bole', coordinates: [38.7533, 9.0371] },
      dropoff_location: { name: 'Kazanchis', coordinates: [38.8075, 9.0247] },
      pickup_time: new Date('2024-08-29T14:30:00'),
      dropoff_time: new Date('2024-08-29T14:48:00'),
      distance: 8.5,
      fare: 145,
      commission: 21.75,
      driver_earnings: 123.25,
      status: 'completed',
      rating: 5,
      review: 'Excellent driver, very professional!',
      ride_type: 'standard',
    },
    {
      id: 'RID002',
      passenger_id: 'P002',
      driver_id: 'D002',
      pickup_location: { name: 'Piassa', coordinates: [38.7467, 9.0321] },
      dropoff_location: { name: 'Airport', coordinates: [38.7982, 8.9953] },
      pickup_time: new Date('2024-08-28T08:15:00'),
      dropoff_time: new Date('2024-08-28T09:02:00'),
      distance: 18.3,
      fare: 285,
      commission: 42.75,
      driver_earnings: 242.25,
      status: 'completed',
      rating: 4,
      review: 'Good service, arrived on time',
      ride_type: 'comfort',
    },
    {
      id: 'RID003',
      passenger_id: 'P003',
      driver_id: 'D003',
      pickup_location: { name: 'Mexico Square', coordinates: [38.7421, 9.0298] },
      dropoff_location: { name: 'Saris', coordinates: [38.7644, 9.0153] },
      pickup_time: new Date('2024-08-29T16:20:00'),
      dropoff_time: new Date('2024-08-29T16:35:00'),
      distance: 3.2,
      fare: 95,
      commission: 14.25,
      driver_earnings: 80.75,
      status: 'in_progress',
      rating: null,
      review: null,
      ride_type: 'standard',
    },
    {
      id: 'RID004',
      passenger_id: 'P001',
      driver_id: 'D002',
      pickup_location: { name: 'Kazanchis', coordinates: [38.8075, 9.0247] },
      dropoff_location: { name: '4 Kilo', coordinates: [38.7811, 9.0742] },
      pickup_time: new Date('2024-08-27T19:45:00'),
      dropoff_time: new Date('2024-08-27T20:28:00'),
      distance: 12.4,
      fare: 185,
      commission: 27.75,
      driver_earnings: 157.25,
      status: 'completed',
      rating: 5,
      review: 'Perfect ride!',
      ride_type: 'premium',
    },
    {
      id: 'RID005',
      passenger_id: 'P004',
      driver_id: 'D001',
      pickup_location: { name: 'CMC', coordinates: [38.7587, 9.0421] },
      dropoff_location: { name: 'Megenagna', coordinates: [38.7702, 9.0095] },
      pickup_time: new Date('2024-08-26T10:15:00'),
      dropoff_time: new Date('2024-08-26T10:42:00'),
      distance: 7.8,
      fare: 125,
      commission: 18.75,
      driver_earnings: 106.25,
      status: 'completed',
      rating: 4,
      review: 'Good service',
      ride_type: 'standard',
    },
  ],

  // ===== PAYMENT METHODS =====
  payment_methods: [
    {
      id: 'PM001',
      user_id: 'P001',
      type: 'card',
      provider: 'visa',
      last_four: '4242',
      is_default: true,
    },
    {
      id: 'PM002',
      user_id: 'P001',
      type: 'telebirr',
      provider: 'telebirr',
      phone: '+251912345678',
      is_default: false,
    },
    {
      id: 'PM003',
      user_id: 'P002',
      type: 'telebirr',
      provider: 'telebirr',
      phone: '+251911234567',
      is_default: true,
    },
    {
      id: 'PM004',
      user_id: 'P003',
      type: 'bank',
      provider: 'cbe',
      account_number: '****7890',
      is_default: true,
    },
  ],

  // ===== PROMO CODES =====
  promos: [
    {
      id: 'PROMO001',
      code: 'RIDE50',
      discount_type: 'percentage',
      discount_value: 50,
      max_uses: 1,
      used_count: 0,
      valid_until: new Date('2024-12-31'),
      description: '50% off your next 3 rides',
    },
    {
      id: 'PROMO002',
      code: 'SHARE2024',
      discount_type: 'fixed',
      discount_value: 500,
      max_uses: 'unlimited',
      used_count: 4,
      valid_until: new Date('2024-12-31'),
      description: 'ETB 500 per friend referral',
    },
    {
      id: 'PROMO003',
      code: 'WELCOME200',
      discount_type: 'fixed',
      discount_value: 200,
      max_uses: 1,
      used_count: 0,
      valid_until: new Date('2024-10-31'),
      description: 'ETB 200 off for new users',
    },
  ],

  // ===== REVIEWS/RATINGS =====
  reviews: [
    {
      id: 'REV001',
      ride_id: 'RID001',
      reviewer_id: 'P001',
      reviewer_type: 'passenger',
      reviewed_id: 'D001',
      rating: 5,
      comment: 'Excellent driver, very professional!',
      created_at: new Date('2024-08-29T15:00:00'),
    },
    {
      id: 'REV002',
      ride_id: 'RID001',
      reviewer_id: 'D001',
      reviewer_type: 'driver',
      reviewed_id: 'P001',
      rating: 5,
      comment: 'Great passenger, very respectful!',
      created_at: new Date('2024-08-29T15:05:00'),
    },
    {
      id: 'REV003',
      ride_id: 'RID002',
      reviewer_id: 'P002',
      reviewer_type: 'passenger',
      reviewed_id: 'D002',
      rating: 4,
      comment: 'Good service, arrived on time',
      created_at: new Date('2024-08-28T10:00:00'),
    },
  ],
};

// ===== HELPER FUNCTIONS =====

function getRandomPassenger() {
  return MOCK_DATA.passengers[Math.floor(Math.random() * MOCK_DATA.passengers.length)];
}

function getRandomDriver() {
  return MOCK_DATA.drivers[Math.floor(Math.random() * MOCK_DATA.drivers.length)];
}

function getRandomLocation() {
  return MOCK_DATA.locations[Math.floor(Math.random() * MOCK_DATA.locations.length)];
}

function getRandomVehicle() {
  return MOCK_DATA.vehicles[Math.floor(Math.random() * MOCK_DATA.vehicles.length)];
}

function generateRideId() {
  return 'RID' + String(MOCK_DATA.rides.length + 1).padStart(3, '0');
}

function estimateFare(distance) {
  // Base fare + per km rate
  const baseFare = 25;
  const perKmRate = 15;
  return baseFare + (distance * perKmRate);
}

function calculateETA(distance) {
  // Assume average speed of 30 km/h in city
  return Math.ceil(distance / 30 * 60);
}

// ===== EXPORT =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_DATA;
}

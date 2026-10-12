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

const extraPassengerBlueprints = [
  ['Helen Desta', 'helen.desta@email.com', '+251916100001', 'telebirr', 'Gerji'],
  ['Dawit Bekele', 'dawit.bekele@email.com', '+251916100002', 'wallet', 'Bole'],
  ['Selamawit Tadesse', 'selam.tadesse@email.com', '+251916100003', 'visa', 'CMC'],
  ['Nahom Girma', 'nahom.girma@email.com', '+251916100004', 'cbe_bank', 'Piassa'],
  ['Liya Mekonnen', 'liya.mekonnen@email.com', '+251916100005', 'telebirr', 'Saris'],
  ['Biruk Assefa', 'biruk.assefa@email.com', '+251916100006', 'wallet', 'Mexico Square'],
  ['Hana Worku', 'hana.worku@email.com', '+251916100007', 'visa', 'Megenagna'],
  ['Samuel Getachew', 'samuel.getachew@email.com', '+251916100008', 'telebirr', 'Airport'],
  ['Rahel Solomon', 'rahel.solomon@email.com', '+251916100009', 'wallet', '4 Kilo'],
  ['Elias Fekadu', 'elias.fekadu@email.com', '+251916100010', 'cbe_bank', 'Meskel Square'],
];

const extraDriverBlueprints = [
  ['Meron Hailu', 'meron.driver@email.com', '+251917200001', 'available', 'Bole', 'standard', 'Toyota Vitz', 'White', 'AA 101 AAA'],
  ['Tewodros Alemu', 'teddy.driver@email.com', '+251917200002', 'available', 'CMC', 'comfort', 'Honda Fit', 'Silver', 'AA 102 BBB'],
  ['Bethel Tadesse', 'bethel.driver@email.com', '+251917200003', 'available', 'Piassa', 'standard', 'Suzuki Swift', 'Blue', 'AA 103 CCC'],
  ['Kidus Mekonnen', 'kidus.driver@email.com', '+251917200004', 'available', 'Mexico Square', 'premium', 'Toyota Camry', 'Black', 'AA 104 DDD'],
  ['Saron Abebe', 'saron.driver@email.com', '+251917200005', 'available', 'Meskel Square', 'standard', 'Hyundai Accent', 'White', 'AA 105 EEE'],
  ['Henok Desta', 'henok.driver@email.com', '+251917200006', 'available', 'Saris', 'comfort', 'Kia Rio', 'Grey', 'AA 106 FFF'],
  ['Mulu Workneh', 'mulu.driver@email.com', '+251917200007', 'available', 'Megenagna', 'standard', 'Toyota Yaris', 'Red', 'AA 107 GGG'],
  ['Abel Tesfaye', 'abel.driver@email.com', '+251917200008', 'available', 'Airport', 'premium', 'Toyota Corolla', 'White', 'AA 108 HHH'],
  ['Frehiwot Girma', 'frehiwot.driver@email.com', '+251917200009', 'on_trip', 'Kazanchis', 'comfort', 'Honda Civic', 'Black', 'AA 109 III'],
  ['Yonas Kebede', 'yonas.driver@email.com', '+251917200010', 'break', 'Gerji', 'standard', 'Nissan Sunny', 'Silver', 'AA 110 JJJ'],
  ['Mahiya Nur', 'mahiya.driver@email.com', '+251917200011', 'offline', '4 Kilo', 'standard', 'Suzuki Dzire', 'White', 'AA 111 KKK'],
  ['Bereket Lemma', 'bereket.driver@email.com', '+251917200012', 'available', 'Lafto', 'comfort', 'Hyundai i20', 'Blue', 'AA 112 LLL'],
];

const locationByName = Object.fromEntries(MOCK_DATA.locations.map((place) => [place.name, place]));

extraPassengerBlueprints.forEach(([name, email, phoneNumber, payment, home], index) => {
  const place = locationByName[home] || MOCK_DATA.locations[index % MOCK_DATA.locations.length];
  MOCK_DATA.passengers.push({
    id: `P${String(index + 6).padStart(3, '0')}`,
    name,
    email,
    phoneNumber,
    role: 'passenger',
    createdAt: new Date(`2025-0${(index % 9) + 1}-12`),
    passengerProfile: {
      default_payment_method: payment,
      saved_Places: [{ name: 'Home', adress: `${place.name}, Addis Ababa`, coordinates: place.coordinates }],
      total_rides: 12 + index * 7,
      rating: 4.5 + (index % 5) * 0.1,
      wallet_balance: 800 + index * 250,
      wallet_history: [
        {
          type: 'topup',
          amount: 800 + index * 250,
          note: 'Seed Telebirr top-up',
          createdAt: new Date('2026-10-01T09:00:00'),
        },
      ],
    },
  });
});

MOCK_DATA.passengers.forEach((passenger, index) => {
  if (passenger.passengerProfile.wallet_balance != null) return;
  passenger.passengerProfile.wallet_balance = 1500 + index * 400;
  passenger.passengerProfile.wallet_history = [
    {
      type: 'topup',
      amount: 1500 + index * 400,
      note: 'Seed wallet balance',
      createdAt: new Date('2026-09-20T08:00:00'),
    },
  ];
});

extraDriverBlueprints.forEach(([name, email, phoneNumber, status, area, rideType, model, color, plate], index) => {
  const place = locationByName[area] || MOCK_DATA.locations[index % MOCK_DATA.locations.length];
  const jitter = ((index % 4) - 1.5) * 0.004;
  MOCK_DATA.vehicles.push({
    id: `VEH${String(index + 6).padStart(3, '0')}`,
    plate_number: plate,
    model,
    color,
    year: 2021 + (index % 4),
    meter_serial_number: `METER-${String(index + 6).padStart(3, '0')}-2026`,
    type: 'sedan',
    capacity: 4,
  });
  MOCK_DATA.drivers.push({
    id: `D${String(index + 6).padStart(3, '0')}`,
    name,
    email,
    phoneNumber,
    role: 'driver',
    createdAt: new Date(`2024-0${(index % 9) + 1}-18`),
    driverProfile: {
      license_number: `ET-DR-${String(index + 6).padStart(3, '0')}-2024`,
      status,
      rating: 4.4 + (index % 6) * 0.1,
      total_trips: 80 + index * 18,
      current_location: {
        type: 'Point',
        coordinates: [place.coordinates[0] + jitter, place.coordinates[1] + jitter / 2],
      },
      active_vehicle: {
        plate_number: plate,
        model,
        color,
        year: 2021 + (index % 4),
        meter_serial_number: `METER-${String(index + 6).padStart(3, '0')}-2026`,
        ride_type: rideType,
      },
    },
  });
});

const extraRideBlueprints = [
  ['RID006', 'P001', 'D001', 'Bole', 'Airport', 'completed', 'wallet', 2026, 10, 8, 8, 32, 18.2, 268],
  ['RID007', 'P002', 'D002', 'Piassa', 'Kazanchis', 'completed', 'cash', 2026, 10, 9, 12, 18, 6.4, 118],
  ['RID008', 'P006', 'D006', 'Gerji', 'Bole', 'completed', 'wallet', 2026, 10, 10, 7, 22, 9.1, 154],
  ['RID009', 'P007', 'D007', 'CMC', 'Megenagna', 'completed', 'card', 2026, 10, 11, 18, 40, 5.8, 132],
  ['RID010', 'P003', 'D008', 'Mexico Square', '4 Kilo', 'cancelled', 'cash', 2026, 10, 11, 9, 5, 4.1, 0],
  ['RID011', 'P008', 'D009', 'Saris', 'Airport', 'requested', 'cash', 2026, 10, 12, 9, 0, 11.4, 186],
  ['RID012', 'P001', 'D010', 'Bole', 'Kazanchis', 'accepted', 'wallet', 2026, 10, 12, 10, 8, 8.5, 145],
  ['RID013', 'P009', 'D014', 'Megenagna', 'Bole', 'arrived', 'mobile_money', 2026, 10, 12, 11, 15, 7.2, 138],
  ['RID014', 'P010', 'D003', 'Airport', 'Bole', 'picked_up', 'cash', 2026, 10, 12, 14, 22, 12.6, 210],
  ['RID015', 'P011', 'D008', '4 Kilo', 'Piassa', 'picked_up', 'wallet', 2026, 10, 12, 16, 18, 6.9, 128],
  ['RID016', 'P005', 'D005', 'CMC', 'Gerji', 'completed', 'wallet', 2026, 10, 7, 19, 28, 4.8, 98],
  ['RID017', 'P012', 'D012', 'Lafto', 'Meskel Square', 'completed', 'cash', 2026, 10, 6, 13, 35, 10.3, 176],
  ['RID018', 'P004', 'D011', 'Kazanchis', 'Saris', 'cancelled', 'cash', 2026, 10, 5, 21, 4, 9.7, 0],
  ['RID019', 'P015', 'D001', 'Meskel Square', 'Airport', 'completed', 'wallet', 2026, 10, 4, 6, 48, 16.1, 242],
  ['RID020', 'P001', 'D006', 'Bole', 'Piassa', 'completed', 'cash', 2026, 10, 3, 17, 16, 3.4, 78],
];

extraRideBlueprints.forEach((row) => {
  const [id, passengerId, driverId, pickupName, dropoffName, status, payment, year, month, day, hour, minutes, distance, fare] = row;
  const pickup = locationByName[pickupName];
  const dropoff = locationByName[dropoffName];
  const pickupTime = new Date(Date.UTC(year, month - 1, day, hour - 3, 10, 0));
  const dropoffTime = new Date(pickupTime.getTime() + minutes * 60 * 1000);
  MOCK_DATA.rides.push({
    id,
    passenger_id: passengerId,
    driver_id: driverId,
    pickup_location: { name: pickupName, coordinates: pickup.coordinates },
    dropoff_location: { name: dropoffName, coordinates: dropoff.coordinates },
    pickup_time: pickupTime,
    dropoff_time: dropoffTime,
    distance,
    fare,
    commission: Number((fare * 0.15).toFixed(2)),
    driver_earnings: Number((fare * 0.85).toFixed(2)),
    status,
    payment_method: payment,
    rating: status === 'completed' ? 5 : null,
    review: status === 'completed' ? 'Seeded trip for flow testing' : null,
    ride_type: 'standard',
    meter:
      status === 'picked_up' || status === 'arrived'
        ? {
            fare: Math.round(fare * 0.55),
            distance_km: Number((distance * 0.45).toFixed(2)),
            waiting_seconds: 90,
            extras: 0,
            status: 'hired',
            meter_serial_number: 'METER-LIVE',
            recorded_at: pickupTime,
          }
        : undefined,
  });
});

MOCK_DATA.rides.forEach((ride) => {
  if (ride.pickup_time.getFullYear() < 2026) {
    ride.pickup_time = new Date(ride.pickup_time);
    ride.pickup_time.setFullYear(2026);
    ride.pickup_time.setMonth(9);
    ride.dropoff_time = new Date(ride.dropoff_time);
    ride.dropoff_time.setFullYear(2026);
    ride.dropoff_time.setMonth(9);
  }
  if (!ride.payment_method) ride.payment_method = 'cash';
});

function calculateETA(distance) {
  // Assume average speed of 30 km/h in city
  return Math.ceil(distance / 30 * 60);
}

// ===== EXPORT =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_DATA;
}

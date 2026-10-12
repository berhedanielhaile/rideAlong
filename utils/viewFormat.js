exports.formatMoney = (amount) =>
  `ETB ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

exports.formatTripWhen = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
};

exports.initialsFor = (name = '') =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'RA';

exports.greetingForHour = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

exports.ratingHint = (rating) => {
  if (rating == null) return 'No ratings yet';
  if (rating >= 4.7) return 'Excellent';
  if (rating >= 4.2) return 'Very good';
  if (rating >= 3.5) return 'Good';
  return 'Keep riding';
};

exports.tripTitle = (trip) =>
  `${(trip.pickup && trip.pickup.adress) || 'Pickup'} to ${(trip.dropoff && trip.dropoff.adress) || 'Drop-off'}`;

exports.startOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

exports.startOfWeek = () => {
  const date = new Date();
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

exports.startOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);

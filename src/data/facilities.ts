import { Facility } from '../types';

export const CAMPUS_FACILITIES: Facility[] = [
  {
    id: 'rec-center-main',
    number: '01',
    name: 'Student Recreation Center Courts',
    type: 'Multi-Sport Fieldhouse',
    sport: 'basketball',
    location: 'North Campus Athletic Complex, 2nd Floor',
    surface: 'Hardwood Maple Flooring',
    capacity: '10 players per court',
    status: 'available',
    currentOccupancy: '2 / 4 Courts Active',
    features: ['Electronic Scoreboards', 'Locker Room Access', 'Water Refill Stations', 'Climate Controlled']
  },
  {
    id: 'west-tennis-complex',
    number: '02',
    name: 'West Campus Tennis & Pickleball Courts',
    type: 'Outdoor Lighted Courts',
    sport: 'tennis',
    location: 'West Recreation Quad (Near Stadium)',
    surface: 'Plexipave Acrylic Cushion',
    capacity: '4 players per court',
    status: 'available',
    currentOccupancy: '3 / 6 Courts Active',
    features: ['LED Night Lighting', 'Shaded Player Benches', 'Ball Machine Rental', 'Wind Screens']
  },
  {
    id: 'pavilion-badminton',
    number: '03',
    name: 'North Pavilion Badminton & Volleyball Hall',
    type: 'Indoor Arena',
    sport: 'badminton',
    location: 'Pavilion Hall B',
    surface: 'Taraflex Pro Synthetic Floor',
    capacity: '4 players per court',
    status: 'available',
    currentOccupancy: '4 / 8 Courts Active',
    features: ['Olympic Regulation Nets', 'High Ceilings (12m)', 'Anti-Glare Fixtures', 'Racket Grip Stations']
  },
  {
    id: 'squash-arena',
    number: '04',
    name: 'Glassback Squash & Racquetball Arena',
    type: 'Indoor Championship Court',
    sport: 'squash',
    location: 'Lower Level Athletic Concourse',
    surface: 'Spring Hardwood Flooring',
    capacity: '2 players per court',
    status: 'available',
    currentOccupancy: '1 / 3 Courts Active',
    features: ['Full Glass Backwall', 'Viewing Gallery', 'Impact Tested Walls', 'Air Turnover Ventilation']
  }
];

export const TIME_SLOTS = [
  { value: '07:00', label: '07:00 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '21:00', label: '09:00 PM' },
  { value: '22:00', label: '10:00 PM' },
];

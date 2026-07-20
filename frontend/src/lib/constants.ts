import type { ServiceType, Vehicle } from '../types';

export const SERVICES: { title: ServiceType; description: string; icon: string }[] = [
  { title: 'Airport Transfer', description: 'Seamless rides to and from Changi Airport.', icon: 'Plane' },
  { title: 'City Transfer', description: 'Point-to-point transfers across Singapore.', icon: 'MapPin' },
  { title: 'Hourly Rental', description: 'Keep a car and driver at your disposal.', icon: 'Clock' },
  { title: 'Outstation', description: 'Cross-border trips to Malaysia.', icon: 'Map' },
  { title: 'Corporate', description: 'Business travel solutions and billing.', icon: 'Briefcase' },
  { title: 'Package Delivery', description: 'Secure document and parcel delivery.', icon: 'Package' },
  { title: 'Accessible Rides', description: 'Wheelchair accessible vehicles.', icon: 'Accessibility' },
  { title: 'Group Shuttle', description: 'Mini-buses and coaches for groups.', icon: 'Users' },
];

export const VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'Sedan', type: 'Standard', capacity: 4, basePrice: 5, image: '/vehicles/sedan.png' },
  { id: 'v2', name: 'SUV', type: 'Premium', capacity: 6, basePrice: 8, image: '/vehicles/suv.png' },
  { id: 'v3', name: 'Luxury', type: 'First Class', capacity: 4, basePrice: 15, image: '/vehicles/luxury.png' },
];

export const FARE_PER_KM = {
  'Standard': 1.5,
  'Premium': 2.2,
  'First Class': 3.5
};

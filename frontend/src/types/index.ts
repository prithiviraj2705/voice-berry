export type User = {
  id: string;
  email: string;
  phone?: string | null;
  name?: string | null;
  avatar?: string | null;
  preferredLanguage?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ServiceType = 'Airport Transfer' | 'City Transfer' | 'Hourly Rental' | 'Outstation' | 'Corporate' | 'Package Delivery' | 'Accessible Rides' | 'Group Shuttle';

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type Booking = {
  id: string;
  userId: string;
  serviceType: ServiceType;
  pickup: string;
  destination?: string | null;
  datetime: string;
  passengers: number;
  flightNumber?: string | null;
  vehicleType: string;
  specialInstructions?: string | null;
  status: BookingStatus;
  fare: number;
  paymentMethod?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RideStatus = 'assigned' | 'arriving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export type Ride = {
  id: string;
  bookingId: string;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleModel?: string | null;
  vehiclePlate?: string | null;
  status: RideStatus;
  trackingUrl?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type Address = {
  id: string;
  userId: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  iconType: string;
};

export type Vehicle = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  image: string;
};

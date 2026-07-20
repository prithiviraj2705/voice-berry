import { FARE_PER_KM } from './constants';

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
};

export const calculateFareAmount = (
  vehicle: any, 
  distance: number | null, 
  showDestination: boolean, 
  duration: number = 4
): number | null => {
  if (showDestination) {
    if (distance === null) return null;
    return vehicle.basePrice + (distance * FARE_PER_KM[vehicle.type as keyof typeof FARE_PER_KM]);
  } else {
    // For non-destination services (e.g. Hourly Rental)
    return vehicle.basePrice + (duration * 15);
  }
};
